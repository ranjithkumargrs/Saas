import { CalendarDays, ChevronDown, Clock3, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import useLocalStorage from '../hooks/useLocalStorage'
import { schedulePeople, schedules as initialSchedules } from '../data/dashboardData'

const weekDays = ['S', 'S', 'M', 'T', 'W', 'T', 'F']

function toDateInput(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatScheduleDate(value) {
  const date = new Date(`${value}T00:00:00`)
  return `${String(date.getDate()).padStart(2, '0')} ${new Intl.DateTimeFormat('en', { month: 'short' }).format(date)}, ${date.getFullYear()}`
}

function toTimeInput(value) {
  const match = value.match(/^(\d{1,2})[.:](\d{2})\s*(AM|PM)$/i)
  if (!match) return value
  let hours = Number(match[1]) % 12
  if (match[3].toUpperCase() === 'PM') hours += 12
  return `${String(hours).padStart(2, '0')}:${match[2]}`
}

function formatScheduleTime(value) {
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return value
  const hour = Number(match[1])
  return `${String(hour % 12 || 12).padStart(2, '0')}.${match[2]}${hour >= 12 ? 'PM' : 'AM'}`
}

export default function Schedule() {
  const [items, setItems] = useLocalStorage('saas-dashboard-schedules', initialSchedules)
  const [peopleQuery, setPeopleQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [sortConfig, setSortConfig] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date(2021, 11, 1))
  const [calendarFocus, setCalendarFocus] = useState(new Date(2021, 11, 2))
  const [selectedDate, setSelectedDate] = useState(new Date(2021, 11, 3))

  const people = useMemo(
    () => schedulePeople.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(peopleQuery.toLowerCase())),
    [peopleQuery],
  )
  const filtered = useMemo(
    () => {
      const visibleItems = items.filter((item) => selectedPerson === null || item.personId === selectedPerson)
      if (!sortConfig) return visibleItems
      const direction = sortConfig.direction === 'asc' ? 1 : -1
      return [...visibleItems].sort((first, second) => {
        const firstValue = sortConfig.key === 'date'
          ? new Date(first.date).getTime()
          : sortConfig.key === 'time'
            ? toTimeInput(first.time)
            : first.location
        const secondValue = sortConfig.key === 'date'
          ? new Date(second.date).getTime()
          : sortConfig.key === 'time'
            ? toTimeInput(second.time)
            : second.location
        return (typeof firstValue === 'number' && typeof secondValue === 'number'
          ? firstValue - secondValue
          : String(firstValue).localeCompare(String(secondValue), undefined, { sensitivity: 'base' })) * direction
      })
    },
    [items, selectedPerson, sortConfig],
  )
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long' }).format(calendarMonth)
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const dayCount = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const startOffset = (firstDay.getDay() + 6) % 7
  const cellCount = Math.max(35, Math.ceil((startOffset + dayCount) / 7) * 7)
  const calendarDays = Array.from({ length: cellCount }, (_, index) => new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth(),
    index - startOffset + 1,
  ))
  const allFilteredSelected = filtered.length > 0 && filtered.every((item) => selectedRows.includes(item.id))
  const editingItem = items.find((item) => item.id === editingId)

  const moveMonth = (amount) => {
    const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + amount, 1)
    setCalendarMonth(nextMonth)
    setCalendarFocus(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 2))
    setSelectedDate((current) => {
      const lastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(current.getDate(), lastDay))
    })
  }

  const openCreateForm = () => {
    setEditingId(null)
    setShowForm(true)
  }

  const save = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const date = form.get('date')
    const newItem = {
      id: editingId || `schedule-${Date.now()}`,
      date: formatScheduleDate(date),
      time: formatScheduleTime(form.get('time')),
      location: form.get('location').trim(),
      personId: form.get('personId'),
    }

    if (editingId === null) setItems((current) => [newItem, ...current])
    else setItems((current) => current.map((item) => item.id === editingId ? newItem : item))
    setShowForm(false)
    setEditingId(null)
  }

  const toggleRow = (id) => {
    setSelectedRows((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id])
  }

  const toggleAllRows = () => {
    setSelectedRows((current) => allFilteredSelected
      ? current.filter((id) => !filtered.some((item) => item.id === id))
      : [...new Set([...current, ...filtered.map((item) => item.id)])])
  }

  const sortBy = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const deleteSchedule = (id) => {
    setItems((current) => current.filter((item) => item.id !== id))
    setSelectedRows((current) => current.filter((selectedId) => selectedId !== id))
  }

  const resetScheduleView = () => {
    setPeopleQuery('')
    setSelectedPerson(null)
    setSelectedRows([])
  }

  return (
    <div className="section-page schedule-page">
      <div className="page-toolbar">
        <div>
          <h1 className="page-title">Schedule List</h1>
          <p className="page-subtitle">Organize your upcoming meetings and events. <Link className="schedule-task-link" to="/projects">Task Preview</Link></p>
        </div>
        <Button onClick={openCreateForm}><Plus size={16} /> Add New</Button>
      </div>
      <div className="schedule-layout">
        <aside className="panel schedule-aside">
          <Button className="full-button schedule-create-button" onClick={openCreateForm}><Plus size={22} /> Create Schedule</Button>
          <div className="mini-calendar">
            <div className="mini-cal-heading">
              <b>{monthLabel} {calendarFocus.getDate()}, {calendarFocus.getFullYear()}</b>
              <span>
                <button aria-label="Previous month" onClick={() => moveMonth(-1)}>‹</button>
                <button aria-label="Next month" onClick={() => moveMonth(1)}>›</button>
              </span>
            </div>
            <div className="mini-days">
              {weekDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              {calendarDays.map((date) => {
                const inCurrentMonth = date.getMonth() === calendarMonth.getMonth()
                const isSelected = date.toDateString() === selectedDate.toDateString()
                return (
                  <button
                    className={`${inCurrentMonth ? '' : 'outside-month'} ${isSelected ? 'today' : ''}`}
                    key={date.toISOString()}
                    aria-label={new Intl.DateTimeFormat('en', { dateStyle: 'full' }).format(date)}
                    aria-pressed={isSelected}
                    onClick={() => {
                      setSelectedDate(date)
                      setCalendarFocus(date)
                      if (!inCurrentMonth) setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1))
                    }}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
          <h2>People</h2>
          <SearchBar value={peopleQuery} onChange={setPeopleQuery} placeholder="Search for People" />
          <div className="people-list">
            {people.map((person) => (
              <button
                className={`people-item ${selectedPerson === person.id ? 'people-item-active' : ''}`}
                key={person.id}
                aria-pressed={selectedPerson === person.id}
                onClick={() => setSelectedPerson((current) => current === person.id ? null : person.id)}
              >
                <span className="schedule-person-avatar" style={{ '--person-index': schedulePeople.indexOf(person) }} />
                <span className="people-copy">{person.name}<small>{person.email}</small></span>
              </button>
            ))}
            {people.length === 0 && <p className="schedule-empty-people">No people found.</p>}
          </div>
          <button className="button button-outline full-button schedule-my-button" onClick={resetScheduleView}>My Schedule</button>
        </aside>
        <section className="schedule-list" aria-label="Schedules">
          <div className="schedule-list-tools">
            <label className="schedule-select-all"><input type="checkbox" aria-label="Select all schedules" checked={allFilteredSelected} onChange={toggleAllRows} /></label>
            {['Date', 'Time', 'Location'].map((label) => {
              const key = label.toLowerCase()
              return (
                <button
                  className={sortConfig?.key === key ? 'schedule-sort-active' : ''}
                  type="button"
                  aria-label={`Sort by ${label}`}
                  aria-pressed={sortConfig?.key === key}
                  key={key}
                  onClick={() => sortBy(key)}
                >
                  {label}<ChevronDown size={14} className={sortConfig?.key === key && sortConfig.direction === 'asc' ? 'schedule-sort-ascending' : ''} />
                </button>
              )
            })}
            <span aria-hidden="true" />
          </div>
          <div className="schedule-rows">
            {filtered.map((item) => (
              <article className="schedule-row" key={item.id}>
                <input type="checkbox" aria-label={`Select schedule on ${item.date}`} checked={selectedRows.includes(item.id)} onChange={() => toggleRow(item.id)} />
                <span className="schedule-date"><CalendarDays size={15} />{item.date}</span>
                <span className="schedule-time"><Clock3 size={15} />{item.time}</span>
                <span className="location-pill"><MapPin size={14} />{item.location}</span>
                <div className="row-actions">
                  <button aria-label={`Edit schedule on ${item.date}`} onClick={() => { setEditingId(item.id); setShowForm(true) }}><Pencil size={15} /></button>
                  <button aria-label={`Delete schedule on ${item.date}`} onClick={() => deleteSchedule(item.id)}><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <p className="empty-state">No schedules for this person.</p>}
          </div>
        </section>
      </div>
      {showForm && (
        <Modal title={editingId === null ? 'Create a Schedule' : 'Edit Schedule'} onClose={() => setShowForm(false)}>
          <form className="form-stack" onSubmit={save}>
            <label>Date<input name="date" type="date" defaultValue={editingItem ? toDateInput(editingItem.date) : toDateInput(selectedDate.toISOString())} required /></label>
            <label>Time<input name="time" type="time" defaultValue={editingItem ? toTimeInput(editingItem.time) : '10:15'} required /></label>
            <label>Location<input name="location" defaultValue={editingItem?.location || ''} placeholder="Office Meeting" required /></label>
            <label>Person<select name="personId" defaultValue={editingItem?.personId || selectedPerson || schedulePeople[0].id}>{schedulePeople.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label>
            <Button type="submit">Save Schedule</Button>
          </form>
        </Modal>
      )}
    </div>
  )
}

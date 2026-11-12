import { ChevronLeft, ChevronRight, Clock3, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import useLocalStorage from '../hooks/useLocalStorage'
import { schedulePeople } from '../data/dashboardData'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const fullWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const views = ['Day', 'Week', 'Month', 'Year']
const hours = [...Array.from({ length: 15 }, (_, index) => index + 9), 0, 1]
const eventColors = ['cyan', 'pink', 'coral', 'green', 'violet']

const initialEvents = [
  { id: 'calendar-1', date: '2021-12-02', title: 'Invited by friends', type: 'Reminder', color: 'coral', startTime: '09:00', endTime: '10:00', personId: 'eddie' },
  { id: 'calendar-2', date: '2021-12-02', title: 'Prayer Time', type: 'Event', color: 'cyan', startTime: '12:00', endTime: '13:00', personId: 'alexey' },
  { id: 'calendar-3', date: '2021-12-02', title: 'lunch Time', type: 'Event', color: 'coral', startTime: '14:00', endTime: '15:00', personId: 'anton' },
  { id: 'calendar-4', date: '2021-12-02', title: 'Prayer Time', type: 'Event', color: 'green', startTime: '18:00', endTime: '19:00', personId: 'eddie' },
  { id: 'calendar-5', date: '2021-12-02', title: 'Dinner Time', type: 'Event', color: 'violet', startTime: '21:00', endTime: '22:00', personId: 'alexey' },
  { id: 'calendar-6', date: '2021-12-16', title: 'Victory day', type: 'Event', color: 'coral', startTime: '10:00', endTime: '11:00', personId: 'anton' },
  { id: 'calendar-7', date: '2021-12-21', title: 'Invited by friends', type: 'Reminder', color: 'pink', startTime: '17:00', endTime: '18:00', personId: 'eddie' },
  { id: 'calendar-8', date: '2021-12-25', title: 'Christmas Day', type: 'Event', color: 'cyan', startTime: '10:00', endTime: '11:00', personId: 'alexey' },
]

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function fromDateKey(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

function getMonthDates(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const count = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const cellCount = Math.ceil((offset + count) / 7) * 7
  return Array.from({ length: cellCount }, (_, index) => new Date(
    date.getFullYear(),
    date.getMonth(),
    index - offset + 1,
  ))
}

function getWeekDates(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay())
  return Array.from({ length: 7 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index))
}

function formatTime(hour) {
  return `${String(hour % 12 || 12).padStart(2, '0')}:00 ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function Calendar() {
  const [view, setView] = useState('Month')
  const [date, setDate] = useState(new Date(2021, 11, 2))
  const [events, setEvents] = useLocalStorage('saas-dashboard-calendar-events', initialEvents)
  const [peopleQuery, setPeopleQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formSeed, setFormSeed] = useState({ date: toDateKey(new Date(2021, 11, 2)), startTime: '10:00' })
  const [selectedDay, setSelectedDay] = useState(null)

  const monthDates = useMemo(() => getMonthDates(date), [date])
  const weekDates = useMemo(() => getWeekDates(date), [date])
  const monthLabel = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date)
  const visiblePeople = schedulePeople.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(peopleQuery.toLowerCase()))
  const visibleEvents = events.filter((event) => selectedPerson === null || event.personId === selectedPerson)
  const eventByDate = useMemo(() => visibleEvents.reduce((grouped, event) => {
    grouped[event.date] = [...(grouped[event.date] || []), event]
    return grouped
  }, {}), [visibleEvents])
  const editingEvent = events.find((event) => event.id === editingId)
  const dayEvents = selectedDay ? (eventByDate[selectedDay] || []) : []

  const movePeriod = (amount) => {
    setDate((current) => {
      if (view === 'Day') return new Date(current.getFullYear(), current.getMonth(), current.getDate() + amount)
      if (view === 'Week') return new Date(current.getFullYear(), current.getMonth(), current.getDate() + amount * 7)
      if (view === 'Year') return new Date(current.getFullYear() + amount, current.getMonth(), current.getDate())
      return new Date(current.getFullYear(), current.getMonth() + amount, Math.min(current.getDate(), new Date(current.getFullYear(), current.getMonth() + amount + 1, 0).getDate()))
    })
  }

  const moveMiniMonth = (amount) => {
    setDate((current) => {
      if (view === 'Year') return new Date(current.getFullYear() + amount, current.getMonth(), current.getDate())
      const month = new Date(current.getFullYear(), current.getMonth() + amount, 1)
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
      return new Date(month.getFullYear(), month.getMonth(), Math.min(current.getDate(), lastDay))
    })
  }

  const openCreateForm = (eventDate = date, startTime = '10:00') => {
    setEditingId(null)
    const [hour, minute] = startTime.split(':').map(Number)
    const endTime = `${String((hour + 1) % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    setFormSeed({ date: toDateKey(eventDate), startTime, endTime })
    setSelectedDay(null)
    setShowForm(true)
  }

  const openEditForm = (event) => {
    setEditingId(event.id)
    setFormSeed({ date: event.date, startTime: event.startTime })
    setSelectedDay(null)
    setShowForm(true)
  }

  const saveEvent = (formEvent) => {
    formEvent.preventDefault()
    const form = new FormData(formEvent.currentTarget)
    const startTime = form.get('startTime')
    const endTime = form.get('endTime')
    if (endTime === startTime) {
      const endTimeInput = formEvent.currentTarget.elements.namedItem('endTime')
      endTimeInput.setCustomValidity('End time must differ from the start time.')
      endTimeInput.reportValidity()
      endTimeInput.setCustomValidity('')
      return
    }

    const nextEvent = {
      id: editingId || `calendar-${Date.now()}`,
      date: form.get('date'),
      title: form.get('title').trim(),
      type: form.get('type'),
      color: form.get('color'),
      startTime,
      endTime,
      personId: form.get('personId'),
    }

    if (editingId) setEvents((current) => current.map((event) => event.id === editingId ? nextEvent : event))
    else setEvents((current) => [...current, nextEvent])
    setShowForm(false)
    setEditingId(null)
  }

  const deleteEvent = (id) => {
    setEvents((current) => current.filter((event) => event.id !== id))
    setSelectedDay((current) => current && (eventByDate[current] || []).length <= 1 ? null : current)
  }

  const renderEvent = (event, compact = false) => (
    <button
      className={`event-tag event-${event.color} ${compact ? 'event-tag-compact' : ''}`}
      key={event.id}
      title={`${event.title} · ${event.startTime}`}
      onClick={(clickEvent) => {
        clickEvent.stopPropagation()
        openEditForm(event)
      }}
    >
      {event.title}
    </button>
  )

  const renderMonth = (monthDate, mini = false) => {
    const dates = getMonthDates(monthDate)
    return (
      <div className={mini ? 'mini-month-grid' : 'month-calendar'}>
        {!mini && <div className="weekday-row">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>}
        <div className={mini ? 'mini-month-days' : 'month-grid'}>
          {dates.map((cellDate) => {
            const key = toDateKey(cellDate)
            const cellEvents = eventByDate[key] || []
            const inMonth = cellDate.getMonth() === monthDate.getMonth()
            const isSelected = key === toDateKey(date)
            if (mini) {
              return (
                <button
                  type="button"
                  className={`${inMonth ? '' : 'outside-month'} ${isSelected ? 'today' : ''} ${cellEvents.length ? 'has-events' : ''}`}
                  key={key}
                  aria-label={formatLongDate(cellDate)}
                  aria-pressed={isSelected}
                  onClick={() => setDate(cellDate)}
                >
                  {cellDate.getDate()}
                </button>
              )
            }
            return (
              <article className={`month-cell ${isSelected ? 'current-day' : ''} ${!inMonth ? 'muted-day' : ''}`} key={key}>
                <button
                  type="button"
                  className="calendar-date-button"
                  aria-label={`Select ${formatLongDate(cellDate)}`}
                  aria-pressed={isSelected}
                  onClick={() => setDate(cellDate)}
                >
                  {String(cellDate.getDate()).padStart(2, '0')}
                </button>
                <div className="calendar-cell-events">
                  {cellEvents.slice(0, 2).map((event) => renderEvent(event, true))}
                  {cellEvents.length >= 2 && (
                    <button className="calendar-more-events" onClick={() => setSelectedDay(key)}>
                      More
                    </button>
                  )}
                  {cellEvents.length === 0 && inMonth && (
                    <button className="calendar-add-day" aria-label={`Add schedule on ${formatLongDate(cellDate)}`} onClick={() => openCreateForm(cellDate)}>
                      <Plus size={13} />
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTimedView = (days) => (
    <div className={`calendar-time-view ${days.length === 1 ? 'calendar-day-view' : ''}`}>
      <div className="calendar-time-heading">
        <span />
        {days.map((day) => (
          <button key={toDateKey(day)} onClick={() => { setDate(day); setView('Day') }}>
            <small>{fullWeekdays[day.getDay()]}</small>
            <b className={toDateKey(day) === toDateKey(date) ? 'calendar-time-heading-selected' : ''}>{String(day.getDate()).padStart(2, '0')}</b>
          </button>
        ))}
      </div>
      <div className="calendar-time-body">
        {hours.map((hour) => (
          <div className="calendar-time-row" key={hour}>
            <span className="calendar-time-label">{formatTime(hour)}</span>
            {days.map((day) => {
              const dateEvents = [...(eventByDate[toDateKey(day)] || [])].sort((first, second) => first.startTime.localeCompare(second.startTime))
              const cellEvents = dateEvents.filter((event) => Number(event.startTime.slice(0, 2)) === hour)
              const dayEventIndex = days.length === 1 ? dateEvents.findIndex((event) => event.id === cellEvents[0]?.id) : -1
              return (
                <div className={`calendar-time-slot ${dayEventIndex >= 0 ? `calendar-time-slot-position-${dayEventIndex % 5}` : ''}`} key={toDateKey(day)} onDoubleClick={() => openCreateForm(day, `${String(hour).padStart(2, '0')}:00`)}>
                  {cellEvents.map((event) => renderEvent(event))}
                  <button className="calendar-add-slot" aria-label={`Add schedule ${formatTime(hour)} ${formatLongDate(day)}`} onClick={() => openCreateForm(day, `${String(hour).padStart(2, '0')}:00`)}><Plus size={13} /></button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )

  const renderYear = () => (
    <div className="calendar-year-grid">
      {Array.from({ length: 12 }, (_, month) => {
        const monthDate = new Date(date.getFullYear(), month, 1)
        const dates = getMonthDates(monthDate)
        return (
          <section className="calendar-year-month" key={month}>
            <button className="calendar-year-month-title" onClick={() => { setDate(monthDate); setView('Month') }}>
              {new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(monthDate)}
            </button>
            <div className="calendar-year-weekdays">{weekdays.map((day, index) => <span key={`${day}-${index}`}>{day[0]}</span>)}</div>
            <div className="calendar-year-days">
              {dates.map((cellDate) => {
                const inMonth = cellDate.getMonth() === month
                const hasEvents = Boolean((eventByDate[toDateKey(cellDate)] || []).length)
                return (
                  <button
                    className={`${inMonth ? '' : 'outside-month'} ${hasEvents ? 'has-events' : ''} ${toDateKey(cellDate) === toDateKey(date) ? 'today' : ''}`}
                    key={toDateKey(cellDate)}
                    disabled={!inMonth}
                    onClick={() => { setDate(cellDate); setView('Month') }}
                  >
                    {cellDate.getDate()}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )

  const activeRangeLabel = view === 'Year'
    ? String(date.getFullYear())
    : view === 'Week'
      ? `${formatLongDate(weekDates[0])} – ${formatLongDate(weekDates[6])}`
      : view === 'Day'
        ? formatLongDate(date)
        : monthLabel

  return (
    <div className={`section-page calendar-page ${view === 'Year' ? 'calendar-page-year' : ''}`}>
      <div className="page-toolbar calendar-page-toolbar">
        <h1 className="page-title">Calendar</h1>
        <div className="calendar-view-tabs" role="group" aria-label="Calendar view">
          {views.map((tab) => (
            <button key={tab} onClick={() => setView(tab)} className={`view-tab ${view === tab ? 'selected' : ''}`} aria-pressed={view === tab}>
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className={`calendar-layout ${view === 'Year' ? 'calendar-layout-year' : ''}`}>
        <aside className="panel calendar-side">
          <Button className="full-button calendar-create-button" onClick={() => openCreateForm()}>
            <Plus size={17} /> Create Schedule
          </Button>
          <div className="mini-calendar">
            <div className="mini-cal-heading">
              <b>{formatLongDate(date)}</b>
              <span>
                <button aria-label={view === 'Year' ? 'Previous year' : 'Previous month'} onClick={() => moveMiniMonth(-1)}><ChevronLeft size={15} /></button>
                <button aria-label={view === 'Year' ? 'Next year' : 'Next month'} onClick={() => moveMiniMonth(1)}><ChevronRight size={15} /></button>
              </span>
            </div>
            <div className="mini-days">
              {weekdays.map((day, index) => <span key={`${day}-${index}`}>{day[0]}</span>)}
              {monthDates.map((cellDate) => {
                const key = toDateKey(cellDate)
                const inMonth = cellDate.getMonth() === date.getMonth()
                return (
                  <button
                    key={key}
                    className={`${inMonth ? '' : 'outside-month'} ${key === toDateKey(date) ? 'today' : ''} ${(eventByDate[key] || []).length ? 'has-events' : ''}`}
                    aria-label={formatLongDate(cellDate)}
                    aria-pressed={key === toDateKey(date)}
                    onClick={() => setDate(cellDate)}
                  >
                    {cellDate.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="calendar-people-heading">
            <h2>People</h2>
            {selectedPerson && <button onClick={() => setSelectedPerson(null)}>Clear</button>}
          </div>
          <label className="search-field calendar-people-search">
            <Search size={15} />
            <input value={peopleQuery} onChange={(event) => setPeopleQuery(event.target.value)} placeholder="Search for People" aria-label="Search for people" />
          </label>
          <div className="people-list calendar-people-list">
            {visiblePeople.map((person) => {
              const index = schedulePeople.indexOf(person)
              return (
                <button
                  className={`people-item calendar-person-item ${selectedPerson === person.id ? 'people-item-active' : ''}`}
                  key={person.id}
                  aria-pressed={selectedPerson === person.id}
                  onClick={() => setSelectedPerson((current) => current === person.id ? null : person.id)}
                >
                  <span className="schedule-person-avatar" style={{ '--person-index': index }} />
                  <span className="calendar-person-copy"><span>{person.name}</span><small>{person.email}</small></span>
                </button>
              )
            })}
            {visiblePeople.length === 0 && <p className="schedule-empty-people">No people found.</p>}
          </div>
          <button className="button button-outline full-button calendar-my-schedule" onClick={() => { setSelectedPerson(null); setPeopleQuery('') }}>
            My Schedule
          </button>
        </aside>
        <section className={`calendar-main calendar-main-${view.toLowerCase()} panel`} aria-label={`${view} calendar`}>
          {view !== 'Year' && (
            <div className="calendar-toolbar">
              <span>{formatLongDate(date)}</span>
              <div>
                {view === 'Week' && <strong>{activeRangeLabel}</strong>}
                <button aria-label="Previous period" onClick={() => movePeriod(-1)}><ChevronLeft size={15} /></button>
                <button aria-label="Next period" onClick={() => movePeriod(1)}><ChevronRight size={15} /></button>
              </div>
            </div>
          )}
          {view === 'Month' && renderMonth(date)}
          {view === 'Day' && renderTimedView([date])}
          {view === 'Week' && renderTimedView(weekDates)}
          {view === 'Year' && renderYear()}
        </section>
      </div>

      {showForm && (
        <Modal title={editingId ? 'Edit Schedule' : 'Create an Event'} onClose={() => setShowForm(false)}>
          <form className="form-stack calendar-event-form" onSubmit={saveEvent}>
            <label>Event title<input name="title" required defaultValue={editingEvent?.title || ''} placeholder="Add title" /></label>
            <label>Date<input name="date" type="date" required defaultValue={editingEvent?.date || formSeed.date} /></label>
            <div className="calendar-event-time-fields">
              <label>Start time<input name="startTime" type="time" required defaultValue={editingEvent?.startTime || formSeed.startTime} /></label>
              <label>End time<input name="endTime" type="time" required defaultValue={editingEvent?.endTime || formSeed.endTime} /></label>
            </div>
            <label>Event type<select name="type" defaultValue={editingEvent?.type || 'Event'}><option>Event</option><option>Reminder</option><option>Task</option></select></label>
            <label>Person<select name="personId" defaultValue={editingEvent?.personId || selectedPerson || schedulePeople[0].id}>{schedulePeople.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label>
            <label>Color<select name="color" defaultValue={editingEvent?.color || 'cyan'}>{eventColors.map((color) => <option value={color} key={color}>{color[0].toUpperCase() + color.slice(1)}</option>)}</select></label>
            <div className="calendar-event-form-actions">
              {editingId && <button className="calendar-delete-event" type="button" onClick={() => { deleteEvent(editingId); setShowForm(false); setEditingId(null) }}><Trash2 size={15} /> Delete</button>}
              <Button type="submit">{editingId ? 'Save Changes' : 'Save Event'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedDay && (
        <Modal title={`Events · ${formatLongDate(fromDateKey(selectedDay))}`} onClose={() => setSelectedDay(null)}>
          <div className="calendar-day-events">
            {dayEvents.map((event) => (
              <div className="calendar-day-event-row" key={event.id}>
                <button className={`event-tag event-${event.color}`} onClick={() => openEditForm(event)}>{event.title}</button>
                <span><Clock3 size={14} />{event.startTime}</span>
                <button aria-label={`Delete ${event.title}`} onClick={() => deleteEvent(event.id)}><Trash2 size={15} /></button>
              </div>
            ))}
            <Button onClick={() => openCreateForm(fromDateKey(selectedDay))}><Plus size={15} /> Add Schedule</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

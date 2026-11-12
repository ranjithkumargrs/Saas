import { Check, Heart, MessageCircle, MoreHorizontal, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import useLocalStorage from '../hooks/useLocalStorage'

const columns = ['To Do', 'In Progress', 'In Review', 'Done']
const priorities = ['Low', 'Medium', 'High']
const teamMembers = ['Shelby Goode', 'Robert Bacins', 'John Carilo', 'Adriene Watson']
const initialTasks = [
  { id: 'task-1', name: 'Dashboard Design', status: 'To Do', priority: 'Low', health: 'On Track', description: 'Discussion for management dashboard ui design', startDate: '2021-12-03', endDate: '2021-12-05', images: [], comments: 112, likes: 1200, liked: false },
  { id: 'task-2', name: 'Landing page Design', status: 'To Do', priority: 'Medium', health: 'At risk', description: 'Discussion for management dashboard ui design', startDate: '2021-12-03', endDate: '2021-12-08', images: [], comments: 112, likes: 1200, liked: false },
  { id: 'task-3', name: 'E-Shop Mobile App', status: 'To Do', priority: 'High', health: '', description: 'Discussion for management dashboard ui design', startDate: '2021-12-04', endDate: '2021-12-12', images: [], comments: 112, likes: 1200, liked: false },
  { id: 'task-4', name: 'Dashboard Design', status: 'To Do', priority: 'Low', health: 'On Track', description: 'Discussion for management dashboard ui design', startDate: '2021-12-05', endDate: '2021-12-10', images: [], comments: 112, likes: 1200, liked: false },
  { id: 'task-5', name: 'Dashboard Design', status: 'In Progress', priority: 'High', health: 'On Track', description: 'Discussion for management dashboard ui design', startDate: '2021-12-02', endDate: '2021-12-06', images: [], comments: 112, likes: 1200, liked: false },
  { id: 'task-6', name: 'Landing page Design', status: 'In Progress', priority: 'Low', health: '', description: 'Discussion for management dashboard ui design', startDate: '2021-12-02', endDate: '2021-12-08', images: ['/Saas/task-preview-mobile.png', '/Saas/task-preview-abstract.png'], comments: 112, likes: 1200, liked: false },
  { id: 'task-7', name: 'E-Shop Mobile App', status: 'In Progress', priority: 'Low', health: 'On Track', description: 'Discussion for management dashboard ui design', startDate: '2021-12-04', endDate: '2021-12-12', images: [], comments: 112, likes: 1200, liked: false },
  { id: 'task-8', name: 'Dashboard Design', status: 'In Review', priority: 'Medium', health: '', description: 'Discussion for management dashboard ui design', startDate: '2021-12-01', endDate: '2021-12-05', images: ['/Saas/task-preview-dashboard.png'], comments: 112, likes: 1200, liked: false },
  { id: 'task-9', name: 'E-Shop Mobile App', status: 'In Review', priority: 'Low', health: '', description: 'Discussion for management dashboard ui design', startDate: '2021-12-05', endDate: '2021-12-13', images: ['/Saas/task-preview-mobile.png', '/Saas/task-preview-abstract.png'], comments: 112, likes: 1200, liked: false },
  { id: 'task-10', name: 'Dashboard Design', status: 'Done', priority: 'High', health: 'On Track', description: 'Discussion for management dashboard ui design', startDate: '2021-11-28', endDate: '2021-12-02', images: ['/Saas/task-preview-dashboard.png', '/Saas/task-preview-done.png'], comments: 112, likes: 1200, liked: false },
].map((task) => ({ ...task, assignees: [0, 1, 2, 3], comments: [], commentCount: task.comments }))

const formatLikes = (count) => count >= 1000 ? `${Number((count / 1000).toFixed(1))}k` : String(count)

export default function Projects() {
  const [tasks, setTasks] = useLocalStorage('saas-dashboard-tasks', initialTasks)
  const [mode, setMode] = useState('Board')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [commentTaskId, setCommentTaskId] = useState(null)

  const visible = useMemo(() => tasks.filter((task) => {
    const matchesQuery = `${task.name} ${task.description}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (!priorityFilter || task.priority === priorityFilter) && (!statusFilter || task.status === statusFilter)
  }), [priorityFilter, query, statusFilter, tasks])
  const editingTask = tasks.find((task) => task.id === editingId)
  const commentTask = tasks.find((task) => task.id === commentTaskId)

  const updateTask = (id, changes) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, ...changes } : task))
  }

  const saveTask = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const startDate = form.get('startDate')
    const endDate = form.get('endDate')
    if (startDate && endDate && endDate < startDate) {
      const endDateInput = event.currentTarget.elements.namedItem('endDate')
      endDateInput.setCustomValidity('End date must be on or after the start date.')
      endDateInput.reportValidity()
      endDateInput.setCustomValidity('')
      return
    }
    const nextTaskNumber = tasks.reduce((largest, item) => Math.max(largest, Number(item.id.split('-').at(-1)) || 0), 0) + 1
    const task = {
      id: editingId || `task-${nextTaskNumber}`,
      name: form.get('name').trim(),
      description: form.get('description').trim(),
      status: form.get('status'),
      priority: form.get('priority'),
      health: form.get('health'),
      startDate,
      endDate,
      images: editingTask?.images || [],
      assignees: form.getAll('assignees').map(Number),
      comments: editingTask?.comments || [],
      commentCount: editingTask?.commentCount || 0,
      likes: editingTask?.likes || 0,
      liked: editingTask?.liked || false,
    }

    if (editingId) setTasks((current) => current.map((item) => item.id === editingId ? task : item))
    else setTasks((current) => [...current, task])
    setShowForm(false)
    setEditingId(null)
  }

  const openTaskForm = (task = null) => {
    setEditingId(task?.id || null)
    setShowForm(true)
    setActiveTaskId(null)
  }

  const deleteTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id))
    setActiveTaskId(null)
  }

  const advanceTask = (task) => {
    const nextStatus = columns[(columns.indexOf(task.status) + 1) % columns.length]
    updateTask(task.id, { status: nextStatus })
  }

  const clearFilters = () => {
    setPriorityFilter('')
    setStatusFilter('')
  }

  const renderCard = (task) => (
    <article className="task-card" key={task.id}>
      <div className="task-card-title">
        <button
          className={`check-circle ${task.status !== 'To Do' ? 'checked' : ''}`}
          aria-label={`Move ${task.name} to next status`}
          title={`Move to ${columns[(columns.indexOf(task.status) + 1) % columns.length]}`}
          onClick={() => advanceTask(task)}
        >
          {task.status !== 'To Do' && <Check size={12} />}
        </button>
        <button className="task-card-name" onClick={() => openTaskForm(task)}>{task.name}</button>
        <button className="task-options-button" aria-label={`More options for ${task.name}`} aria-expanded={activeTaskId === task.id} onClick={() => setActiveTaskId((current) => current === task.id ? null : task.id)}><MoreHorizontal size={19} /></button>
        {activeTaskId === task.id && (
          <div className="task-options-menu">
            <button onClick={() => openTaskForm(task)}>Edit task</button>
            <label>
              Move to
              <select aria-label={`Move ${task.name} to status`} value={task.status} onChange={(event) => { updateTask(task.id, { status: event.target.value }); setActiveTaskId(null) }}>
                {columns.map((column) => <option key={column}>{column}</option>)}
              </select>
            </label>
            <button className="task-delete-option" onClick={() => deleteTask(task.id)}><Trash2 size={13} /> Delete task</button>
          </div>
        )}
      </div>
      <div className="task-tags">
        <span className={`task-priority priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
        {task.health && <span className={`task-health health-${task.health.toLowerCase().replace(' ', '-')}`}>{task.health}</span>}
      </div>
      <p className="task-description">{task.description}</p>
      {task.images.length > 0 && (
        <div className={`task-images ${task.images.length === 1 ? 'task-images-single' : ''} ${task.status === 'Done' ? 'task-images-completed' : ''}`}>
          {task.images.map((image) => <img src={image} alt="" key={image} />)}
        </div>
      )}
      <div className="task-card-footer">
        <button className="task-assignees" aria-label={`Assign team members to ${task.name}`} onClick={() => openTaskForm(task)}>
          {task.assignees.map((avatar) => <span className="task-member-avatar" style={{ '--member-index': avatar }} title={teamMembers[avatar]} key={avatar} />)}
          <span className="task-add-member"><Plus size={16} /></span>
        </button>
        <div className="task-engagement">
          <button aria-label={`${task.commentCount} comments on ${task.name}`} onClick={() => setCommentTaskId(task.id)}><MessageCircle size={15} fill="currentColor" /><span>{task.commentCount}</span></button>
          <button aria-label={`${task.liked ? 'Unlike' : 'Like'} ${task.name}`} aria-pressed={task.liked} onClick={() => updateTask(task.id, { liked: !task.liked, likes: Math.max(0, task.likes + (task.liked ? -1 : 1)) })}><Heart size={15} fill="currentColor" className={task.liked ? 'task-liked' : ''} /><span>{formatLikes(task.likes)}</span></button>
        </div>
      </div>
    </article>
  )

  return (
    <div className="section-page projects-page">
      <div className="page-toolbar">
        <div><h1 className="page-title">Task Preview</h1></div>
        <div className="projects-header-actions">
          <Button className="project-filter-button" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen}><SlidersHorizontal size={15} /> Filter</Button>
          {filterOpen && (
            <div className="project-filter-popover">
              <div><b>Filter tasks</b><button aria-label="Close filters" onClick={() => setFilterOpen(false)}><X size={15} /></button></div>
              <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{columns.map((column) => <option key={column}>{column}</option>)}</select></label>
              <label>Priority<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="">All priorities</option>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
              <button className="project-add-task" onClick={() => openTaskForm()}><Plus size={14} /> Add task</button>
              <button className="project-clear-filters" onClick={clearFilters}>Clear filters</button>
            </div>
          )}
        </div>
      </div>
      <div className="task-toolbar">
        <div className="tab-switch">{['List', 'Board', 'Timeline'].map((tab) => <button key={tab} onClick={() => setMode(tab)} className={mode === tab ? 'selected' : ''}>{tab}</button>)}</div>
        <label className="search-field"><Search size={16} /><input placeholder="Search" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search tasks" /></label>
      </div>
      {mode === 'Board' && (
        <div className="task-board">
          {columns.map((column) => {
            const columnTasks = visible.filter((task) => task.status === column)
            return (
              <section className="task-column" key={column}>
                <h2>{column === 'To Do' ? 'ToDo' : column}</h2>
                {columnTasks.map(renderCard)}
                {columnTasks.length === 0 && <button className="task-empty-column" onClick={() => openTaskForm()}>No tasks here. Add a task</button>}
              </section>
            )
          })}
        </div>
      )}
      {mode === 'List' && (
        <div className="task-list panel">
          <div className="task-list-head"><span>Task Name</span><span>Start Date</span><span>End Date</span><span>Priority</span><span>Status</span><span>Action</span></div>
          {visible.map((task) => (
            <div className="task-list-row" key={task.id}>
              <button className="task-list-name" onClick={() => openTaskForm(task)}>{task.name}</button>
              <span>{task.startDate || '—'}</span><span>{task.endDate || '—'}</span><span>{task.priority}</span>
              <select aria-label={`Status for ${task.name}`} value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value })}>{columns.map((column) => <option key={column}>{column}</option>)}</select>
              <button aria-label={`Delete ${task.name}`} onClick={() => deleteTask(task.id)}><Trash2 size={15} /></button>
            </div>
          ))}
          {visible.length === 0 && <p className="empty-state">No tasks found.</p>}
        </div>
      )}
      {mode === 'Timeline' && (
        <div className="timeline panel">
          {visible.map((task) => (
            <div className="timeline-row" key={task.id}>
              <span>{task.startDate || 'No date'}</span>
              <div className="timeline-task">
                <button onClick={() => openTaskForm(task)}>{task.name}</button>
                <select aria-label={`Status for ${task.name}`} value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value })}>{columns.map((column) => <option key={column}>{column}</option>)}</select>
                <small>{task.endDate || 'No end date'}</small>
              </div>
            </div>
          ))}
          {visible.length === 0 && <p className="empty-state">No tasks found.</p>}
        </div>
      )}
      {showForm && (
        <Modal title={editingId ? 'Edit Task' : 'Add Task'} onClose={() => setShowForm(false)}>
          <form className="form-stack" onSubmit={saveTask}>
            <label>Task name<input name="name" required defaultValue={editingTask?.name || ''} placeholder="Enter task name" /></label>
            <label>Description<textarea name="description" rows="3" defaultValue={editingTask?.description || ''} placeholder="What needs to be done?" /></label>
            <label>Status<select name="status" defaultValue={editingTask?.status || 'To Do'}>{columns.map((column) => <option key={column}>{column}</option>)}</select></label>
            <label>Priority<select name="priority" defaultValue={editingTask?.priority || 'Low'}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
            <label>Progress<select name="health" defaultValue={editingTask?.health || ''}><option value="">No progress label</option><option>On Track</option><option>At risk</option></select></label>
            <div className="task-date-fields"><label>Start date<input name="startDate" type="date" defaultValue={editingTask?.startDate || ''} /></label><label>End date<input name="endDate" type="date" defaultValue={editingTask?.endDate || ''} /></label></div>
            <fieldset className="task-assignee-picker"><legend>Team members</legend>{teamMembers.map((member, index) => <label key={member}><input type="checkbox" name="assignees" value={index} defaultChecked={editingTask?.assignees.includes(index) ?? false} />{member}</label>)}</fieldset>
            <Button type="submit">{editingId ? 'Save Changes' : 'Create Task'}</Button>
          </form>
        </Modal>
      )}
      {commentTask && (
        <Modal title={`Comments · ${commentTask.name}`} onClose={() => setCommentTaskId(null)}>
          <div className="task-comments">
            {commentTask.comments.length === 0 ? <p>No recent comments. Start the conversation with your team.</p> : commentTask.comments.map((comment) => <p className="task-comment" key={comment.id}>{comment.text}</p>)}
            <form className="task-comment-form" onSubmit={(event) => {
              event.preventDefault()
              const text = new FormData(event.currentTarget).get('comment').trim()
              updateTask(commentTask.id, { comments: [...commentTask.comments, { id: commentTask.comments.length + 1, text }], commentCount: commentTask.commentCount + 1 })
              setCommentTaskId(null)
            }}><input name="comment" aria-label="Write a comment" placeholder="Write a comment..." required /><Button type="submit">Send</Button></form>
          </div>
        </Modal>
      )}
    </div>
  )
}

import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import { customers as initialCustomers } from '../data/dashboardData'

export default function Users() {
  const [people, setPeople] = useState(initialCustomers)
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [active, setActive] = useState(0)
  const visible = people.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="section-page">
      <div className="page-toolbar"><div><h1 className="page-title">Customer List</h1><p className="page-subtitle">Your customer directory and contact details.</p></div><Button onClick={() => setShowForm(true)}><Plus size={16} /> Add Customer</Button></div>
      <div className="users-layout"><article className="panel customer-panel"><label className="search-field customer-search"><Search size={16} /><input placeholder="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="customer-table"><div className="customer-head"><span>Name</span><span>Email</span><span>Phone number</span><span>Gender</span><span /></div>{visible.map((person, i) => <div className={`customer-row ${people.indexOf(person) === active ? 'customer-active' : ''}`} key={`${person.email}${i}`} onClick={() => setActive(people.indexOf(person))}><span><b className={`avatar avatar-${i % 5}`}>{person.name.split(' ').map((word) => word[0]).join('').slice(0, 2)}</b>{person.name}</span><span>{person.email}</span><span>{person.phone}</span><span><small className={`gender-pill ${person.gender.toLowerCase()}`}>{person.gender}</small></span><button aria-label="Customer options"><MoreHorizontal size={18} /></button></div>)}</div></article>
        <aside className="panel customer-profile"><div className="profile-large-avatar">{people[active]?.name.split(' ').map((word) => word[0]).join('').slice(0, 2) || 'JD'}</div><h2>{people[active]?.name || 'John Deo'}</h2><p>UI/UX Designer</p><hr /><h3>Contact Info</h3><p>{people[active]?.email}</p><p>{people[active]?.phone}</p><p>2239 Hog Camp Road<br />Schaumburg</p><div className="performance-box"><h3>Performance</h3><div className="performance-bars">{[48, 71, 58, 46, 85, 100].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div><div className="performance-labels">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month) => <span key={month}>{month} </span>)}</div></div></aside></div>
      {showForm && <Modal title="Add Customer" onClose={() => setShowForm(false)}><form className="form-stack" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const person = { name: `${form.get('first')} ${form.get('last')}`, email: form.get('email'), phone: form.get('phone'), gender: form.get('gender') }; setPeople((current) => [person, ...current]); setActive(0); setShowForm(false) }}><label>First name<input name="first" required /></label><label>Last name<input name="last" required /></label><label>Email<input name="email" type="email" required /></label><label>Phone number<input name="phone" required /></label><label>Gender<select name="gender"><option>Male</option><option>Female</option></select></label><Button type="submit">Add Customer</Button></form></Modal>}
    </div>
  )
}

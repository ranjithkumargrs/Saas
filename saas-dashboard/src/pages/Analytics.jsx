import { Camera, ChevronDown, Download, Ellipsis, Mail, MapPin, Pencil, Phone, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'
import SearchBar from '../components/SearchBar'
import useLocalStorage from '../hooks/useLocalStorage'
import { customers as initialCustomers } from '../data/dashboardData'

const initialAnalyticsCustomers = [...initialCustomers.slice(0, 5), {
  name: 'Jhon Deo',
  email: 'johndeo24823@.com',
  phone: '+63475700546',
  gender: 'Male',
}, ...initialCustomers.slice(5)].map((customer, index) => ({
  ...customer,
  id: `analytics-customer-${index + 1}`,
  role: index === 0 ? 'UI/UX Designer' : 'Customer',
  profileEmail: index === 0 ? 'kajope5182@ummoh.com' : customer.email,
  profilePhone: index === 0 ? '33757005467' : customer.phone,
  address: '2239 Hog Camp Road Schaumburg',
  avatarIndex: index % 10,
  monthlyPerformance: [1200, 2330, 1800, 1400, 2800, 3300],
  conversionRate: 70,
  satisfactionRate: 60,
}))

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const customerPerformance = [1200, 2330, 1800, 1400, 2800, 3300]

function exportCustomers(customers) {
  const headers = ['Name', 'Email', 'Phone number', 'Gender', 'Role', 'Address']
  const rows = customers.map((customer) => [
    customer.name,
    customer.email,
    customer.phone,
    customer.gender,
    customer.role || '',
    customer.address || '',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'customers.csv'
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportPerformance(customer) {
  const rows = [['Month', 'Performance'], ...months.map((month, index) => [month, customer.monthlyPerformance?.[index] ?? customerPerformance[index]])]
  const csv = rows.map((row) => row.join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${customer.name.toLowerCase().replaceAll(' ', '-')}-performance.csv`
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function CustomerForm({ customer, onSave, onClose }) {
  const isEditing = Boolean(customer)
  const [photo, setPhoto] = useState(customer?.photo || '')
  const [photoError, setPhotoError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const values = {
      name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      gender: formData.get('gender'),
      role: formData.get('role').trim() || 'Customer',
      address: formData.get('address').trim() || 'Address not provided',
      photo,
    }
    onSave(values)
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setPhotoError('Unable to preview this image. Try another file.')
        return
      }
      setPhoto(reader.result)
      setPhotoError('')
    }
    reader.onerror = () => setPhotoError('Unable to read this image. Try another file.')
    reader.readAsDataURL(file)
  }

  const [firstName = '', ...lastName] = (customer?.name || '').split(' ')

  return (
    <aside className="analytics-customer-drawer" role="dialog" aria-modal="true" aria-labelledby="analytics-customer-drawer-title">
      <div className="analytics-drawer-heading">
        <h2 id="analytics-customer-drawer-title">{isEditing ? 'Edit Customer' : 'Add Customer'}</h2>
        <button type="button" className="analytics-drawer-close" aria-label="Close add customer form" onClick={onClose}><X size={18} /></button>
      </div>
      <form className="analytics-customer-form" onSubmit={handleSubmit}>
        <label className="analytics-photo-picker" aria-label="Upload customer photo">
          {photo ? <img src={photo} alt="Customer profile preview" /> : <Camera size={24} />}
          <input type="file" accept="image/*" aria-label="Upload customer photo" onChange={handlePhotoChange} />
        </label>
        {photoError && <p className="analytics-photo-error" role="alert">{photoError}</p>}
        <label>First Name<input name="firstName" defaultValue={firstName} placeholder="John" required /></label>
        <label>Last Name<input name="lastName" defaultValue={lastName.join(' ')} placeholder="Deo" required /></label>
        <label>Email<input name="email" type="email" defaultValue={customer?.email || ''} placeholder="Example@gmail.com" required /></label>
        <label>Phone Number<input name="phone" defaultValue={customer?.phone || ''} placeholder="33757005467" required /></label>
        <label>Gender<select name="gender" defaultValue={customer?.gender || 'Male'}><option>Male</option><option>Female</option><option>Other</option></select></label>
        <input type="hidden" name="role" defaultValue={customer?.role || 'Customer'} />
        <input type="hidden" name="address" defaultValue={customer?.address || 'Address not provided'} />
        <Button type="submit">{isEditing ? 'Save Changes' : 'Add Customer'}</Button>
      </form>
    </aside>
  )
}

function MetricRing({ label, value, color }) {
  return (
    <div className="customer-metric">
      <div
        className="customer-metric-ring"
        style={{ '--metric-value': `${value}%`, '--metric-color': color }}
        role="img"
        aria-label={`${label}: ${value}%`}
      >
        <strong>{value}%</strong>
      </div>
      <span>{label}</span>
    </div>
  )
}

export default function Analytics() {
  const [people, setPeople] = useLocalStorage('analytics-customers-v2', initialAnalyticsCustomers)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(initialAnalyticsCustomers[0]?.id)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const [performanceMenuOpen, setPerformanceMenuOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [sort, setSort] = useState({ key: null, direction: 'asc' })
  const [activeMonth, setActiveMonth] = useState(1)
  const [selectedView, setSelectedView] = useState('Customer')
  const [productSaved, setProductSaved] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)

  const visibleCustomers = people
    .filter((customer) => `${customer.name} ${customer.email} ${customer.phone} ${customer.gender}`.toLowerCase().includes(query.toLowerCase()))
    .slice()
    .sort((left, right) => {
      if (!sort.key) return 0
      const comparison = String(left[sort.key] || '').localeCompare(String(right[sort.key] || ''), undefined, { sensitivity: 'base' })
      return sort.direction === 'asc' ? comparison : -comparison
    })
  const activeCustomer = people.find((customer) => customer.id === activeId) || people[0]

  function saveCustomer(values) {
    if (editingCustomer) {
      setPeople((current) => current.map((customer) => customer.id === editingCustomer.id
        ? { ...customer, ...values, profileEmail: values.email, profilePhone: values.phone }
        : customer))
    } else {
      const customer = {
        ...values,
        id: `analytics-customer-${Date.now()}`,
        avatarIndex: people.length % 10,
        profileEmail: values.email,
        profilePhone: values.phone,
        monthlyPerformance: customerPerformance,
        conversionRate: 70,
        satisfactionRate: 60,
      }
      setPeople((current) => [customer, ...current])
      setActiveId(customer.id)
    }
    setShowForm(false)
    setEditingCustomer(null)
    setOpenMenuId(null)
  }

  function deleteCustomer(customer) {
    if (!window.confirm(`Delete ${customer.name}? This cannot be undone.`)) return
    setPeople((current) => current.filter((person) => person.id !== customer.id))
    if (activeId === customer.id) {
      const next = people.find((person) => person.id !== customer.id)
      setActiveId(next?.id)
    }
    setOpenMenuId(null)
  }

  function toggleSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return (
    <div className="section-page analytics-page">
      <div className="page-toolbar">
        <h1 className="page-title">{selectedView === 'Customer' ? 'Customer List' : 'Product Analytics'}</h1>
        <div className="toolbar-actions">
          {selectedView === 'Customer' ? (
            <>
              {showSearch && <SearchBar value={query} onChange={setQuery} placeholder="Search customers" />}
              <Button aria-label="Add customer" title="Add customer" onClick={() => { setEditingCustomer(null); setOpenMenuId(null); setHeaderMenuOpen(false); setShowForm(true) }}><Plus size={16} />Add Customer</Button>
              <div className="analytics-toolbar-menu-wrap">
                <button className="analytics-toolbar-menu-trigger" aria-label="Customer list options" aria-expanded={headerMenuOpen} onClick={() => setHeaderMenuOpen((open) => !open)}><Ellipsis size={19} /></button>
                {headerMenuOpen && <div className="row-menu analytics-toolbar-menu" role="menu">
                  <button role="menuitem" onClick={() => { setShowSearch((visible) => !visible); setHeaderMenuOpen(false) }}>Search customers</button>
                  <button role="menuitem" onClick={() => { exportCustomers(visibleCustomers); setHeaderMenuOpen(false) }}>Export CSV</button>
                  <button role="menuitem" onClick={() => { setSelectedView('Product'); setHeaderMenuOpen(false) }}>Product analytics</button>
                </div>}
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setProductSaved(true)}><Download size={15} />{productSaved ? 'Downloaded' : 'Export'}</Button>
              <Button onClick={() => setShowProductForm(true)}><Plus size={16} />Add Product</Button>
            </>
          )}
          {selectedView === 'Product' && <button className="analytics-products-link" onClick={() => setSelectedView('Customer')}>Customers</button>}
        </div>
      </div>

      {selectedView === 'Customer' ? (
        <div className="analytics-customer-layout">
          <article className="panel customer-panel analytics-customer-panel">
            <div className="analytics-customer-table-wrap">
              <div className="customer-table analytics-customer-table">
                <div className="customer-head analytics-customer-head">
                  <button onClick={() => toggleSort('name')}>Name<ChevronDown className={sort.key === 'name' && sort.direction === 'desc' ? 'analytics-sort-desc' : ''} size={12} /></button>
                  <button onClick={() => toggleSort('email')}>Email<ChevronDown className={sort.key === 'email' && sort.direction === 'desc' ? 'analytics-sort-desc' : ''} size={12} /></button>
                  <button onClick={() => toggleSort('phone')}>Phone number<ChevronDown className={sort.key === 'phone' && sort.direction === 'desc' ? 'analytics-sort-desc' : ''} size={12} /></button>
                  <button onClick={() => toggleSort('gender')}>Gender<ChevronDown className={sort.key === 'gender' && sort.direction === 'desc' ? 'analytics-sort-desc' : ''} size={12} /></button>
                  <span />
                </div>
                {visibleCustomers.map((customer) => (
                  <div
                    className={`customer-row analytics-customer-row ${customer.id === activeId ? 'customer-active' : ''}`}
                    key={customer.id}
                    role="group"
                    tabIndex={0}
                    aria-label={`Select customer ${customer.name}`}
                    aria-current={customer.id === activeId ? 'true' : undefined}
                    onClick={() => { setActiveId(customer.id); setOpenMenuId(null) }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setActiveId(customer.id)
                        setOpenMenuId(null)
                      }
                    }}
                  >
                    <span className="analytics-customer-name">
                      <b
                        className="analytics-customer-avatar"
                        style={{
                          '--avatar-index': customer.avatarIndex ?? 0,
                          backgroundImage: customer.photo ? `url("${customer.photo}")` : undefined,
                        }}
                        aria-hidden="true"
                      />
                      <span>{customer.name}</span>
                    </span>
                    <span>{customer.email}</span>
                    <span>{customer.phone}</span>
                    <span><small className={`gender-pill ${(customer.gender || '').toLowerCase()}`}>{customer.gender}</small></span>
                    <div className="analytics-customer-actions">
                      <button
                        className="analytics-customer-menu-trigger"
                        aria-label={`Options for ${customer.name}`}
                        aria-expanded={openMenuId === customer.id}
                        onClick={(event) => {
                          event.stopPropagation()
                          setOpenMenuId((current) => current === customer.id ? null : customer.id)
                        }}
                      ><Ellipsis size={18} /></button>
                      {openMenuId === customer.id && (
                        <div className="row-menu analytics-customer-menu" role="menu">
                          <button role="menuitem" onClick={(event) => { event.stopPropagation(); setEditingCustomer(customer); setShowForm(true); setOpenMenuId(null) }}><Pencil size={14} />Edit customer</button>
                          <button role="menuitem" onClick={(event) => { event.stopPropagation(); deleteCustomer(customer) }}><Trash2 size={14} />Delete customer</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!visibleCustomers.length && <p className="empty-state">No customers match your search.</p>}
              </div>
            </div>
          </article>

          {showForm ? (
            <CustomerForm
              customer={editingCustomer}
              onSave={saveCustomer}
              onClose={() => { setShowForm(false); setEditingCustomer(null) }}
            />
          ) : activeCustomer ? (
            <aside className="panel analytics-profile" aria-label={`Profile for ${activeCustomer.name}`}>
              <div className="analytics-profile-overview">
                <div className="profile-large-avatar analytics-profile-avatar">
                  <span
                    className="analytics-customer-avatar"
                    style={{
                      '--avatar-index': activeCustomer.avatarIndex ?? 0,
                      backgroundImage: activeCustomer.photo ? `url("${activeCustomer.photo}")` : undefined,
                    }}
                  />
                </div>
                <h2>{activeCustomer.name}</h2>
                <p>{activeCustomer.role || 'Customer'}</p>
              </div>
              <div className="analytics-profile-section">
                <h3>Contact Info</h3>
                <p><Mail size={15} /><a href={`mailto:${activeCustomer.profileEmail || activeCustomer.email}`}>{activeCustomer.profileEmail || activeCustomer.email}</a></p>
                <p><Phone size={15} /><a href={`tel:${activeCustomer.profilePhone || activeCustomer.phone}`}>{activeCustomer.profilePhone || activeCustomer.phone}</a></p>
                <p><MapPin size={15} /><span>{activeCustomer.address || 'Address not provided'}</span></p>
              </div>
              <div className="performance-box analytics-performance">
                <div className="analytics-performance-heading">
                  <h3>Performance</h3>
                  <div className="analytics-performance-menu-wrap">
                    <button className="analytics-performance-menu" aria-label="Performance options" aria-expanded={performanceMenuOpen} onClick={() => setPerformanceMenuOpen((open) => !open)}><Ellipsis size={16} /></button>
                    {performanceMenuOpen && <div className="row-menu analytics-performance-menu-popover" role="menu">
                      <button role="menuitem" onClick={() => { exportPerformance(activeCustomer); setPerformanceMenuOpen(false) }}>Export performance</button>
                      <button role="menuitem" onClick={() => { setActiveMonth(1); setPerformanceMenuOpen(false) }}>Reset selection</button>
                    </div>}
                  </div>
                </div>
                <div className="performance-bars" role="group" aria-label="Monthly customer performance">
                  {months.map((month, index) => {
                    const value = activeCustomer.monthlyPerformance?.[index] ?? customerPerformance[index]
                    return (
                      <button
                        type="button"
                        className={activeMonth === index ? 'performance-bar-active' : ''}
                        key={month}
                        style={{ '--bar-height': `${Math.max(14, (value / 3500) * 100)}%` }}
                        data-performance={`${(value / 1000).toFixed(2)}k`}
                        aria-label={`${month}: ${value.toLocaleString()} customer performance`}
                        aria-pressed={activeMonth === index}
                        onClick={() => setActiveMonth(index)}
                      />
                    )
                  })}
                </div>
                <div className="performance-labels">{months.map((month, index) => <button className={activeMonth === index ? 'performance-label-active' : ''} key={month} onClick={() => setActiveMonth(index)}>{month}</button>)}</div>
              </div>
              <div className="analytics-customer-metrics">
                <MetricRing label="Conversion" value={activeCustomer.conversionRate ?? 70} color="#ff8a6c" />
                <MetricRing label="Satisfaction" value={activeCustomer.satisfactionRate ?? 60} color="#8274f8" />
              </div>
            </aside>
          ) : (
            <aside className="panel analytics-profile analytics-profile-empty"><p>Add a customer to see their profile and performance.</p></aside>
          )}
        </div>
      ) : (
        <div className="analytics-layout">
          <div className="analytics-main">
            <div className="metric-panels">
              <article className="metric-panel"><span className="metric-kicker">Total Product <em>+1400 New Added</em></span><strong>5,00,874</strong><div className="sparkline spark-blue">〰</div></article>
              <article className="metric-panel"><span className="metric-kicker">Total Sales <em>+1000 Sales Today</em></span><strong>2,34,888</strong><div className="sparkline spark-gold">〰</div></article>
            </div>
            <article className="panel"><div className="panel-heading"><h2>Top Selling Products</h2><button className="text-link" onClick={() => setShowProductForm(true)}>Add product <Plus size={14} /></button></div>
              <div className="simple-table"><div className="simple-table-head"><span>SN</span><span>Name</span><span>Price</span><span>Total Order</span><span>Total Sales</span></div>{['Bluetooth Devices', 'Airdot', 'Shoes', 'Kids T-Shirt', 'Smart Watch', 'Girls Top'].map((name, index) => <div className="simple-table-row" key={name}><span>{index < 3 ? '🏅' : index + 1}</span><span><b className="product-dot">{['◉', '◈', '◉', '♟', '⌚', '♟'][index]}</b>{name}</span><span>${[10, 15, 10, 12, 12, 12][index]}</span><span>{['34,666', '20,000', '15,000', '10,000', '10,000', '10,000'][index]} Piece</span><span className="green-text">${['3,46,660', '3,00,000', '1,50,000', '1,20,000', '1,20,000', '1,20,000'][index]}</span></div>)}</div>
            </article>
          </div>
          <div className="analytics-side"><img className="month-chart-image" src="/Saas/product%20add%20by%20month.png" alt="Products added by month from January to July" /><img className="analytics-donut" src="/Saas/Analytics.png" alt="Product sales analytics, 80 percent" /></div>
        </div>
      )}

      {showProductForm && <Modal title="Add a New Product" onClose={() => setShowProductForm(false)}><form className="form-stack" onSubmit={(event) => { event.preventDefault(); setShowProductForm(false); setProductSaved(true) }}><label>Product Name<input required placeholder="Macbook Pro 2024" /></label><label>Brand<select><option>Apple</option><option>Samsung</option><option>Nike</option></select></label><label>Price<input required type="number" min="0" placeholder="1200" /></label><label>Description<textarea rows="3" placeholder="Describe this product" /></label><Button type="submit">Save Product</Button></form></Modal>}
    </div>
  )
}

import { CalendarDays, Download, Mail, MapPin, MoreHorizontal, Plus, Printer, Star, Trash2, Upload, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import Button from '../components/Button'
import DataTable from '../components/DataTable'
import SearchBar from '../components/SearchBar'
import useLocalStorage from '../hooks/useLocalStorage'
import { invoices as initialInvoices } from '../data/dashboardData'

const initialItems = [
  { id: 'item-ipod', description: 'ipod 2021', rate: 1000, quantity: 10 },
  { id: 'item-macbook', description: 'Apple Mackbook', rate: 1500, quantity: 10 },
  { id: 'item-iphone', description: 'i phone 12', rate: 885, quantity: 10 },
]

const money = (value) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

function InvoiceComposer({ onCancel, onSave, nextInvoiceNumber }) {
  const [invoiceId, setInvoiceId] = useState(`#${nextInvoiceNumber}`)
  const [invoiceDate, setInvoiceDate] = useState('2021-12-01')
  const [name, setName] = useState('Alison G.')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [logo, setLogo] = useState('')
  const [items, setItems] = useState(initialItems)
  const [notice, setNotice] = useState('')
  const subtotal = items.reduce((sum, item) => sum + item.rate * item.quantity, 0)
  const discount = subtotal * 0.05
  const total = subtotal - discount

  function updateItem(id, key, value) {
    setItems((current) => current.map((item) => item.id === id
      ? { ...item, [key]: key === 'description' ? value : Math.max(0, Number(value) || 0) }
      : item))
  }

  function addItem() {
    setItems((current) => [...current, {
      id: `item-${Date.now()}`,
      description: '',
      rate: 0,
      quantity: 1,
    }])
  }

  function updateLogo(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setNotice('Choose an image file for your invoice logo.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogo(reader.result)
        setNotice('')
      } else {
        setNotice('Unable to preview this image. Try another file.')
      }
    }
    reader.onerror = () => setNotice('Unable to read this image. Try another file.')
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const action = event.nativeEvent.submitter?.value === 'sent' ? 'Complete' : 'Pending'
    const invoice = {
      key: `invoice-${Date.now()}`,
      id: invoiceId.trim() || `#${nextInvoiceNumber}`,
      name: name.trim(),
      email: email.trim(),
      date: new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${invoiceDate}T00:00:00`)),
      status: action,
      avatarIndex: null,
      amount: total,
      address: address.trim(),
      logo,
      items: items.map((item) => ({ ...item })),
    }
    onSave(invoice)
  }

  function downloadInvoice() {
    const invoiceLines = items
      .map((item) => `<tr><td>${escapeHtml(item.description)}</td><td>${item.quantity}</td><td>${money(item.rate)} USD</td><td>${money(item.rate * item.quantity)} USD</td></tr>`)
      .join('')
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(invoiceId)}</title><style>body{font:14px Arial,sans-serif;color:#181830;margin:48px}h1{color:#1688ff}header{display:flex;justify-content:space-between}table{width:100%;border-collapse:collapse;margin:40px 0}th,td{text-align:left;padding:13px;border-bottom:1px solid #ddd}footer{text-align:right;margin-top:24px}.total{font-weight:bold;color:#1688ff}</style></head><body><header><div><h1>J</h1><h3>RECIPIENT</h3>${escapeHtml(name)}<p>${escapeHtml(address)}<br>${escapeHtml(email)}</p></div><div><h1>Invoice</h1><p>${escapeHtml(invoiceId)}<br>${escapeHtml(invoiceDate)}</p></div></header><table><thead><tr><th>TASK DESCRIPTION</th><th>HOURS</th><th>RATE</th><th>AMOUNT</th></tr></thead><tbody>${invoiceLines}</tbody></table><footer><p>SUBTOTAL: ${money(subtotal)} USD</p><p>DISCOUNT 5%: ${money(discount)} USD</p><p class="total">TOTAL: ${money(total)} USD</p></footer></body></html>`
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoiceId.replace(/[^\w-]/g, '') || nextInvoiceNumber}.html`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="invoice-create-layout">
      <form className="panel invoice-create-form" onSubmit={handleSubmit}>
        <div className="invoice-create-heading">
          <h2>Create New Invoice</h2>
          <button type="button" className="invoice-form-close" aria-label="Back to invoice list" onClick={onCancel}><X size={17} /></button>
        </div>
        <label className="invoice-logo-picker" aria-label="Upload invoice logo">
          {logo ? <img src={logo} alt="Invoice logo preview" /> : <Upload size={23} />}
          <input type="file" accept="image/*" aria-label="Upload invoice logo" onChange={updateLogo} />
        </label>
        <div className="invoice-create-fields">
          <label>Invoice Id<input value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} required /></label>
          <label>Date<span className="invoice-date-input"><input type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} required /><CalendarDays size={16} /></span></label>
          <label className="invoice-field-wide">Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Customer name" required /></label>
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Example@gmail.com" required /></label>
          <label>Address<span className="invoice-address-input"><input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Street" /><MapPin size={16} /></span></label>
        </div>
        <div className="invoice-products-heading">
          <h3>Product Description</h3>
          <button type="button" aria-label="Add product line" onClick={addItem}><Plus size={18} /></button>
        </div>
        <div className="invoice-items-editor">
          <div className="invoice-item-labels"><span>Product Name <i>⌄</i></span><span>Rate <i>⌄</i></span><span>QTY <i>⌄</i></span><span>Amount <i>⌄</i></span><span /></div>
          {items.map((item) => (
            <div className="invoice-item-editor-row" key={item.id}>
              <input aria-label="Product name" value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} placeholder="Product name" required />
              <label><span className="sr-only">Rate</span><input aria-label="Rate" type="number" min="0" step="0.01" value={item.rate} onChange={(event) => updateItem(item.id, 'rate', event.target.value)} /></label>
              <label><span className="sr-only">Quantity</span><input aria-label="Quantity" type="number" min="1" step="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} /></label>
              <strong>${money(item.rate * item.quantity)}</strong>
              <button type="button" aria-label={`Remove ${item.description || 'product line'}`} disabled={items.length === 1} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        {notice && <p className="invoice-form-notice" role="alert">{notice}</p>}
        <div className="invoice-create-actions">
          <Button type="submit" variant="outline" value="sent">Send Invoice</Button>
          <Button type="submit" value="pending">Create Invoice</Button>
        </div>
      </form>

      <section className="panel invoice-preview-panel" aria-label="Invoice preview">
        <div className="invoice-preview-toolbar">
          <h2>Preview</h2>
          <div>
            <button type="button" aria-label="Download invoice" title="Download invoice" onClick={downloadInvoice}><Download size={18} /></button>
            <button type="button" aria-label="Print invoice" title="Print invoice" onClick={() => window.print()}><Printer size={18} /></button>
          </div>
        </div>
        <article className="invoice-paper">
          <div className="invoice-paper-header">
            <div className="invoice-paper-recipient">
              <div className="invoice-company-mark">{logo ? <img src={logo} alt="Company logo" /> : 'J'}</div>
              <div className="invoice-recipient-label">RECIPIENT</div>
              <p>{name || 'Customer name'}</p>
              <p>{address || 'Street address'}</p>
              <p>{email || 'customer@example.com'}</p>
            </div>
            <div className="invoice-company-contact"><span>✉ &nbsp; your.mail@gmail.com</span><br /><span>+386 95 271 3115</span></div>
            <div className="invoice-paper-title">
              <h2>Invoice</h2>
              <small>INVOICE NO.</small><span>{invoiceId}</span>
              <small>INVOICE DATE</small><span>{formatInvoiceDate(invoiceDate)}</span>
            </div>
          </div>
          <div className="invoice-paper-items">
            <div className="invoice-paper-items-head"><span>TASK DESCRIPTION</span><span>HOURS</span><span>RATE</span><span>AMOUNT</span></div>
            {items.map((item) => (
              <div className="invoice-paper-item" key={item.id}>
                <span>{item.description || 'Product description'}</span>
                <span>{item.quantity}</span>
                <span>{money(item.rate)} USD</span>
                <span>{money(item.rate * item.quantity)} USD</span>
              </div>
            ))}
            <div className="invoice-paper-totals">
              <p><span>SUBTOTAL</span><span>{money(subtotal)} USD</span></p>
              <p><span>DISCOUNT 5%</span><span>{money(discount)} USD</span></p>
              <p className="invoice-paper-total"><strong>TOTAL</strong><strong>{money(total)} USD</strong></p>
            </div>
          </div>
          <div className="invoice-paper-transfer">Transfer the amount to the business account below. Please include invoice number in your check.</div>
          <div className="invoice-paper-bank"><span>BANK: &nbsp; FTSBUS33</span><span>IBAN: &nbsp; GB22-1111-2222-3333</span></div>
          <div className="invoice-paper-notes">
            <strong>NOTES</strong>
            <p>All amounts are in dollars. Please make the payment within 15 days from the issue date of this invoice. This is not charged on the basis of payment. Article 46 of the Value Added Tax Act (VAT not liable for VAT).</p>
            <p>Thank you for your confidence in my work.<br />Signature</p>
          </div>
          <div className="invoice-paper-footer"><span>YOUR COMPANY<br />1931 Hart Road, 4506 Garces, MI</span><span>✉ &nbsp; your.mail@gmail.com<br />+386 95 271 3115</span><span>The company is registered in the<br />business register under no. 07503300</span></div>
        </article>
        <div className="invoice-preview-summary"><span>Invoice total</span><strong>{money(total)} USD</strong></div>
      </section>
    </div>
  )
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function formatInvoiceDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

export default function Invoice() {
  const [rows, setRows] = useLocalStorage('dashboard-invoices', initialInvoices)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [menu, setMenu] = useState(null)
  const [selected, setSelected] = useState(() => initialInvoices.filter((row) => row.selected).map((row) => row.key))
  const [favorites, setFavorites] = useState(() => initialInvoices.filter((row) => row.favorite).map((row) => row.key))
  const [message, setMessage] = useState('')
  const filtered = useMemo(() => rows.filter((row) => `${row.id} ${row.name} ${row.email} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query])
  const nextInvoiceNumber = 876370 + rows.length

  function saveInvoice(invoice) {
    setRows((current) => [invoice, ...current])
    setSelected((current) => [invoice.key, ...current])
    setFavorites((current) => current.filter((key) => rows.some((row) => row.key === key)))
    setMessage(`Invoice ${invoice.id} ${invoice.status === 'Complete' ? 'sent' : 'created'} successfully.`)
    setCreating(false)
    setQuery('')
  }

  if (creating) {
    return (
      <div className="section-page invoice-page invoice-create-page">
        <InvoiceComposer
          nextInvoiceNumber={nextInvoiceNumber}
          onCancel={() => setCreating(false)}
          onSave={saveInvoice}
        />
      </div>
    )
  }

  return (
    <div className="section-page invoice-page">
      <div className="page-toolbar">
        <div><h1 className="page-title">Invoice List</h1>{message && <p className="invoice-success-message" role="status">{message}</p>}</div>
        <div className="toolbar-actions"><SearchBar value={query} onChange={setQuery} /><Button onClick={() => { setMessage(''); setCreating(true) }}><Plus size={16} /> Add New</Button></div>
      </div>
      <article className="invoice-panel"><DataTable columns={['', 'Invoice Id', 'Name', 'Email', 'Date', 'Status', '']} rows={filtered} renderRow={(row) => <tr key={row.key}><td><input aria-label={`Select invoice ${row.id}`} type="checkbox" checked={selected.includes(row.key)} onChange={() => setSelected((items) => items.includes(row.key) ? items.filter((key) => key !== row.key) : [...items, row.key])} /></td><td><b>{row.id}</b></td><td><span className="customer-name"><span className={`avatar ${row.avatarIndex === null ? 'avatar-2' : 'invoice-avatar'}`} style={row.avatarIndex === null ? undefined : { '--avatar-index': row.avatarIndex }}>{row.avatarIndex === null ? row.name.slice(0, 1) : null}</span>{row.name}</span></td><td><Mail className="inline-icon green-text" size={14} />{row.email}</td><td><CalendarDays className="inline-icon blue-text" size={14} />{row.date}</td><td><span className={`status-pill status-${row.status.toLowerCase()}`}>{row.status}</span></td><td className="row-actions"><button aria-label={`Toggle favorite for ${row.id}`} onClick={() => setFavorites((items) => items.includes(row.key) ? items.filter((key) => key !== row.key) : [...items, row.key])}><Star size={16} fill={favorites.includes(row.key) ? 'currentColor' : 'none'} className={favorites.includes(row.key) ? 'gold-text' : ''} /></button><button aria-label={`Invoice actions for ${row.id}`} onClick={() => setMenu(menu === row.key ? null : row.key)}><MoreHorizontal size={18} /></button>{menu === row.key && <div className="row-menu"><button onClick={() => { setRows((current) => current.map((item) => item.key === row.key ? { ...item, status: item.status === 'Complete' ? 'Pending' : 'Complete' } : item)); setMenu(null) }}>Change status</button><button onClick={() => { setRows((current) => current.filter((item) => item.key !== row.key)); setSelected((items) => items.filter((key) => key !== row.key)); setFavorites((items) => items.filter((key) => key !== row.key)); setMenu(null) }}><Trash2 size={13} /> Delete invoice</button></div>}</td></tr>} /></article>
      {filtered.length === 0 && <p className="empty-state">No invoices found.</p>}
    </div>
  )
}

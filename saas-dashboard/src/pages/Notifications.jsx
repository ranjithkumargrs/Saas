import { Bell, Check, CheckCheck, PackageCheck, Users } from 'lucide-react'
import { useState } from 'react'

const initialNotifications = [
  { icon: PackageCheck, title: 'New order received', detail: 'Order #876621 has been placed.', time: 'Just now', unread: true },
  { icon: Users, title: 'New customer registered', detail: 'Shelby Goode joined your customer list.', time: '1 hour ago', unread: true },
  { icon: Bell, title: 'Monthly report is ready', detail: 'Your October performance report is ready to view.', time: 'Yesterday', unread: false },
  { icon: Check, title: 'Payment completed', detail: 'Payment for invoice #876364 was received.', time: '2 days ago', unread: false },
]

export default function Notifications() {
  const [items, setItems] = useState(initialNotifications)
  return <div className="section-page"><div className="page-toolbar"><div><h1 className="page-title">Notifications</h1><p className="page-subtitle">Stay updated on your workspace activity.</p></div><button className="text-link" onClick={() => setItems((current) => current.map((item) => ({ ...item, unread: false })))}><CheckCheck size={16} /> Mark all as read</button></div><section className="panel notification-list">{items.map((item) => { const Icon = item.icon; return <article className={`notification-item ${item.unread ? 'unread' : ''}`} key={item.title}><span className="notification-icon"><Icon size={19} /></span><div><b>{item.title}</b><p>{item.detail}</p><small>{item.time}</small></div>{item.unread && <i aria-label="Unread" />}</article> })}</section></div>
}

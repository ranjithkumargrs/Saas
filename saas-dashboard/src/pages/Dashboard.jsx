import { ChevronDown, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import { orders } from '../data/dashboardData'

const metrics = [
  { value: '178+', label: 'Save Products' },
  { value: '20+', label: 'Stock Products' },
  { value: '190+', label: 'Sales Products' },
  { value: '12+', label: 'Job Application' },
]

export default function Dashboard() {
  const [startDate, setStartDate] = useState('10-06-2021')
  const [endDate, setEndDate] = useState('10-10-2021')
  const [orderMenu, setOrderMenu] = useState(false)
  return (
    <div className="dashboard-page">
      <div className="page-toolbar">
        <h1 className="page-title">Dashboard</h1>
        <div className="toolbar-actions">
          <label className="dashboard-date"><span className="sr-only">Start date</span><select value={startDate} onChange={(event) => setStartDate(event.target.value)}><option>10-06-2021</option><option>01-06-2021</option><option>10-05-2021</option></select><ChevronDown size={12} /></label>
          <label className="dashboard-date"><span className="sr-only">End date</span><select value={endDate} onChange={(event) => setEndDate(event.target.value)}><option>10-10-2021</option><option>20-10-2021</option><option>10-11-2021</option></select><ChevronDown size={12} /></label>
        </div>
      </div>
      <section className="stats-grid" aria-label="Business summary">{metrics.map((metric, index) => <StatCard key={metric.label} metric={metric} index={index} />)}</section>
      <section className="dashboard-grid">
        <article className="image-card report-card"><img src="/Saas/Reports.png" alt="Reports line chart showing sales over the day" /><Link className="card-link-overlay" to="/reports" aria-label="Open reports" /></article>
        <article className="image-card analytics-card"><img src="/Saas/Analytics.png" alt="Analytics chart with 80 percent transactions" /><Link className="card-link-overlay" to="/analytics" aria-label="Open analytics details" /></article>
        <article className="panel orders-panel">
          <div className="panel-heading"><h2>Recent Orders</h2><button className="card-more" aria-label="Recent order options" onClick={() => setOrderMenu(!orderMenu)}><MoreHorizontal size={17} /></button>{orderMenu && <Link className="order-menu-link" to="/invoice">Open invoice list</Link>}</div>
          <DataTable columns={['Tracking no', 'Product Name', 'Price', 'Total Order', 'Total Amount']} rows={orders} renderRow={(row) => (
            <tr key={row.id}><td>{row.id}</td><td><span className={`product-dot order-product-${orders.indexOf(row)}`}>{['📷', '👗', '🧴', '🧴'][orders.indexOf(row)]}</span>{row.name}</td><td>{row.price}</td><td><span className="count-pill">{row.count}</span></td><td>{row.amount}</td></tr>
          )} />
        </article>
        <article className="image-card products-card"><img src="/Saas/Top%20selling%20products.png" alt="Top selling products: Nike shoes and iPhone 12" /><Link className="card-link-overlay" to="/reports" aria-label="Open product reports" /></article>
      </section>
    </div>
  )
}

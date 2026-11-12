import { ArrowDownToLine } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button'

export default function Reports() {
  const [period, setPeriod] = useState('This year')
  const [downloaded, setDownloaded] = useState(false)
  return <div className="section-page"><div className="page-toolbar"><div><h1 className="page-title">Reports</h1><p className="page-subtitle">A deeper look at business performance.</p></div><div className="toolbar-actions"><select className="select-wrap" value={period} onChange={(event) => setPeriod(event.target.value)}><option>This year</option><option>This month</option><option>This week</option></select><Button variant="outline" onClick={() => setDownloaded(true)}><ArrowDownToLine size={16} />{downloaded ? 'Ready' : 'Download report'}</Button></div></div><div className="report-page-grid"><img src="/Saas/Reports.png" alt="Sales report chart" /><img src="/Saas/Analytics.png" alt="Transactions analytics chart" /><img src="/Saas/product%20add%20by%20month.png" alt="Products added by month" /></div></div>
}

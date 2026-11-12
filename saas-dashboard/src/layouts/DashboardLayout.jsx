import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  return (
    <div className={`app-shell ${pathname === '/analytics' ? 'analytics-shell' : ''} ${pathname === '/projects' ? 'projects-shell' : ''} ${pathname === '/calendar' ? 'calendar-shell' : ''} ${pathname === '/messages' ? 'messages-shell' : ''}`}>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-shell">
        <Navbar onMenu={() => setMenuOpen(true)} />
        <main className={`page-content ${pathname === '/' ? 'page-content-dashboard' : ''}`}><Outlet /></main>
      </div>
    </div>
  )
}

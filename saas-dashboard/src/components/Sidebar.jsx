import {
  Activity,
  Bell,
  CalendarDays,
  ChartNoAxesColumn,
  ChartNoAxesCombined,
  LayoutDashboard,
  ListTodo,
  LogOut,
  PanelsTopLeft,
  Settings,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { navigation } from '../data/dashboardData'
import { clearSession, getCurrentUser } from '../auth/auth'

const iconMap = {
  LayoutDashboard,
  ChartNoAxesColumn,
  PanelsTopLeft,
  ListTodo,
  CalendarDays,
  ChartNoAxesCombined,
  Bell,
  Settings,
}

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCurrentUser()
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
  const dashboardRoute = pathname === '/'
  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
    onClose()
  }
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${dashboardRoute ? 'dashboard-sidebar' : 'full-sidebar'}`}>
        <img className="sidebar-art" src={dashboardRoute ? '/Saas/Menu.png' : '/Saas/Menu%20(1).png'} alt="" />
        <div className="brand">
          <span className="brand-mark">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M1 34 22 45 45 24 63 33" />
              <circle cx="22" cy="45" r="5" />
              <circle cx="45" cy="24" r="5" />
            </svg>
          </span>
          <span>Base</span>
          <button className="mobile-close icon-button" aria-label="Close menu" onClick={onClose}><X size={20} /></button>
        </div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon] || Activity
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onClose} className={({ isActive }) => `nav-link ${isActive || (pathname === '/projects' && item.path === '/schedule') ? 'active' : ''}`}>
                <Icon size={18} strokeWidth={2.3} />
                <span>{item.label}</span>
                {item.badge && <small className="nav-badge">{item.badge}</small>}
              </NavLink>
            )
          })}
        </nav>
        {dashboardRoute && <nav className="compact-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = iconMap[item.icon] || Activity
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={onClose} aria-label={item.label} title={item.label}>
                <Icon size={17} strokeWidth={2.5} />
              </NavLink>
            )
          })}
        </nav>}
        {!dashboardRoute && <div className="full-sidebar-actions">
          <button aria-label="Upgrade workspace" onClick={() => navigate('/settings')} />
          <button aria-label="Log out" onClick={handleLogout} />
        </div>}
        <div className="sidebar-promo">
          <div className="promo-orbit">
            <i className="promo-beam" />
            <span />
          </div>
          <strong>Upgrade your workspace</strong>
          <p>Get more from your dashboard</p>
          <button onClick={() => navigate('/settings')}>Upgrade Now</button>
        </div>
        <div className="sidebar-account">
          <button className="sidebar-user" onClick={() => { navigate('/profile'); onClose() }}>
            <span className="avatar avatar-user">{initials}</span>
            <span className="user-copy"><b>{user?.name || 'Easin Arafat'}</b><small>Free Account</small></span>
          </button>
          <button className="sidebar-logout" aria-label="Log out" onClick={handleLogout}><LogOut size={20} /></button>
        </div>
        {dashboardRoute && <button className="compact-profile" aria-label="Log out" onClick={handleLogout} />}
      </aside>
    </>
  )
}

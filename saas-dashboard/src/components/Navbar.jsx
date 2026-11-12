import { Bell, ChevronDown, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { navigation } from '../data/dashboardData'
import { clearSession, getCurrentUser } from '../auth/auth'

export default function Navbar({ onMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const user = getCurrentUser()
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
  const title = navigation.find((item) => item.path === location.pathname)?.label || (location.pathname === '/projects' ? 'Task Preview' : location.pathname === '/users' ? 'Customer List' : 'Profile')

  return (
    <header className="topbar">
      <button className="mobile-menu icon-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <button className="top-search icon-button" aria-label="Search"><Search size={18} /></button>
        <div className="popover-wrap">
          <button className={`icon-button top-notice ${noticeOpen ? 'selected' : ''}`} aria-label="Notifications" onClick={() => { setNoticeOpen(!noticeOpen); setProfileOpen(false) }}>
            <Bell size={18} /><i />
          </button>
          {noticeOpen && <div className="popover notification-popover"><b>Notifications</b><p>Your dashboard is up to date.</p><p>New order #876621 received.</p></div>}
        </div>
        <div className="popover-wrap">
          <button className="profile-trigger" onClick={() => { setProfileOpen(!profileOpen); setNoticeOpen(false) }}>
            <span className="avatar avatar-user">{initials}</span><span>{user?.name || 'Account'}</span><ChevronDown size={14} />
          </button>
          {profileOpen && <div className="popover profile-popover"><button onClick={() => navigate('/profile')}>My profile</button><button onClick={() => navigate('/settings')}>Settings</button><button onClick={() => { clearSession(); navigate('/login', { replace: true }) }}>Log out</button></div>}
        </div>
      </div>
    </header>
  )
}

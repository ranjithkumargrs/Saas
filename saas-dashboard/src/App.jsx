import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Invoice from './pages/Invoice'
import Schedule from './pages/Schedule'
import Calendar from './pages/Calendar'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Projects from './pages/Projects'
import Users from './pages/Users'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Reports from './pages/Reports'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="projects" element={<Projects />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

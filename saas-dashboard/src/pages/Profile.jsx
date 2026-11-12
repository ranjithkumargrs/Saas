import { Camera, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { clearSession } from '../auth/auth'

export default function Profile() {
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()
  const handleLogout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }
  return <div className="section-page"><div className="page-toolbar"><div><h1 className="page-title">My Profile</h1><p className="page-subtitle">Manage your profile and contact information.</p></div><Button variant="outline" onClick={handleLogout}>Log out</Button></div><div className="profile-layout"><section className="panel profile-summary"><div className="profile-large-avatar">EA</div><button className="camera-button" aria-label="Change profile photo"><Camera size={15} /></button><h2>Easin Arafat</h2><p>UI/UX Designer</p><span className="account-tag">Free Account</span><hr /><h3>Contact Info</h3><p><Mail size={16} /> easin.arafat@example.com</p><p><Phone size={16} /> +1 234 567 890</p><p><MapPin size={16} /> 2239 Hog Camp Road, Schaumburg</p></section><section className="panel profile-edit"><h2>Personal Information</h2><div className="form-grid"><label>First name<input defaultValue="Easin" /></label><label>Last name<input defaultValue="Arafat" /></label><label>Email address<input type="email" defaultValue="easin.arafat@example.com" /></label><label>Phone number<input defaultValue="+1 234 567 890" /></label><label>Job title<input defaultValue="UI/UX Designer" /></label><label>Location<input defaultValue="Schaumburg, USA" /></label><label className="full-field">Bio<textarea rows="4" defaultValue="Designing simple and delightful digital experiences." /></label></div><Button onClick={() => setSaved(true)}>{saved ? 'Profile saved' : 'Save Changes'}</Button></section></div></div>
}

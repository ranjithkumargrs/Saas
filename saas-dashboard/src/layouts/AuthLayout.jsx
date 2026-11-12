import { Activity } from 'lucide-react'
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return <main className="auth-layout"><section className="auth-form-side"><span className="brand-mark auth-brand"><Activity size={25} /></span><Outlet /></section><section className="auth-art"><img src="/Saas/Illustration.png" alt="Person working at a desk" /></section></main>
}

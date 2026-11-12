import { Eye, EyeOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaFacebookF } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { authenticateAccount, createAccount, createSession, resetAccountPassword } from '../auth/auth'

export default function Login() {
  const { pathname } = useLocation()
  return <AuthPage key={pathname} signup={pathname === '/signup'} />
}

function AuthPage({ signup }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [rememberMe, setRememberMe] = useState(() => window.localStorage.getItem('saas-auth-remember') === 'true')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [legalTopic, setLegalTopic] = useState('')

  useEffect(() => {
    if (!legalTopic && !resetOpen) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLegalTopic('')
        setResetOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [legalTopic, resetOpen])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')
    try {
      const formData = new FormData(event.currentTarget)
      const credentials = signup
        ? {
            name: formData.get('name'),
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
          }
        : { email: formData.get('email'), password: formData.get('password') }
      const account = signup
        ? await createAccount(credentials)
        : await authenticateAccount(credentials)
      createSession(account, rememberMe)
      window.localStorage.setItem('saas-auth-remember', String(rememberMe))
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to complete sign-in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPassword = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Enter a valid email address before requesting a password reset.')
      return
    }
    setResetEmail(email)
    setResetPassword('')
    setResetError('')
    setMessage('')
    setResetOpen(true)
  }

  const handleResetSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await resetAccountPassword({ email: resetEmail, password: resetPassword })
      setResetOpen(false)
      setEmail(resetEmail)
      setMessage('Password updated. You can now log in with your new password.')
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Unable to reset the password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-form-side">
        <div className={`auth-form-content${signup ? ' auth-form-content-signup' : ''}`}>
          <Link className="brand-mark auth-brand" to="/" aria-label="Base dashboard">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <path d="M1 34 22 45 45 24 63 33" />
              <circle cx="22" cy="45" r="5" />
              <circle cx="45" cy="24" r="5" />
            </svg>
          </Link>
          <h1>{signup ? 'Sign Up' : 'Log in'}</h1>
          <div className="social-login">
            <button type="button" onClick={() => setMessage('Google OAuth is not configured. Create an account with your email instead.')}>
              <FcGoogle aria-hidden="true" /> Google
            </button>
            <button type="button" onClick={() => setMessage('Facebook OAuth is not configured. Create an account with your email instead.')}>
              <FaFacebookF aria-hidden="true" /> Facebook
            </button>
          </div>
          <div className="or-divider">Or</div>
          <form className="form-stack auth-form" onSubmit={handleSubmit}>
            {signup && (
              <>
                <label htmlFor="auth-full-name">Full Name
                  <input id="auth-full-name" name="name" autoComplete="name" required placeholder="Jiangyu" />
                </label>
                <label htmlFor="auth-signup-email">Email Address
                  <input id="auth-signup-email" name="email" type="email" autoComplete="email" required placeholder="example@gmail.com" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
                <label htmlFor="auth-username">Username
                  <input id="auth-username" name="username" autoComplete="username" required minLength="3" placeholder="johnkevine4362" />
                </label>
              </>
            )}
            {!signup && (
              <label htmlFor="auth-login-email">Email Address
                <input id="auth-login-email" name="email" type="email" autoComplete="email" required placeholder="example@gmail.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
            )}
            <label htmlFor="auth-password">Password
              <span className="password-input">
                <input id="auth-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} required minLength="6" placeholder="Password" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            {signup ? (
              <label className="auth-terms">
                <input type="checkbox" required />
                <span>By creating an account you agree to the <button type="button" onClick={() => setLegalTopic('Terms of use')}>terms of use</button> and our <button type="button" onClick={() => setLegalTopic('Privacy policy')}>privacy policy</button>.</span>
              </label>
            ) : (
              <div className="remember-row">
                <label><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
                <button type="button" onClick={handleResetPassword}>Reset Password?</button>
              </div>
            )}
            <Button type="submit" className="full-button" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : signup ? 'Create account' : 'Log in'}</Button>
          </form>
          {message && <p className="auth-feedback" role="status">{message}</p>}
          <p className="auth-toggle">
            {signup ? 'Already have an account?' : "Don't have account yet?"}
            {' '}<Link to={signup ? '/login' : '/signup'}>{signup ? 'Log in' : 'New Account'}</Link>
          </p>
        </div>
      </section>
      <section className="auth-art" aria-hidden="true">
        <img src={signup ? '/Saas/Illustration.png' : '/Saas/Illustration%20(1).png'} alt="" />
      </section>
      {legalTopic && (
        <div className="auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setLegalTopic('') }}>
          <section className="auth-legal-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-legal-title">
            <header>
              <h2 id="auth-legal-title">{legalTopic}</h2>
              <button type="button" aria-label="Close dialog" onClick={() => setLegalTopic('')}><X size={18} /></button>
            </header>
            <p>Accounts for this demo are stored in this browser only. Do not reuse a password from another service.</p>
          </section>
        </div>
      )}
      {resetOpen && (
        <div className="auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setResetOpen(false) }}>
          <section className="auth-legal-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-reset-title">
            <header>
              <h2 id="auth-reset-title">Reset password</h2>
              <button type="button" aria-label="Close dialog" onClick={() => setResetOpen(false)}><X size={18} /></button>
            </header>
            <p>This updates the demo account saved in this browser. It does not send an email.</p>
            <form className="form-stack auth-reset-form" onSubmit={handleResetSubmit}>
              <label htmlFor="auth-reset-email">Email Address
                <input id="auth-reset-email" type="email" required value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} />
              </label>
              <label htmlFor="auth-reset-password">New Password
                <input id="auth-reset-password" type="password" required minLength="6" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} />
              </label>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait...' : 'Update password'}</Button>
            </form>
            {resetError && <p className="auth-feedback" role="alert">{resetError}</p>}
          </section>
        </div>
      )}
    </main>
  )
}

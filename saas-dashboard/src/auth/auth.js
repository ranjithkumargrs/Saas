const ACCOUNTS_KEY = 'saas-dashboard-demo-accounts'
const SESSION_KEY = 'saas-dashboard-demo-session'
const REMEMBERED_SESSION_KEY = 'saas-dashboard-demo-remembered-session'
const PASSWORD_ITERATIONS = 210000

function readAccounts() {
  const saved = window.localStorage.getItem(ACCOUNTS_KEY)
  if (!saved) return []

  const accounts = JSON.parse(saved)
  if (!Array.isArray(accounts)) throw new Error('Saved demo accounts are invalid. Clear this app’s stored data and try again.')
  return accounts
}

function toHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function fromHex(value) {
  if (value.length % 2 !== 0 || !/^[\da-f]*$/i.test(value)) throw new Error('Saved password data is invalid.')
  return Uint8Array.from(value.match(/.{2}/g) || [], (byte) => Number.parseInt(byte, 16))
}

async function hashPassword(password, salt) {
  if (!window.crypto?.subtle) throw new Error('Secure password hashing is unavailable in this browser. Use localhost or HTTPS.')

  const key = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_ITERATIONS },
    key,
    256,
  )
  return new Uint8Array(bits)
}

function passwordsMatch(first, second) {
  if (first.length !== second.length) return false
  let difference = 0
  for (let index = 0; index < first.length; index += 1) difference |= first[index] ^ second[index]
  return difference === 0
}

function publicAccount(account) {
  return { id: account.id, name: account.name, email: account.email, username: account.username }
}

export async function createAccount({ name, email, username, password }) {
  const accounts = readAccounts()
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim().toLowerCase()

  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error('An account with this email already exists. Log in instead.')
  }
  if (accounts.some((account) => account.username === normalizedUsername)) {
    throw new Error('This username is already taken. Choose another one.')
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const passwordHash = await hashPassword(password, salt)
  const account = {
    id: window.crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    username: normalizedUsername,
    salt: toHex(salt),
    passwordHash: toHex(passwordHash),
  }

  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
  return publicAccount(account)
}

export async function authenticateAccount({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  const account = readAccounts().find((savedAccount) => savedAccount.email === normalizedEmail)
  if (!account) throw new Error('No account found for this email. Create an account first.')

  const candidateHash = await hashPassword(password, fromHex(account.salt))
  if (!passwordsMatch(candidateHash, fromHex(account.passwordHash))) {
    throw new Error('The password is incorrect. Check it and try again.')
  }
  return publicAccount(account)
}

export async function resetAccountPassword({ email, password }) {
  const accounts = readAccounts()
  const normalizedEmail = email.trim().toLowerCase()
  const accountIndex = accounts.findIndex((savedAccount) => savedAccount.email === normalizedEmail)
  if (accountIndex === -1) throw new Error('No account found for this email.')

  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const passwordHash = await hashPassword(password, salt)
  accounts[accountIndex] = { ...accounts[accountIndex], salt: toHex(salt), passwordHash: toHex(passwordHash) }
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function createSession(account, rememberMe) {
  const storage = rememberMe ? window.localStorage : window.sessionStorage
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage
  otherStorage.removeItem(rememberMe ? SESSION_KEY : REMEMBERED_SESSION_KEY)
  storage.setItem(rememberMe ? REMEMBERED_SESSION_KEY : SESSION_KEY, JSON.stringify(account))
}

export function getCurrentUser() {
  for (const [storage, key] of [
    [window.sessionStorage, SESSION_KEY],
    [window.localStorage, REMEMBERED_SESSION_KEY],
  ]) {
    const saved = storage.getItem(key)
    if (!saved) continue
    try {
      const user = JSON.parse(saved)
      if (user && typeof user.id === 'string' && typeof user.email === 'string') return user
      throw new Error('Saved session is invalid.')
    } catch (error) {
      console.error('Unable to read the saved sign-in session.', error)
      storage.removeItem(key)
    }
  }
  return null
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem(REMEMBERED_SESSION_KEY)
}

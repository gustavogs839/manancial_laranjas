import { isFirebaseConfigured, onFirebaseAuthStateChanged, signInWithEmail, signOutFirebase } from './firebase'

const AUTH_KEY = 'manancial_auth_v1'
const USERNAME = import.meta.env.VITE_APP_USERNAME || 'admin'
const PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'laranja123'

export function loadAuth(){
  if (isFirebaseConfigured) {
    return false
  }

  try { return localStorage.getItem(AUTH_KEY) === '1' }
  catch (e) { return false }
}

export function saveAuth(state){
  try { localStorage.setItem(AUTH_KEY, state ? '1' : '0') }
  catch (e) { console.error('Falha ao salvar estado de autenticação:', e) }
}

export async function login({ email, password }){
  if (isFirebaseConfigured) {
    await signInWithEmail(email, password)
    saveAuth(true)
    return true
  }

  const isValid = email === USERNAME && password === PASSWORD
  saveAuth(isValid)
  return isValid
}

export async function logout(){
  if (isFirebaseConfigured) {
    await signOutFirebase()
  }
  saveAuth(false)
}

export function subscribeAuthState(callback) {
  if (isFirebaseConfigured) {
    return onFirebaseAuthStateChanged(user => callback(!!user))
  }

  callback(loadAuth())
  return () => {}
}

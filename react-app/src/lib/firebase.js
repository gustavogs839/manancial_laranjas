import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app
let db
let auth
if (isFirebaseConfigured) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  }
  db = getFirestore()
  auth = getAuth(app)
}

export async function fetchTxsFromFirebase() {
  if (!db) return []
  const txCollection = collection(db, 'transactions')
  const txQuery = query(txCollection, orderBy('date', 'desc'))
  const snapshot = await getDocs(txQuery)
  return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
}

export async function syncTxsToFirebase(txs) {
  if (!db) return
  const txCollection = collection(db, 'transactions')
  const snapshot = await getDocs(txCollection)
  const batch = writeBatch(db)
  const keepIds = new Set(txs.map(tx => tx.id))

  snapshot.docs.forEach(docSnap => {
    if (!keepIds.has(docSnap.id)) {
      batch.delete(doc(db, 'transactions', docSnap.id))
    }
  })

  txs.forEach(tx => {
    const txDoc = doc(db, 'transactions', tx.id)
    batch.set(txDoc, {
      ...tx,
      amount: Number(tx.amount),
    })
  })

  await batch.commit()
}

export async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Firebase Auth is not configured')
  return signInWithEmailAndPassword(auth, email, password)
}

export function signOutFirebase() {
  if (!auth) return Promise.resolve()
  return signOut(auth)
}

export function onFirebaseAuthStateChanged(callback) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

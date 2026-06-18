import { fetchTxsFromFirebase, isFirebaseConfigured, syncTxsToFirebase } from './firebase'

const LS_KEY = 'manancial_tx_v1'

export async function loadTxs(){
  try{
    if (isFirebaseConfigured) {
      const txs = await fetchTxsFromFirebase()
      if (txs.length) return txs
    }
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  }catch(e){
    console.error('Falha ao carregar transações:', e)
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : []
  }
}

export function saveTxs(txs){
  try{
    localStorage.setItem(LS_KEY, JSON.stringify(txs))
  }catch(e){
    console.error('Falha ao salvar localmente:', e)
  }

  if (isFirebaseConfigured) {
    syncTxsToFirebase(txs).catch(err => {
      console.error('Falha ao sincronizar com Firebase:', err)
    })
  }
}

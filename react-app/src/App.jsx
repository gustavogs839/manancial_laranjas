import React, { useEffect, useState } from 'react'
import Form from './components/Form'
import Summary from './components/Summary'
import TxTable from './components/TxTable'
import Login from './components/Login'
import { loadTxs, saveTxs } from './lib/storage'
import { login, logout, subscribeAuthState } from './lib/auth'
import { exportPdfFromElement } from './lib/pdf'

const today = new Date().toISOString().slice(0,10)

export default function App(){
  const [txs, setTxs] = useState([])
  const [filter, setFilter] = useState({start:'', end: today})
  const [editing, setEditing] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(()=>{
    const init = async () => {
      const unsubscribe = subscribeAuthState(setAuthenticated)
      const loaded = await loadTxs()
      setTxs(loaded)
      return unsubscribe
    }
    const cleanupPromise = init()
    return () => {
      cleanupPromise.then(unsubscribe => unsubscribe && unsubscribe())
    }
  }, [])

  useEffect(()=>{ saveTxs(txs) }, [txs])

  const addOrUpdate = (tx) =>{
    setTxs(prev=>{
      if(tx.id) return prev.map(p=>p.id===tx.id?tx:p)
      return [...prev, {...tx, id: Date.now().toString()}]
    })
    setEditing(null)
  }

  const remove = id => setTxs(prev=>prev.filter(t=>t.id!==id))

  const startEdit = (tx) => setEditing(tx)

  const printElgin = async () =>{
    const { printElginFromTxs } = await import('./lib/pdf')
    printElginFromTxs(filtered())
  }

  const filtered = () =>{
    if(!filter.start && !filter.end) return txs
    const s = filter.start ? new Date(filter.start) : null
    const e = filter.end ? new Date(filter.end) : null
    return txs.filter(t=>{
      const d = new Date(t.date)
      if(s && d < s) return false
      if(e && d > e) return false
      return true
    })
  }

  const exportPdf = () =>{
    const el = document.getElementById('reportCard')
    exportPdfFromElement(el, 'relatorio_manancial_laranjas.pdf')
  }

  const handleLogin = async credentials => {
    try {
      const success = await login(credentials)
      if (success) {
        setAuthenticated(true)
        return true
      }
    } catch (error) {
      console.error('Login Firebase falhou:', error)
    }
    return false
  }

  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">ML</div>
        <div>
          <h1>Manancial Laranjas</h1>
          <p className="subtitle">Controle de Vendas</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Sair</button>
      </header>
      <main className="container">
        <section className="left">
          <Form onSave={addOrUpdate} editing={editing} onCancel={()=>setEditing(null)} />
        </section>
        <section className="right">
          <div id="reportCard" className="report-card">
            <Summary txs={filtered()} filter={filter} setFilter={setFilter} />
            <TxTable txs={filtered()} onDelete={remove} onEditStart={startEdit} />
            <div className="report-actions">
              <button onClick={exportPdf}>Exportar PDF</button>
              <button onClick={printElgin}>Imprimir (Elgin i9)</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

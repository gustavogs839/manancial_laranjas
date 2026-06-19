import React from 'react'

function Card({title, value, icon}){
  return <div className="card"><strong>{icon} {title}</strong><div>R$ {value.toFixed(2)}</div></div>
}

export default function Summary({ txs, filter, setFilter }){
  const totals = {entrada:0, saida:0, dinheiro:0, debito:0, credito:0, pix:0}
  txs.forEach(t=>{
    if(t.type==='entrada') totals.entrada += t.amount
    else totals.saida += t.amount
    totals[t.method] = (totals[t.method]||0) + (t.type === 'entrada' ? t.amount : -t.amount)
  })

  const today = new Date().toISOString().slice(0,10)

  return (
    <>
      <div className="summary">
        <Card icon={'🟢'} title="Entradas" value={totals.entrada} />
        <Card icon={'🔴'} title="Saídas" value={totals.saida} />
        <Card icon={'💵'} title="Dinheiro" value={totals.dinheiro} />
        <Card icon={'💳'} title="Débito" value={totals.debito} />
        <Card icon={'💳'} title="Crédito" value={totals.credito} />
        <Card icon={'⚡'} title="PIX" value={totals.pix} />
      </div>
      <div className="filters">
        <label>De: <input type="date" value={filter.start} onChange={e=>setFilter(f=>({...f, start: e.target.value}))} /></label>
        <label>Até: <input type="date" value={filter.end} onChange={e=>setFilter(f=>({...f, end: e.target.value}))} /></label>
        <button onClick={()=>setFilter({start:today,end:today})}>Hoje</button>
        <button onClick={()=>setFilter({start:'',end: today})}>Limpar filtro</button>
      </div>
    </>
  )
}

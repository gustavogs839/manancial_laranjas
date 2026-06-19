import React from 'react'

function formatDateLong(date){
  const parsed = typeof date === 'string'
    ? new Date(Number(date.slice(0,4)), Number(date.slice(5,7)) - 1, Number(date.slice(8,10)))
    : date
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsed).replace(',', '')
}

export default function TxTable({ txs, onDelete, onEditStart }){
  return (
    <div className="list-wrap">
      <table>
        <thead>
          <tr><th>Data</th><th>Tipo</th><th>Método</th><th>Desc</th><th>Valor</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {txs.slice().reverse().map(tx=> (
            <tr key={tx.id}>
              <td data-iso={tx.date}>{formatDateLong(tx.date)}</td>
              <td>
                <span className={`badge ${tx.type==='entrada'? 'entrada':'saida'}`}>{tx.type.toUpperCase()}</span>
              </td>
              <td><span className="method">{tx.method}</span></td>
              <td>{tx.desc}</td>
              <td>R$ {tx.amount.toFixed(2)}</td>
              <td>
                <button className="table-action edit" onClick={()=>onEditStart(tx)} title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21v-3.75L17.81 2.44a2.12 2.12 0 013 3L6 20.25H3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="table-action delete" onClick={()=>onDelete(tx.id)} title="Excluir">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M8 6v12a2 2 0 002 2h4a2 2 0 002-2V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

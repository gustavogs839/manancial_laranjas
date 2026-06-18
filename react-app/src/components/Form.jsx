import React, { useEffect, useState } from 'react'

const empty = { type:'entrada', method:'dinheiro', amount:'', date:'', desc:'' }

function defaultData(){
  return {...empty, date: new Date().toISOString().slice(0,10)}
}

export default function Form({ onSave, editing, onCancel }){
  const [data, setData] = useState(empty)

  useEffect(()=>{
    if(editing){ setData({...editing}) }
    else if(!data.date){ setData(defaultData()) }
  }, [editing])

  const change = e => setData({...data, [e.target.name]: e.target.value})

  const submit = e =>{
    e.preventDefault()
    const amount = parseFloat(data.amount || 0)
    if(!amount || isNaN(amount)){ alert('Informe valor válido'); return }
    onSave({...data, amount})
    setData(defaultData())
  }

  const cancel = () =>{
    setData(defaultData())
    if(onCancel) onCancel()
  }

  return (
    <div className="form-card">
      <h2>Novo Lançamento</h2>
      <form onSubmit={submit}>
        <div className="row">
          <label>Tipo
            <select name="type" value={data.type} onChange={change}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </label>
          <label>Método
            <select name="method" value={data.method} onChange={change}>
              <option value="dinheiro">Dinheiro</option>
              <option value="debito">Cartão Débito</option>
              <option value="credito">Cartão Crédito</option>
              <option value="pix">PIX</option>
            </select>
          </label>
        </div>
        <div className="row">
          <label>Valor
            <input name="amount" type="number" step="0.01" value={data.amount} onChange={change} placeholder="0.00" />
          </label>
          <label>Data
            <input name="date" type="date" value={data.date} onChange={change} />
          </label>
        </div>
        <label>Descrição
          <input name="desc" value={data.desc} onChange={change} />
        </label>
        <div className="actions">
          <button type="submit">
            {editing ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12l4 4L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Salvar
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Adicionar
              </>
            )}
          </button>
          <button type="button" onClick={cancel} className="cancel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {editing ? 'Cancelar' : 'Limpar'}
          </button>
        </div>
      </form>
    </div>
  )
}

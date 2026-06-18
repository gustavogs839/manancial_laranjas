import React, { useState } from 'react'

export default function Login({ onLogin }){
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')

  const change = e => setForm({...form, [e.target.name]: e.target.value})

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Preencha email e senha.')
      return
    }
    const success = await onLogin(form)
    if (!success) {
      setError('Email ou senha inválidos.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Entrar no sistema</h2>
        <form onSubmit={submit}>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={change} autoComplete="username" />
          </label>
          <label>
            Senha
            <input name="password" type="password" value={form.password} onChange={change} autoComplete="current-password" />
          </label>
          {error && <div className="login-error">{error}</div>}
          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  )
}

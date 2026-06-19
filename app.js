// Controle simples de lançamentos — localStorage
const LS_KEY = 'manancial_tx_v1'
let txs = []
let editingId = null
let currentView = null // lista atual mostrada (filtro aplicado)

const $ = sel => document.querySelector(sel)
const $$ = sel => document.querySelectorAll(sel)

function formatIsoDate(date = new Date()){
  return date.toISOString().slice(0,10)
}

function parseIsoDate(date){
  if(!date) return new Date()
  if(typeof date === 'string'){
    const [year, month, day] = date.split('-')
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  }
  return date
}

function formatDateLong(date = new Date()){
  const parsed = parseIsoDate(date)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsed).replace(',', '')
}

function init(){
  bind()
  load()
  render()
  const today = formatIsoDate()
  if(!$('#date').value) $('#date').value = today
  if(!$('#filterEnd').value) $('#filterEnd').value = today
}

function bind(){
  $('#txForm').addEventListener('submit', e => { e.preventDefault(); addTx() })
  $('#clearBtn').addEventListener('click', clearForm)
  $('#exportPdf').addEventListener('click', exportPdf)
  $('#printElgin').addEventListener('click', printElgin)
  $('#applyFilter').addEventListener('click', applyFilter)
  $('#todayFilter').addEventListener('click', filterToday)
  $('#clearFilter').addEventListener('click', clearFilter)
  $('#txTable tbody').addEventListener('click', onTableClick)
}

function load(){
  const raw = localStorage.getItem(LS_KEY)
  txs = raw ? JSON.parse(raw) : []
}

function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(txs))
}

function addTx(){
  const type = $('#type').value
  const method = $('#method').value
  const amount = parseFloat($('#amount').value || 0)
  const date = $('#date').value || new Date().toISOString().slice(0,10)
  const desc = $('#desc').value || ''
  if(!amount || isNaN(amount)) return alert('Informe um valor válido')

  if(editingId){
    const idx = txs.findIndex(t=>t.id===editingId)
    if(idx>-1){ txs[idx] = { id: editingId, type, method, amount, date, desc } }
    editingId = null
  } else {
    txs.push({id: Date.now().toString(), type,method,amount, date, desc})
  }
  save()
  render()
  clearForm()
}

function clearForm(){
  const today = new Date().toISOString().slice(0,10)
  $('#amount').value=''
  $('#desc').value=''
  $('#date').value=today
}

function render(){
  const list = currentView || txs
  const tbody = $('#txTable tbody')
  tbody.innerHTML = ''
  list.slice().reverse().forEach(tx => {
    const tr = document.createElement('tr')
    tr.innerHTML = `<td>${tx.date}</td><td>${tx.type}</td><td>${tx.method}</td><td>${tx.desc}</td><td>R$ ${tx.amount.toFixed(2)}</td><td><button class="table-action edit" data-id="${tx.id}">Editar</button><button class="table-action delete" data-id="${tx.id}">Excluir</button></td>`
    tbody.appendChild(tr)
  })
  renderSummary(list)
}

function renderSummary(){
  const summary = $('#summary')
  const totals = {entrada:0, saida:0, dinheiro:0, debito:0, credito:0, pix:0}
  const list = arguments[0] || txs
  for(const t of list){
    if(t.type === 'entrada'){ totals.entrada += t.amount }
    else totals.saida += t.amount
    totals[t.method] = (totals[t.method]||0) + (t.type === 'entrada' ? t.amount : -t.amount)
  }
  summary.innerHTML = `
    <div class="card"><strong>Total Entradas</strong><div>R$ ${totals.entrada.toFixed(2)}</div></div>
    <div class="card"><strong>Total Saídas</strong><div>R$ ${totals.saida.toFixed(2)}</div></div>
    <div class="card"><strong>Dinheiro</strong><div>R$ ${totals.dinheiro.toFixed(2)}</div></div>
    <div class="card"><strong>Débito</strong><div>R$ ${totals.debito.toFixed(2)}</div></div>
    <div class="card"><strong>Crédito</strong><div>R$ ${totals.credito.toFixed(2)}</div></div>
    <div class="card"><strong>PIX</strong><div>R$ ${totals.pix.toFixed(2)}</div></div>
  `
}

function onTableClick(e){
  const id = e.target.getAttribute('data-id')
  if(!id) return
  if(e.target.classList.contains('delete')) return deleteTx(id)
  if(e.target.classList.contains('edit')) return editTx(id)
}

function deleteTx(id){
  if(!confirm('Excluir lançamento?')) return
  txs = txs.filter(t=>t.id!==id)
  save(); render()
}

function editTx(id){
  const t = txs.find(x=>x.id===id)
  if(!t) return
  $('#type').value = t.type
  $('#method').value = t.method
  $('#amount').value = t.amount
  $('#date').value = t.date
  $('#desc').value = t.desc
  editingId = id
}

function applyFilter(){
  const start = $('#filterStart').value
  const end = $('#filterEnd').value
  if(!start && !end){ currentView = null; render(); return }
  const s = start ? new Date(start) : null
  const e = end ? new Date(end) : null
  currentView = txs.filter(t=>{
    const d = new Date(t.date)
    if(s && d < s) return false
    if(e && d > e) return false
    return true
  })
  render()
}

function filterToday(){
  const today = formatIsoDate()
  $('#filterStart').value = today
  $('#filterEnd').value = today
  applyFilter()
}

function clearFilter(){
  $('#filterStart').value = ''
  $('#filterEnd').value = formatIsoDate()
  currentView = null
  render()
}

async function exportPdf(){
  const el = document.querySelector('.report-card')
  const clone = el.cloneNode(true)
  // remove controles e botões
  clone.querySelectorAll('.table-action, .report-actions, .filters, button').forEach(n=>n.remove())
  // inserir cabeçalho com data do relatório
  const header = document.createElement('div')
  header.style.textAlign = 'center'
  header.style.marginBottom = '8px'
  const dateStr = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date()).replace(',', '')
  header.innerHTML = `<h2 style="margin:0">Manancial Laranjas</h2><div style="font-size:0.9rem;color:#555">Relatório — ${dateStr}</div>`
  clone.insertBefore(header, clone.firstChild)

  const table = clone.querySelector('#txTable')
  if(table){
    const ths = table.querySelectorAll('thead th')
    if(ths.length) ths[ths.length - 1].remove()
    table.querySelectorAll('tbody tr').forEach(tr=>{
      const cells = tr.querySelectorAll('td')
      if(cells.length){
        const dateCell = cells[0]
        const dateText = dateCell.textContent.trim()
        const longDate = dateText ? formatDateLong(dateText) : ''
            dateCell.innerHTML = `<div style="font-size:0.85rem;color:#333">${longDate}</div>`
  document.body.appendChild(wrap)

  const canvas = await html2canvas(clone, {scale:2, useCORS:true, allowTaint:false})
  const img = canvas.toDataURL('image/png')
  const { jsPDF } = window.jspdf
  const pdf = new jsPDF('p','mm','a4')
  const imgProps = pdf.getImageProperties(img)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save('relatorio_manancial_laranjas.pdf')

  document.body.removeChild(wrap)
}

function printElgin(){
  const list = currentView || txs
  const entradas = list.filter(t=>t.type === 'entrada')
  const saidas = list.filter(t=>t.type === 'saida')

  function sectionHtml(title, items){
    let html = `<h3>${title}</h3><hr>`
    if(items.length===0) html += `<p>— nenhum —</p>`
    else{
      for(const t of items){
        html += `<p>${t.date} | ${t.method} | R$ ${t.amount.toFixed(2)} ${t.desc ? ' - '+t.desc : ''}</p>`
      }
    }
    return html
  }

  // totais por seção
  const sum = arr => arr.reduce((s,x)=>s + (x.amount||0),0)
  const totalEntradas = sum(entradas)
  const totalSaidas = sum(saidas)

  const reportDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date()).replace(',', '')

  let html = `
    <div class="receipt">
      <h2>Manancial Laranjas</h2>
      <div style="text-align:center;font-size:0.9rem;color:#333;margin-bottom:8px">Relatório — ${reportDate}</div>
      <div class="body">
        ${sectionHtml('ENTRADAS', entradas)}
        <p><strong>Total Entradas: R$ ${totalEntradas.toFixed(2)}</strong></p>
        <div style="height:8px"></div>
        ${sectionHtml('SAÍDAS', saidas)}
        <p><strong>Total Saídas: R$ ${totalSaidas.toFixed(2)}</strong></p>
        <hr>
        <p><strong>Saldo: R$ ${(totalEntradas - totalSaidas).toFixed(2)}</strong></p>
      </div>
      <p class="small">Obrigado pela preferência</p>
    </div>
  `

  const w = window.open('', '_blank')
  w.document.write('<html><head><title>Recibo</title>')
  w.document.write('<meta charset="utf-8" />')
  w.document.write('<style>body{font-family:monospace;padding:8px;width:80mm} h2{text-align:center;margin:6px 0} h3{margin:8px 0 4px;font-size:14px} p{margin:3px 0;font-size:12px} hr{border:none;border-top:1px dashed #333;margin:6px 0}</style>')
  w.document.write('</head><body>')
  w.document.write(html)
  w.document.write('</body></html>')
  w.document.close()
  w.focus()
  setTimeout(()=>{ w.print(); w.close() },500)
}

// Inicializa ao carregar
document.addEventListener('DOMContentLoaded', init)

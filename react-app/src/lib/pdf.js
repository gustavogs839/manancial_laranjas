import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

function formatReportDate(date = new Date()){
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date).replace(',', '')
}

function formatDateLong(date = new Date()){
  const parsed = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsed).replace(',', '')
}

export async function exportPdfFromElement(el, filename='relatorio.pdf'){
  // Clona o elemento para remover controles interativos antes de renderizar
  const clone = el.cloneNode(true)
  // Remove botões e elementos que não devem aparecer no PDF
  const unwanted = clone.querySelectorAll('.table-action, .report-actions, .filters, button')
  unwanted.forEach(n=>n.remove())
  // Ajusta tabela para o PDF
  const table = clone.querySelector('table')
  if(table){
    const ths = table.querySelectorAll('thead th')
    if(ths.length) ths[ths.length - 1].remove()
    table.querySelectorAll('tbody tr').forEach(tr => {
      const cells = tr.querySelectorAll('td')
      if(cells.length){
        const dateCell = cells[0]
        const dateText = dateCell.textContent.trim()
        const longDate = dateText ? formatDateLong(dateText) : ''
        dateCell.innerHTML = `<div>${dateText}</div><div style="font-size:0.75rem;color:#555">${longDate}</div>`
        if(cells.length > 1) cells[cells.length - 1].remove()
      }
    })
  }

  // Insere data do relatório no topo
  const header = document.createElement('div')
  header.style.textAlign = 'center'
  header.style.marginBottom = '8px'
  const dateStr = formatReportDate()
  header.innerHTML = `<h2 style="margin:0">Manancial Laranjas</h2><div style="font-size:0.9rem;color:#555">Relatório — ${dateStr}</div>`
  clone.insertBefore(header, clone.firstChild)

  // Renderizar o clone num container offscreen
  const wrap = document.createElement('div')
  wrap.style.position = 'fixed'
  wrap.style.left = '-10000px'
  wrap.style.top = '0'
  wrap.appendChild(clone)
  document.body.appendChild(wrap)

  const canvas = await html2canvas(clone, { scale:2, useCORS:true, allowTaint:false })
  const img = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p','mm','a4')
  const imgProps = pdf.getImageProperties(img)
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
  pdf.addImage(img, 'PNG', 0, 0, pdfWidth, pdfHeight)
  pdf.save(filename)

  // limpar
  document.body.removeChild(wrap)
}

export function printElginFromTxs(txs){
  const entradas = txs.filter(t=>t.type==='entrada')
  const saidas = txs.filter(t=>t.type==='saida')

  const sum = arr => arr.reduce((s,x)=>s + (x.amount||0),0)
  const totalEntradas = sum(entradas)
  const totalSaidas = sum(saidas)

  const sectionHtml = (title, items) => {
    let html = `<h3>${title}</h3><hr>`
    if(items.length===0) html += `<p>— nenhum —</p>`
    else items.forEach(t=> html += `<p>${formatDateLong(t.date)} | ${t.method} | R$ ${t.amount.toFixed(2)} ${t.desc? ' - '+t.desc: ''}</p>`)
    return html
  }

  const html = `
    <div class="receipt">
      <h2>Manancial Laranjas</h2>
      <div style="text-align:center;font-size:0.9rem;color:#333;margin-bottom:8px">Relatório — ${formatReportDate()}</div>
      ${sectionHtml('ENTRADAS', entradas)}
      <p><strong>Total Entradas: R$ ${totalEntradas.toFixed(2)}</strong></p>
      <div style="height:6px"></div>
      ${sectionHtml('SAÍDAS', saidas)}
      <p><strong>Total Saídas: R$ ${totalSaidas.toFixed(2)}</strong></p>
      <hr>
      <p><strong>Saldo: R$ ${(totalEntradas - totalSaidas).toFixed(2)}</strong></p>
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

const fs = require('fs')
const path = require('path')

function ok(msg){ console.log('[OK] ' + msg) }
function fail(msg){ console.error('[FAIL] ' + msg); process.exitCode = 2 }

function read(p){ try{ return fs.readFileSync(p,'utf8') }catch(e){ fail('Arquivo não encontrado: '+p); return null } }

const root = path.resolve(__dirname, '..')

// Testes para versão simples (plain)
const index = read(path.join(root,'index.html'))
if(index && index.includes('Manancial Laranjas')) ok('index.html contém título')
else fail('index.html não contém título')

if(index && index.includes('id="txForm"')) ok('index.html contém formulário com id txForm')
else fail('index.html não contém formulário txForm')

const appjs = read(path.join(root,'app.js'))
if(appjs && appjs.includes('localStorage')) ok('app.js referencia localStorage')
else fail('app.js não referencia localStorage')

if(appjs && appjs.includes('exportPdf')) ok('app.js contém função exportPdf')
else fail('app.js não contém exportPdf')

// Testes para scaffold React
const pkg = read(path.join(root,'react-app','package.json'))
if(pkg && pkg.includes('vite')) ok('react-app/package.json contém vite')
else fail('react-app/package.json não contém vite')

const appjsx = read(path.join(root,'react-app','src','App.jsx'))
if(appjsx && appjsx.includes('Manancial Laranjas')) ok('react App.jsx contém título')
else fail('react App.jsx sem título esperado')

const formjsx = read(path.join(root,'react-app','src','components','Form.jsx'))
if(formjsx && formjsx.includes('Novo Lançamento')) ok('Form.jsx contém "Novo Lançamento"')
else fail('Form.jsx não contém texto esperado')

console.log('\nTestes concluídos. Verifique resultados acima. Exit code:', process.exitCode || 0)
if(process.exitCode) process.exit(process.exitCode)

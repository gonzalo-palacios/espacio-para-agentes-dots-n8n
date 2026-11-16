const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../src/serve.cjs'),'utf8');
for(const route of ['/tasks.html','/tasks-core.js','/tasks-ui.js'])assert.ok(source.includes(route),`Debe servir ${route}`);
assert.ok(source.includes('127.0.0.1'));assert.ok(!source.includes('0.0.0.0'));
const page=fs.readFileSync(require('node:path').join(__dirname,'../desktop/tasks.html'),'utf8');assert.ok(page.includes('tasks-core.js'));assert.ok(page.includes('tasks-ui.js'));assert.ok(page.includes('maxlength="10000"'));
const ui=fs.readFileSync(require('node:path').join(__dirname,'../desktop/tasks-ui.js'),'utf8');assert.ok(!/innerHTML|fetch\(|XMLHttpRequest|localStorage/.test(ui));assert.ok(ui.includes('textContent'));console.log('Task routes and privacy checks PASS');

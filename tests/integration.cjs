const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const desktop=fs.readFileSync(path.join(root,'desktop/index.html'),'utf8');
assert.ok(desktop.includes('href="tasks.html"'));
assert.ok(desktop.includes('href="map3d/index.html"'));
const server=fs.readFileSync(path.join(root,'src/serve.cjs'),'utf8');
for(const name of ['index.html','graph.js','view.js']){
 assert.ok(server.includes('/map3d/'+name));
 assert.ok(fs.existsSync(path.join(root,'desktop/map3d',name)));
}
for(const file of ['index.html','graph.js','view.js']){
 const content=fs.readFileSync(path.join(root,'desktop/map3d',file),'utf8');
 assert.ok(!/fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|https?:\/\//.test(content));
}
assert.ok(!fs.existsSync(path.join(root,'INTEGRATION-NOTES.md')));
assert.ok(fs.existsSync(path.join(root,'GOVERNANCE.md')));
console.log('Integration links, static routes, offline map, public governance: PASS');

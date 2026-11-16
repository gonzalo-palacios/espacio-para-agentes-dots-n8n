const assert=require('node:assert/strict');
const A=require('../desktop/appearance-core.js');
assert.deepEqual(A.normalize({mode:'phone',wallpaper:'sunset',shape:'circle'}),{mode:'phone',wallpaper:'sunset',shape:'circle'});
assert.deepEqual(A.normalize({mode:'invalid',wallpaper:'url(secret)',shape:'bad',token:'secret'}),A.defaults);
assert.deepEqual(A.decode('{bad'),A.defaults);
assert.deepEqual(A.decode('null'),A.defaults);
assert.equal(A.encode({mode:'phone',wallpaper:'forest',shape:'square',secret:'x'}),'{"mode":"phone","wallpaper":"forest","shape":"square"}');
const fs=require('node:fs'),path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'../desktop/index.html'),'utf8');
assert.ok(page.includes('Guardar en este navegador'));
assert.ok(page.includes('Olvidar ajustes'));
assert.ok(page.includes('appearance-ui.js'));
const ui=fs.readFileSync(path.join(__dirname,'../desktop/appearance-ui.js'),'utf8');
assert.ok(!/fetch\s*\(|XMLHttpRequest|WebSocket|innerHTML/.test(ui));
const server=fs.readFileSync(path.join(__dirname,'../src/serve.cjs'),'utf8');
for(const file of ['appearance-core.js','appearance-ui.js','appearance.css']) assert.ok(server.includes('/'+file));
console.log('Appearance validation, allowlist, privacy, controls and routes PASS');
const vm=require('node:vm');
function harness(storage={}, denied=[]){
 const elements={};let writes=0;const body={dataset:{}};
 for(const name of ['mode','wallpaper','shape','save','reset','status'])elements['appearance-'+name]={name,value:'',handlers:{},addEventListener(event,fn){this.handlers[event]=fn}};
 function guard(operation){if(denied.includes(operation))throw new Error('SecurityError: storage denied')}
 const store={getItem(k){guard('getItem');return storage[k]??null},setItem(k,v){guard('setItem');writes++;storage[k]=v},removeItem(k){guard('removeItem');delete storage[k]}};
 vm.runInNewContext(ui,{globalThis:{AgentAppearance:A},document:{body,getElementById:id=>elements[id]},localStorage:store});
 return {elements,body,storage,writes:()=>writes};
}
const h=harness();assert.equal(h.writes(),0);assert.equal(h.body.dataset.mode,'desktop');
h.elements['appearance-mode'].value='phone';h.elements['appearance-mode'].handlers.change();assert.equal(h.body.dataset.mode,'phone');assert.equal(h.writes(),0);
h.elements['appearance-save'].handlers.click();assert.equal(h.writes(),1);assert.equal(JSON.parse(h.storage['dots-n8n-appearance-v1']).mode,'phone');
const restored=harness(h.storage);assert.equal(restored.body.dataset.mode,'phone');assert.equal(restored.writes(),0);
restored.elements['appearance-reset'].handlers.click();assert.equal(restored.body.dataset.mode,'desktop');assert.equal(h.storage['dots-n8n-appearance-v1'],undefined);
const corrupt=harness({'dots-n8n-appearance-v1':'{"mode":"javascript:bad"}'});assert.equal(corrupt.body.dataset.mode,'desktop');
console.log('Appearance mocked UI: explicit save, restore, reset, no automatic writes PASS');

// Browser privacy policies may independently deny reading, writing or deletion.
const denied=harness({},['getItem','setItem','removeItem']);
assert.equal(denied.body.dataset.mode,'desktop');
assert.match(denied.elements['appearance-status'].textContent,/no permite guardar/);
denied.elements['appearance-mode'].value='phone';
assert.doesNotThrow(()=>denied.elements['appearance-mode'].handlers.change());
assert.equal(denied.body.dataset.mode,'phone');
assert.doesNotThrow(()=>denied.elements['appearance-save'].handlers.click());
assert.equal(denied.body.dataset.mode,'phone');
assert.equal(denied.writes(),0);
assert.deepEqual(denied.storage,{});
assert.match(denied.elements['appearance-status'].textContent,/No se pudo guardar/);
assert.doesNotThrow(()=>denied.elements['appearance-reset'].handlers.click());
assert.equal(denied.body.dataset.mode,'desktop');
assert.match(denied.elements['appearance-status'].textContent,/No se pudo borrar/);
// A failed removal must not claim saved preferences are gone.
const previous={'dots-n8n-appearance-v1':A.encode({mode:'phone'})};
const cannotRemove=harness(previous,['removeItem']);
assert.equal(cannotRemove.body.dataset.mode,'phone');
cannotRemove.elements['appearance-reset'].handlers.click();
assert.equal(cannotRemove.body.dataset.mode,'desktop');
assert.equal(A.decode(previous['dots-n8n-appearance-v1']).mode,'phone');
assert.match(cannotRemove.elements['appearance-status'].textContent,/No se pudo borrar/);
console.log('Appearance storage exceptions: read/write/delete denied, preview survives, truthful status PASS');

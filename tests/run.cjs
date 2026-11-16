const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');let checks=0;function check(fn){fn();checks++;}
function run(file,rows){const code=fs.readFileSync(path.join(root,'src',file+'.js'),'utf8');return vm.runInNewContext('(function(){'+code+'})()',{$input:{all:()=>rows.map(json=>({json}))}},{timeout:1000});}
check(()=>assert.equal(run('01-notas-a-lista',[{text:'uno;dos\ntres'}]).length,3));
check(()=>assert.equal(run('01-notas-a-lista',[{text:' ;\n '}]).length,0));
check(()=>assert.equal(run('01-notas-a-lista',[{text:'Ana mañana'}])[0].json.responsible,null));
check(()=>assert.throws(()=>run('01-notas-a-lista',[{text:null}])));
check(()=>assert.throws(()=>run('01-notas-a-lista',[{text:'x'.repeat(10001)}])));
const good={request_id:'test-001',action:'delegate',confirmed:true,target:'documents',hops:0,task:'nota ficticia'};
check(()=>assert.equal(run('02-enrutamiento-simulado',[good])[0].json.result,'simulated'));
for(const patch of [{request_id:''},{action:'status'},{confirmed:'true'},{confirmed:false},{target:'shell'},{hops:2},{hops:-1},{hops:0.5},{task:''},{task:'x'.repeat(2001)}])check(()=>assert.equal(run('02-enrutamiento-simulado',[{...good,...patch}])[0].json.result,'blocked'));
check(()=>assert.equal(run('02-enrutamiento-simulado',[good,good])[1].json.reason,'duplicado en este lote'));
check(()=>assert.equal(run('02-enrutamiento-simulado',[good])[0].json.external_action,false));
for(const f of fs.readdirSync(path.join(root,'workflows'))){const wf=JSON.parse(fs.readFileSync(path.join(root,'workflows',f)));check(()=>assert.equal(wf.active,false));check(()=>assert(wf.nodes.every(n=>['n8n-nodes-base.code','n8n-nodes-base.manualTrigger'].includes(n.type))));check(()=>assert(!JSON.stringify(wf).match(/credentials|https?:|webhook|access_token/i)));const sample=vm.runInNewContext('(function(){'+wf.nodes[1].parameters.jsCode+'})()');check(()=>assert(run(f.replace('.json',''),sample.map(x=>x.json)).length>0));check(()=>assert.equal(wf.nodes[2].parameters.jsCode.trim(),fs.readFileSync(path.join(root,'src',f.replace('.json','.js')),'utf8').trim()));}
const h=fs.readFileSync(path.join(root,'desktop/index.html'),'utf8'),script=h.match(/<script>([\s\S]*?)<\/script>/)[1];check(()=>new vm.Script(script));
const els={},listeners={};function el(id){return els[id]??={hidden:id==='.window',textContent:'',innerHTML:'',dataset:{},focus(){document.activeElement=this},querySelectorAll(){return [el('.close')]}}}const document={activeElement:null,querySelector:el,addEventListener:(k,v)=>listeners[k]=v};vm.runInNewContext(script,{document});
for(const id of ['agents','network','tools','voice','costs','audit','start','github'])check(()=>{const button={dataset:{app:id},focus(){document.activeElement=this}};el('.icons').onclick({target:{closest:()=>button}});assert.equal(el('.window').hidden,false);assert(el('#content').innerHTML.length>50);if(id==='network'){el('#simulate').onclick();assert(el('#log').textContent.includes('No hubo llamadas'));}el('.close').onclick();assert.equal(el('.window').hidden,true);assert.equal(document.activeElement,button)});
check(()=>assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|https?:\/\/|data:image|background.webp|dattaweb|gmail|gonzalo|xox[bap]-|sk-[A-Za-z0-9]{16}/i.test(h)));
check(()=>assert(h.includes('Espacio para Agentes Dots+N8N')));
check(()=>assert(h.includes('solo en el mismo lote')));
for(const file of ['CONTRIBUTING.md','CODE_OF_CONDUCT.md','ROADMAP.md','SECURITY.md'])check(()=>assert(fs.readFileSync(path.join(root,file),'utf8').length>200));
console.log(`PASS: ${checks} checks. Mock DOM and code-node simulation only; real browser and n8n import not verified.`);

'use strict';
// Instancia dedicada a NOD. Nunca usa la carpeta habitual de n8n.
const fs=require('node:fs'),path=require('node:path'),net=require('node:net');
const {spawn}=require('node:child_process');
const {createServer}=require('./serve.cjs');
const root=path.resolve(__dirname,'..'),lab=path.join(root,'private','n8n-local');
function n8nBin(){
 const bin=process.env.NOD_N8N_BIN||path.join(process.env.APPDATA||'', 'npm','node_modules','n8n','bin','n8n');
 if(!fs.existsSync(bin))throw Error('No se encuentra n8n. Instalalo o definí NOD_N8N_BIN con la ruta de su archivo bin/n8n.');return bin;
}
function environment(){
 const env={...process.env};for(const key of Object.keys(env))if(/^(N8N_|DB_|QUEUE_|EXECUTIONS_|NODE_FUNCTION_|NODE_OPTIONS$|WEBHOOK_URL$)/i.test(key))delete env[key];
 return {...env,N8N_USER_FOLDER:lab,DB_TYPE:'sqlite',N8N_LISTEN_ADDRESS:'127.0.0.1',N8N_HOST:'127.0.0.1',N8N_PORT:'5679',N8N_PROTOCOL:'http',N8N_RUNNERS_BROKER_LISTEN_ADDRESS:'127.0.0.1',N8N_RUNNERS_BROKER_PORT:'5680',N8N_DIAGNOSTICS_ENABLED:'false',N8N_VERSION_NOTIFICATIONS_ENABLED:'false',N8N_TEMPLATES_ENABLED:'false',N8N_COMMUNITY_PACKAGES_ENABLED:'false',N8N_PERSONALIZATION_ENABLED:'false',GENERIC_TIMEZONE:'America/Argentina/Buenos_Aires'};
}
function command(args,label){
 fs.mkdirSync(lab,{recursive:true});const log=fs.openSync(path.join(lab,label+'.log'),'w');
 const child=spawn(process.execPath,[n8nBin(),...args],{cwd:root,env:environment(),stdio:['ignore',log,log],windowsHide:true});fs.closeSync(log);return child;
}
async function run(args,label){
 const child=command(args,label);await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(`${label}: n8n terminó con código ${code}; revisá private/n8n-local/${label}.log`)));});
 return fs.readFileSync(path.join(lab,label+'.log'),'utf8');
}
async function free(port){await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',()=>reject(Error(`Puerto ${port} ocupado. Cerrá la instancia anterior antes de iniciar NOD+n8n.`)));s.listen(port,'127.0.0.1',()=>s.close(resolve));});}
async function setup(){
 await free(5679);await free(5680);fs.mkdirSync(lab,{recursive:true});
 const paths=['workflows/01-notas-a-lista.json','workflows/02-enrutamiento-simulado.json','examples/local-bridge/workflow.json'];const ids=['NodLocalNotes01','NodLocalRouting02','NodLocalBridge01'];
 const workflows=paths.map((p,i)=>({...JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),id:ids[i]}));
 const file=path.join(lab,'workflows.json');fs.writeFileSync(file,JSON.stringify(workflows,null,2));
 console.log('Importando tres workflows en la base exclusiva de NOD…');
 const imported=await run(['import:workflow',`--input=${file}`],'import');if(!imported.includes('Successfully imported 3 workflows'))throw Error('n8n no confirmó la importación; revisar import.log');
 console.log('Habilitando únicamente el webhook local de datos ficticios…');
 await run(['publish:workflow','--id=NodLocalBridge01'],'publish');
 const fileOut=path.join(lab,'export.json');await run(['export:workflow','--all',`--output=${fileOut}`],'export');
 const saved=JSON.parse(fs.readFileSync(fileOut,'utf8'));const bridge=saved.find(w=>w.id==='NodLocalBridge01');
 if(!bridge?.activeVersionId&&!bridge?.active)throw Error('No se pudo comprobar la publicación del puente.');
 fs.writeFileSync(path.join(lab,'ready.json'),JSON.stringify({schema:1,workflow:'NodLocalBridge01',port:5679}));console.log('Preparación local completa.');
}
async function manualTests(){
 for(const [id,label,count] of [['NodLocalNotes01','notes',3],['NodLocalRouting02','routing',2]]){
  console.log(`Ejecutando ${id} en n8n real…`);const out=await run(['execute',`--id=${id}`,'--rawOutput'],label);
  const offset=out.indexOf('{\n');if(offset<0)throw Error(`${label}: no hay resultado JSON`);
  // n8n puede escribir mensajes después del JSON; balancear objetos usando el parser por líneas.
  let result;for(let end=out.lastIndexOf('}');end>=offset;end=out.lastIndexOf('}',end-1)){try{result=JSON.parse(out.slice(offset,end+1));break;}catch{}}
  if(!result||result.data?.resultData?.error)throw Error(`${label}: ejecución fallida; revisar log local`);
  const data=result.data.resultData;const rows=data.runData[data.lastNodeExecuted]?.[0]?.data?.main?.[0];
  if(rows?.length!==count)throw Error(`${label}: salida inesperada`);
  if(label==='notes'&&rows.some(r=>r.json.responsible!==null||r.json.deadline!==null))throw Error('Las notas no deben inferir responsables ni fechas');
  if(label==='routing'&&(rows[0].json.result!=='simulated'||rows[1].json.result!=='blocked'||rows.some(r=>r.json.external_action!==false)))throw Error('Resultado de enrutamiento inválido');
  console.log(`${label}: PASS (${count} items)`);
 }
}
async function start({test=false}={}){
 for(const p of [8080,5679,5680])await free(p);
 if(!fs.existsSync(path.join(lab,'ready.json')))await setup();
 const child=command(['start'],'server');let server;let ended=false;
 child.on('exit',()=>{ended=true;if(server)server.close();});
 let stopping=false;
 const stop=()=>{if(stopping)return;stopping=true;server?.closeAllConnections();server?.close();if(!ended){if(process.platform==='win32'){const killer=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});killer.on('error',()=>child.kill());setTimeout(()=>{if(!ended)child.kill();killer.kill();},3000).unref();}else child.kill();}};
 process.once('SIGINT',()=>{stop();});process.once('SIGTERM',()=>{stop();});
 try{
  console.log('Esperando n8n local en 127.0.0.1:5679…');let ready=false;
  for(let i=0;i<240;i++){
   if(ended)throw Error('n8n se detuvo; revisar private/n8n-local/server.log');
   try{const r=await fetch('http://127.0.0.1:5679/healthz/readiness',{signal:AbortSignal.timeout(800)});if(r.ok){ready=true;break;}}catch{}
   await new Promise(r=>setTimeout(r,1000));
  }
  if(!ready)throw Error('n8n no inició a tiempo; revisar server.log');
  server=createServer({connected:true});await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8080,'127.0.0.1',resolve);});
  console.log('NOD conectado: http://127.0.0.1:8080/connection.html · Ctrl+C para cerrar ambos servicios.');
  if(test){
   const config=await(await fetch('http://127.0.0.1:8080/api/connection')).json();
   const response=await fetch('http://127.0.0.1:8080/api/demo',{method:'POST',headers:{Origin:'http://127.0.0.1:8080','Content-Type':'application/json','X-Nod-Token':config.token},body:'{}'});
   const result=await response.json();if(!response.ok||JSON.stringify(result.tasks)!==JSON.stringify([{action:'Comprar papel'},{action:'Revisar inventario'}]))throw Error(`Prueba real fallida: ${JSON.stringify(result)}`);
   const evidence={checkedAt:new Date().toISOString(),path:'NOD HTTP → n8n webhook → Code → NOD',result};fs.writeFileSync(path.join(lab,'integration-result.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence,null,2));stop();
  }
 }catch(error){stop();throw error;}
}
if(require.main===module){const action=process.argv[2]||'start';(async()=>{if(action==='setup')await setup();else if(action==='test'){if(!fs.existsSync(path.join(lab,'ready.json')))await setup();await manualTests();await start({test:true});}else if(action==='start')await start();else throw Error('Uso: node src/local-stack.cjs [setup|test|start]');})().catch(e=>{console.error(e.message);process.exitCode=1;});}
module.exports={environment,start};

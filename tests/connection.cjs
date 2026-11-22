'use strict';
const assert=require('node:assert/strict');
const http=require('node:http');
const {createServer}=require('../src/serve.cjs');
const {environment}=require('../src/local-stack.cjs');
async function withServer(options,fn){const server=createServer(options);await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await fn(`http://127.0.0.1:${server.address().port}`);}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}}
(async()=>{
 assert.ok(require('../examples/local-bridge/workflow.json').nodes[0].webhookId,'n8n necesita webhookId para registrar la ruta fija');
 await withServer({},async base=>{assert.equal((await(await fetch(base+'/api/connection')).json()).enabled,false);assert.equal((await fetch(base+'/api/demo',{method:'POST'})).status,409);});
 let calls=0;
 await withServer({connected:true,send:async options=>{calls++;assert.deepEqual(options,{confirm:true,port:'5679',live:true});return {mode:'demo',tasks:[{action:'Comprar papel'},{action:'Revisar inventario'}]};}},async base=>{
  const config=await(await fetch(base+'/api/connection')).json();assert.equal(config.enabled,true);
  const request=(overrides={})=>fetch(base+'/api/demo',{method:'POST',body:'{}',headers:{Origin:base,'Content-Type':'application/json','X-Nod-Token':config.token},...overrides});
  assert.equal((await request({headers:{Origin:'https://foreign.example','Content-Type':'application/json','X-Nod-Token':config.token}})).status,403);
  assert.equal((await request({headers:{Origin:base,'Content-Type':'application/json'}})).status,403);
  const foreignStatus=await new Promise((resolve,reject)=>{const req=http.get(base+'/api/connection',{headers:{Host:'foreign.example'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);});assert.equal(foreignStatus,403);
  assert.equal((await request({body:'{"text":"datos privados"}'})).status,400);
  assert.equal((await request({body:'x'.repeat(65)})).status,413);
  assert.equal(calls,0);
  const r=await request();assert.equal(r.status,200);assert.equal((await r.json()).tasks.length,2);assert.equal(calls,1);
  assert.equal((await request()).status,429);assert.equal(calls,1);
  for(const p of ['/private/n8n-local/.n8n/config','/.env','/BRIEF_MAESTRO.md'])assert.equal((await fetch(base+p)).status,404);
  for(const p of ['/connection.html','/connection.js'])assert.equal((await fetch(base+p)).status,200);
 });
 await withServer({connected:true,send:async()=>{throw Error('contenido interno secreto');}},async base=>{const {token}=await(await fetch(base+'/api/connection')).json();const r=await fetch(base+'/api/demo',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','X-Nod-Token':token},body:'{}'});assert.equal(r.status,502);const body=await r.text();assert.match(body,/incierto/);assert.ok(!body.includes('secreto'));});
 const env=environment();assert.equal(env.N8N_LISTEN_ADDRESS,'127.0.0.1');assert.equal(env.N8N_RUNNERS_BROKER_LISTEN_ADDRESS,'127.0.0.1');assert.match(env.N8N_USER_FOLDER,/private[\\/]n8n-local$/);
 console.log('Connection HTTP: opt-in, token, origin, host, input limits, no private data, single attempt and loopback PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});

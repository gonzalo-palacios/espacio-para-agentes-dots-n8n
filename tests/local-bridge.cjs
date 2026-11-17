const assert=require('node:assert/strict');
const bridge=require('../src/local-bridge.cjs');
assert.deepEqual(bridge.payload(), {text:'Comprar papel; Revisar inventario',mode:'demo'});
assert.equal(bridge.endpoint('5678'),'http://127.0.0.1:5678/webhook-test/dots-community-demo');
for (const p of ['0','65536','http://example.com','5678/a','-1','080']) assert.throws(()=>bridge.endpoint(p));
(async()=>{
let called=false;
await assert.rejects(bridge.send({confirm:false,port:'5678',transport:()=>{called=true;}}),/confirm/);
assert.equal(called,false);
const r=await bridge.send({confirm:true,port:'5678',transport:async(url,opts)=>{
assert.equal(url,bridge.endpoint('5678'));assert.equal(opts.redirect,'error');assert.equal(opts.method,'POST');
assert.deepEqual(JSON.parse(opts.body),bridge.payload());
return new Response(JSON.stringify({mode:'demo',tasks:[{action:'Comprar papel'},{action:'Revisar inventario'}]}),{headers:{'content-type':'application/json'}});
}});
assert.equal(r.tasks.length,2);
for(const body of ['<html>error</html>',JSON.stringify({secret:'do not echo'}),JSON.stringify({mode:'demo',tasks:[]})]){
await assert.rejects(bridge.send({confirm:true,transport:async()=>new Response(body)}));
}
await assert.rejects(bridge.send({confirm:true,transport:async()=>new Response('private error',{status:500})}),/HTTP 500/);
console.log('local bridge checks PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});

// Una caída de transporte no acredita que el servidor no procesó el pedido.
(async()=>{
 for(const code of ['EAI_AGAIN','ECONNRESET','ETIMEDOUT']) {
  let attempts=0;
  await assert.rejects(bridge.send({confirm:true,transport:async()=>{
   attempts++; throw Object.assign(new Error('PRIVATE_TRANSPORT_DETAILS'),{code});
  }}),e=>e.message.includes('resultado desconocido')&&!e.message.includes('PRIVATE_TRANSPORT_DETAILS'));
  assert.equal(attempts,1,'No repetir una solicitud con resultado incierto');
 }
 await assert.rejects(bridge.send({confirm:true,transport:async()=>new Response(new ReadableStream({
  start(controller){controller.error(new Error('PRIVATE_BODY_DETAILS'));}
 }))}),e=>e.message.includes('resultado desconocido')&&!e.message.includes('PRIVATE_BODY_DETAILS'));
 console.log('transport uncertainty checks PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});

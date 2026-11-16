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

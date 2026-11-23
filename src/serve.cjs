// Servidor estático local. Lista cerrada: nunca expone config o secretos.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {randomBytes}=require('node:crypto');
const bridge=require('./local-bridge.cjs');
const routes=new Map([
 ['/connection.html',['connection.html','text/html']],
 ['/connection.js',['connection.js','text/javascript']],
 ['/appearance-core.js',['appearance-core.js','text/javascript']],
 ['/appearance-ui.js',['appearance-ui.js','text/javascript']],
 ['/appearance.css',['appearance.css','text/css']],
 ['/', ['index.html','text/html']],['/index.html',['index.html','text/html']],
 ['/map3d/index.html',['map3d/index.html','text/html']],
 ['/map3d/graph.js',['map3d/graph.js','text/javascript']],
 ['/map3d/view.js',['map3d/view.js','text/javascript']],
 ['/tasks.html',['tasks.html','text/html']],
 ['/tasks-core.js',['tasks-core.js','text/javascript']],
 ['/tasks-ui.js',['tasks-ui.js','text/javascript']]
]);
function createServer({connected=false,n8nPort='5679',port=8080,send=bridge.send}={}){
 const token=randomBytes(32).toString('hex');let busy=false,lastAttempt=0;
 return http.createServer(async(req,res) => {
 const localPort=res.socket.localPort;
 const origin=`http://127.0.0.1:${localPort}`;
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 if(req.url.startsWith('/api/')){
  if(req.headers.host!==`127.0.0.1:${localPort}`)return json(403,{error:'Host no permitido'});
  if(req.url==='/api/connection'&&req.method==='GET')return json(200,{enabled:connected,token:connected?token:null});
  if(req.url!=='/api/demo')return json(404,{error:'Ruta desconocida'});
  if(req.method!=='POST')return json(405,{error:'Usar POST'});
  if(!connected)return json(409,{error:'Iniciá NOD con n8n local para usar esta prueba.'});
  if(req.headers.origin!==origin||req.headers['x-nod-token']!==token)return json(403,{error:'Solicitud no autorizada'});
  if(req.headers['content-type']!=='application/json')return json(415,{error:'Se requiere JSON'});
  if(busy||Date.now()-lastAttempt<2000)return json(429,{error:'Esperá antes de repetir la prueba.'});
  let raw='';try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>64)return json(413,{error:'Entrada demasiado grande'});}}catch{return;}
  if(raw!=='{}')return json(400,{error:'Solo se admiten las tareas ficticias predefinidas.'});
  busy=true;lastAttempt=Date.now();
  try{return json(200,{ok:true,...await send({confirm:true,port:n8nPort,live:true})});}
  catch{return json(502,{error:'Resultado incierto: comprobá n8n antes de repetir. No hubo reintento automático.'});}
  finally{busy=false;}
 }
 if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
 const entry=routes.get(req.url);
 if(!entry){res.writeHead(404);return res.end('Not found');}
 const body=fs.readFileSync(path.join(__dirname,'../desktop',entry[0]));
 res.writeHead(200,{'Content-Type':entry[1]+'; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
 res.end(req.method==='HEAD'?undefined:body);
 });
}
module.exports={createServer};
if(require.main===module)createServer().listen(8080,'127.0.0.1',()=>console.log('Escritorio local: http://127.0.0.1:8080 (Ctrl+C para cerrar)'));

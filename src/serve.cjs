// Servidor estático local. Lista cerrada: nunca expone config o secretos.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const routes=new Map([
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
http.createServer((req,res) => {
 if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
 const entry=routes.get(req.url);
 if(!entry){res.writeHead(404);return res.end('Not found');}
 const body=fs.readFileSync(path.join(__dirname,'../desktop',entry[0]));
 res.writeHead(200,{'Content-Type':entry[1]+'; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
 res.end(req.method==='HEAD'?undefined:body);
}).listen(8080,'127.0.0.1',()=>console.log('Escritorio local: http://127.0.0.1:8080 (Ctrl+C para cerrar)'));

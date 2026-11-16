// Static preview only. Never exposes config, source, workflows or secrets.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const page = fs.readFileSync(path.join(__dirname, '../desktop/index.html'));
http.createServer((req,res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  if (!['/','/index.html'].includes(req.url)) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
  res.end(req.method === 'HEAD' ? undefined : page);
}).listen(8080,'127.0.0.1',()=>console.log('Demo: http://127.0.0.1:8080 (Ctrl+C para cerrar)'));

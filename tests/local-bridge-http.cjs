'use strict';
const assert = require('node:assert/strict');
const http = require('node:http');
const { performance } = require('node:perf_hooks');
const { send } = require('../src/local-bridge.cjs');
const wf = require('../examples/local-bridge/workflow.json');
assert.equal(wf.active, false);
const processData = new Function('$input', wf.nodes[1].parameters.jsCode);
assert.throws(() => processData({first: () => ({json: {body: {text: 'private'}}})}));

async function withServer(handler, test) {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try { await test(String(server.address().port)); }
  finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

(async () => {
  let requests = 0;
  await withServer((req, res) => {
    requests++;
    assert.equal(req.url, '/webhook-test/dots-community-demo');
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', () => {
      const data = processData({first: () => ({json: {body: JSON.parse(raw)}})});
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data[0].json));
    });
  }, async port => {
    const r = await send({confirm: true, port});
    assert.equal(r.tasks.length, 2);
    assert.equal(requests, 1);
  });

  // A syntactically valid contract with an ignored field must still respect the byte cap.
  await withServer((_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({mode: 'demo', tasks: [{action: 'Comprar papel'}, {action: 'Revisar inventario'}], extra: 'x'.repeat(16385)}));
  }, async port => {
    await assert.rejects(send({confirm: true, port}), /Respuesta demasiado grande/);
  });

  let redirectRequests = 0;
  let targetRequests = 0;
  await withServer((req, res) => {
    if (req.url === '/redirect-target') { targetRequests++; res.end('{}'); return; }
    redirectRequests++;
    res.writeHead(302, {Location: '/redirect-target'});
    res.end();
  }, async port => {
    await assert.rejects(send({confirm: true, port}), /resultado desconocido/);
    assert.equal(redirectRequests, 1);
    assert.equal(targetRequests, 0, 'fetch must not follow the redirect');
  });

  // Actual fetch against a server that never responds, not just an options mock.
  let timeoutRequests = 0;
  await withServer((_req, _res) => { timeoutRequests++; }, async port => {
    const start = performance.now();
    await assert.rejects(send({confirm: true, port}), /resultado desconocido/);
    const elapsed = performance.now() - start;
    assert.equal(timeoutRequests, 1);
    assert.ok(elapsed >= 4500, `timeout fired too early: ${elapsed}ms`);
    assert.ok(elapsed < 12000, `timeout did not enforce the 5s limit: ${elapsed}ms`);
  });
  console.log('HTTP real, límite 16KiB, redirect bloqueado y timeout 5s: PASS (no n8n)');
})().catch(e => { console.error(e); process.exitCode = 1; });

const assert=require('node:assert/strict'),fs=require('node:fs');
assert.ok(fs.existsSync(__dirname+'/../desktop/map3d/graph.js'),'graph module exists');
const g=require('../desktop/map3d/graph.js');
assert.equal(new Set(g.nodes.map(n=>n.id)).size,g.nodes.length);
for(const [a,b] of g.edges){assert.ok(g.nodes.some(n=>n.id===a));assert.ok(g.nodes.some(n=>n.id===b));}
assert.deepEqual(g.project({x:0,y:0,z:0},0,0,1,800,600),{x:400,y:300,depth:0,scale:1});
assert.ok(g.project({x:100,y:0,z:0},0,0,1,800,600).x>400);
assert.ok(Math.abs(g.project({x:100,y:0,z:0},Math.PI/2,0,1,800,600).x-400)<1e-8);
assert.ok(g.search('validacion').some(n=>n.id==='validate'));
assert.equal(g.search('no-existent').length,0);
assert.equal(g.search('').length,g.nodes.length);
assert.ok(g.neighbors('jarvis').includes('inbox'));
assert.deepEqual(g.neighbors('invalid'),[]);
console.log('Graph data, search, relations, projection: PASS');

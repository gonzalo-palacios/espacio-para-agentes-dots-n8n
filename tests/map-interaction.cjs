'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
class El{constructor(){this.children=[];this.handlers={};this.value='';this.dataset={};this.attrs={};}replaceChildren(){this.children=[];}append(...x){this.children.push(...x);}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,f){this.handlers[k]=f;}getBoundingClientRect(){return {width:850,height:490,left:0,top:0};}setPointerCapture(){}hasPointerCapture(){return true;}releasePointerCapture(){}}
const els={},get=id=>els[id]??(els[id]=new El());const ctx=new Proxy({}, {get:()=>()=>{}});get('graph').getContext=()=>ctx;
const sandbox={AgentGraph:require('../desktop/map3d/graph.js'),document:{getElementById:get,createElement:()=>new El(),querySelectorAll:()=>[]},window:{devicePixelRatio:1,addEventListener(){}}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('desktop/map3d/view.js','utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox),fire=(t,e)=>get('graph').handlers[t]({pointerId:1,button:0,clientX:0,clientY:0,preventDefault(){},...e});
run("choose('notes')");assert.equal(run('target.x'),210);assert.equal(run("points.find(p=>p.n.id==='notes').x"),425);assert.equal(run("points.find(p=>p.n.id==='notes').y"),245);
assert(get('detail').children.some(e=>e.href==='../tasks.html'));assert(get('detail').children[2].children.length>0);
get('search').value='notas';get('search').handlers.input();assert.equal(run('visible.length'),1);assert.equal(run('points.length'),10);
get('flat').onclick();fire('pointerdown',{});fire('pointermove',{clientX:10});fire('pointerup',{clientX:10});assert.equal(run('pan.x'),10);
get('reset').onclick();fire('pointerdown',{});for(let x=1;x<=6;x++)fire('pointermove',{clientX:x});assert.equal(run('moved'),true);fire('pointercancel',{});assert.equal(run('drag'),null);
fire('pointerdown',{button:2});assert.equal(run('drag'),null);fire('pointerdown',{});fire('pointerdown',{pointerId:2,isPrimary:false});assert.equal(run('drag.id'),1);fire('lostpointercapture',{});assert.equal(run('drag'),null);
fire('keydown',{key:'ArrowRight',shiftKey:true});assert.equal(run('pan.x'),18);fire('keydown',{key:'Home'});assert.equal(run('pan.x'),0);assert.equal(run('selected'),null);
for(let i=0;i<100;i++)get('plus').onclick();assert.equal(run('zoom'),1.8);for(let i=0;i<100;i++)get('minus').onclick();assert.equal(run('zoom'),.4);
console.log('Map interaction: 19 assertions passed (DOM/canvas simulated, not browser QA).');

'use strict';
const G=AgentGraph,canvas=document.getElementById('graph'),ctx=canvas.getContext('2d');
let yaw=.35,pitch=-.16,zoom=.8,flat=false,selected=null,visible=G.nodes,points=[],drag=null,moved=false;
const colors={Coordinación:'#7ce8cf',Tarea:'#8dbdff',Control:'#f5bf79',Agente:'#d3a6ff',Herramienta:'#77e1e5',Conocimiento:'#e9a4cf'};
function choose(id){
selected=id;const n=G.nodes.find(n=>n.id===id),box=document.getElementById('detail');box.replaceChildren();
const heading=document.createElement('strong');heading.textContent=n.label;box.append(heading);
const desc=document.createElement('p');desc.textContent=n.description;box.append(desc);
const links=document.createElement('p');links.textContent='Conectado con: '+G.neighbors(id).map(i=>G.nodes.find(n=>n.id===i).label).join(', ')+'.';box.append(links);
for(const b of document.querySelectorAll('#node-list button'))b.setAttribute('aria-pressed',String(b.dataset.id===id));draw();
}
function refresh(){
visible=G.search(document.getElementById('search').value);const list=document.getElementById('node-list');list.replaceChildren();
for(const n of visible){const li=document.createElement('li'),b=document.createElement('button'),kind=document.createElement('span');b.textContent=n.label;b.dataset.id=n.id;b.setAttribute('aria-pressed',String(selected===n.id));kind.className='kind';kind.textContent=n.kind;b.append(kind);b.addEventListener('click',()=>choose(n.id));li.append(b);list.append(li);}
document.getElementById('status').textContent=visible.length+' de '+G.nodes.length+' nodos visibles.';draw();
}
function draw(){
if(!ctx)return;const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
const scale=zoom*Math.min(w/850,h/490);
points=visible.map(n=>({n,...G.project(flat?{...n,z:0}:n,flat?0:yaw,flat?0:pitch,scale,w,h)})).sort((a,b)=>b.depth-a.depth);
const map=new Map(points.map(p=>[p.n.id,p])),neighbors=G.neighbors(selected);
for(const [a,b] of G.edges){const p=map.get(a),q=map.get(b);if(!p||!q)continue;const active=a===selected||b===selected;ctx.strokeStyle=active?'#7ce8cf':'#405a80';ctx.lineWidth=active?2:1;ctx.globalAlpha=selected&&!active?.3:.8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
for(const p of points){const active=!selected||selected===p.n.id||neighbors.includes(p.n.id);ctx.globalAlpha=active?1:.35;const r=Math.max(5,9*p.scale);ctx.fillStyle=colors[p.n.kind];ctx.shadowColor=colors[p.n.kind];ctx.shadowBlur=selected===p.n.id?18:5;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(selected===p.n.id){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,r+4,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#edf5ff';ctx.font='13px system-ui';ctx.textAlign='center';ctx.fillText(p.n.label,p.x,p.y+r+19);}
ctx.globalAlpha=1;
}
function rotate(x,y){yaw+=x;pitch=Math.max(-1.2,Math.min(1.2,pitch+y));draw();}
function changeZoom(v){zoom=Math.max(.4,Math.min(1.8,zoom+v));draw();}
document.getElementById('search').addEventListener('input',refresh);
document.getElementById('reset').onclick=()=>{yaw=.35;pitch=-.16;zoom=.8;selected=null;flat=false;document.getElementById('flat').setAttribute('aria-pressed','false');document.getElementById('search').value='';document.getElementById('detail').textContent='Elegí un nodo. Los vínculos muestran relaciones del ejemplo, no actividad real.';refresh();};
document.getElementById('flat').onclick=()=>{flat=!flat;document.getElementById('flat').setAttribute('aria-pressed',String(flat));draw();};
for(const [id,x,y] of [['left',-.15,0],['right',.15,0],['up',0,-.15],['down',0,.15]])document.getElementById(id).onclick=()=>rotate(x,y);
document.getElementById('plus').onclick=()=>changeZoom(.1);document.getElementById('minus').onclick=()=>changeZoom(-.1);
canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]}[e.key];if(d){e.preventDefault();rotate(...d);}else if(e.key==='+'||e.key==='='){e.preventDefault();changeZoom(.1);}else if(e.key==='-'){e.preventDefault();changeZoom(-.1);}});
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};moved=false;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)moved=true;rotate(dx*.006,dy*.006);drag={x:e.clientX,y:e.clientY};});
canvas.addEventListener('pointerup',e=>{if(!moved){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,p=[...points].reverse().find(p=>Math.hypot(p.x-x,p.y-y)<18);if(p)choose(p.n.id);}drag=null;});
canvas.addEventListener('pointercancel',()=>{drag=null;});
canvas.addEventListener('wheel',e=>{e.preventDefault();changeZoom(e.deltaY<0?.06:-.06);},{passive:false});
window.addEventListener('resize',draw);
refresh();
if(!ctx)document.getElementById('status').textContent='Canvas no disponible. Usá la lista accesible para explorar todas las relaciones.';

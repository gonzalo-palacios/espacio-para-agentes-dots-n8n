'use strict';
const G=AgentGraph,canvas=document.getElementById('graph'),ctx=canvas.getContext('2d');
let yaw=.35,pitch=-.16,zoom=.8,flat=false,selected=null,visible=G.nodes,points=[],drag=null,moved=false,target={x:0,y:0,z:0},pan={x:0,y:0};
const colors={Coordinación:'#7ce8cf',Tarea:'#8dbdff',Control:'#f5bf79',Agente:'#d3a6ff',Herramienta:'#77e1e5',Conocimiento:'#e9a4cf'};
function choose(id){
selected=id;const n=G.nodes.find(n=>n.id===id),box=document.getElementById('detail');box.replaceChildren();
const heading=document.createElement('strong');heading.textContent=n.label;box.append(heading);
const desc=document.createElement('p');desc.textContent=n.description;box.append(desc);
const links=document.createElement('p');links.textContent='Conectado con: ';box.append(links);
for(const other of G.neighbors(id)){const b=document.createElement('button');b.textContent=G.nodes.find(n=>n.id===other).label;b.onclick=()=>choose(other);links.append(b);}
if(id==='notes'){const a=document.createElement('a');a.href='../tasks.html';a.textContent='Abrir taller local de notas';box.append(a);}
target={x:n.x,y:n.y,z:n.z};pan={x:0,y:0};
for(const b of document.querySelectorAll('#node-list button'))b.setAttribute('aria-pressed',String(b.dataset.id===id));draw();
}
function refresh(){
visible=G.search(document.getElementById('search').value);const list=document.getElementById('node-list');list.replaceChildren();
for(const n of visible){const li=document.createElement('li'),b=document.createElement('button'),kind=document.createElement('span');b.textContent=n.label;b.dataset.id=n.id;b.setAttribute('aria-pressed',String(selected===n.id));kind.className='kind';kind.textContent=n.kind;b.append(kind);b.addEventListener('click',()=>choose(n.id));li.append(b);list.append(li);}
document.getElementById('status').textContent=visible.length+' de '+G.nodes.length+' nodos en la lista. El mapa conserva el contexto.';draw();
}
function draw(){
if(!ctx)return;const rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height,dpr=Math.min(window.devicePixelRatio||1,2);
canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
const scale=zoom*Math.min(w/850,h/490);
points=G.nodes.map(n=>({n,...G.project({x:n.x-target.x,y:n.y-target.y,z:flat?0:n.z-target.z},flat?0:yaw,flat?0:pitch,scale,w,h)})).map(p=>({...p,x:p.x+pan.x,y:p.y+pan.y})).sort((a,b)=>b.depth-a.depth);
const map=new Map(points.map(p=>[p.n.id,p])),neighbors=G.neighbors(selected);
for(const [a,b] of G.edges){const p=map.get(a),q=map.get(b);if(!p||!q)continue;const active=a===selected||b===selected;ctx.strokeStyle=active?'#7ce8cf':'#405a80';ctx.lineWidth=active?2:1;ctx.globalAlpha=selected&&!active?.3:.8;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
for(const p of points){const active=!selected||selected===p.n.id||neighbors.includes(p.n.id);ctx.globalAlpha=active&&visible.includes(p.n)?1:.18;const r=Math.max(5,9*p.scale);ctx.fillStyle=colors[p.n.kind];ctx.shadowColor=colors[p.n.kind];ctx.shadowBlur=selected===p.n.id?18:5;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(selected===p.n.id){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,r+4,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#edf5ff';ctx.font='13px system-ui';ctx.textAlign='center';ctx.fillText(p.n.label,p.x,p.y+r+19);}
ctx.globalAlpha=1;
}
function rotate(x,y){if(flat){pan.x+=x*120;pan.y+=y*120;draw();return;}yaw+=x;pitch=Math.max(-1.2,Math.min(1.2,pitch+y));draw();}
function changeZoom(v){zoom=Math.max(.4,Math.min(1.8,zoom+v));draw();}
document.getElementById('search').addEventListener('input',refresh);
document.getElementById('reset').onclick=()=>{yaw=.35;pitch=-.16;zoom=.8;selected=null;target={x:0,y:0,z:0};pan={x:0,y:0};flat=false;document.getElementById('flat').setAttribute('aria-pressed','false');document.getElementById('search').value='';document.getElementById('detail').textContent='Elegí un nodo. Los vínculos muestran relaciones del ejemplo, no actividad real.';refresh();};
document.getElementById('flat').onclick=()=>{flat=!flat;document.getElementById('flat').setAttribute('aria-pressed',String(flat));draw();};
for(const [id,x,y] of [['left',-.15,0],['right',.15,0],['up',0,-.15],['down',0,.15]])document.getElementById(id).onclick=()=>rotate(x,y);
document.getElementById('plus').onclick=()=>changeZoom(.1);document.getElementById('minus').onclick=()=>changeZoom(-.1);
canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-.15,0],ArrowRight:[.15,0],ArrowUp:[0,-.15],ArrowDown:[0,.15]}[e.key];if(d){e.preventDefault();if(e.shiftKey){pan.x+=d[0]*120;pan.y+=d[1]*120;draw();}else rotate(...d);}else if(e.key==='Home'){e.preventDefault();document.getElementById('reset').onclick();}else if(e.key==='+'||e.key==='='){e.preventDefault();changeZoom(.1);}else if(e.key==='-'){e.preventDefault();changeZoom(-.1);}});
canvas.addEventListener('pointerdown',e=>{if(drag||e.isPrimary===false||e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,pan:e.shiftKey};moved=false;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved=moved||Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4;if(moved){if(flat||drag.pan){pan.x+=dx;pan.y+=dy;draw();}else rotate(dx*.006,dy*.006);}drag.x=e.clientX;drag.y=e.clientY;});
canvas.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;if(!moved){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,p=[...points].reverse().find(p=>Math.hypot(p.x-x,p.y-y)<18);if(p)choose(p.n.id);}drag=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(drag&&drag.id===e.pointerId)drag=null;});
canvas.addEventListener('wheel',e=>{e.preventDefault();changeZoom(e.deltaY<0?.06:-.06);},{passive:false});
window.addEventListener('resize',draw);
refresh();
if(!ctx)document.getElementById('status').textContent='Canvas no disponible. Usá la lista accesible para explorar todas las relaciones.';

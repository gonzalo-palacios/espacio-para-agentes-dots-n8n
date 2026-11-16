(function(root){
'use strict';
const nodes=[
{id:'jarvis',label:'Dots · Jarvis',kind:'Coordinación',x:0,y:0,z:0,description:'Organiza el recorrido de una tarea. Este mapa es un ejemplo, no una conexión con Dots.'},
{id:'inbox',label:'Entrada',kind:'Tarea',x:-200,y:-80,z:100,description:'Una nota ficticia inicia el recorrido.'},
{id:'validate',label:'Validación',kind:'Control',x:-80,y:130,z:-140,description:'Revisa estructura y límites antes de procesar.'},
{id:'atlas',label:'Agente local',kind:'Agente',x:170,y:-60,z:130,description:'Representa un agente configurable. No hay un modelo ejecutándose en este mapa.'},
{id:'notes',label:'Notas a tareas',kind:'Herramienta',x:210,y:130,z:-50,description:'Ejemplo de transformación de una nota en tareas.'},
{id:'n8n',label:'n8n',kind:'Herramienta',x:70,y:-170,z:-100,description:'Representa un flujo. La versión de ejemplo no realiza llamadas a n8n.'},
{id:'result',label:'Resultado',kind:'Tarea',x:300,y:-40,z:-170,description:'Salida que puede revisar la persona.'},
{id:'approval',label:'Revisión humana',kind:'Control',x:-220,y:150,z:40,description:'Las acciones externas requieren permisos y revisión apropiados.'},
{id:'memory',label:'Documentación',kind:'Conocimiento',x:-270,y:-150,z:-130,description:'Guías y decisiones ficticias, no conversaciones privadas.'},
{id:'test',label:'Pruebas',kind:'Control',x:20,y:220,z:90,description:'Comprueban resultados y casos límite.'}
];
const edges=[['inbox','jarvis'],['jarvis','validate'],['jarvis','atlas'],['jarvis','n8n'],['atlas','notes'],['notes','result'],['validate','approval'],['jarvis','memory'],['notes','test'],['test','result'],['n8n','result']];
function project(p,yaw,pitch,zoom,w,h){
const x=p.x*Math.cos(yaw)-p.z*Math.sin(yaw), z=p.x*Math.sin(yaw)+p.z*Math.cos(yaw);
const y=p.y*Math.cos(pitch)-z*Math.sin(pitch), depth=p.y*Math.sin(pitch)+z*Math.cos(pitch);
const scale=650/(650+depth)*zoom;
return {x:w/2+x*scale,y:h/2+y*scale,depth,scale};
}
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function search(q){const s=normalize(q);return nodes.filter(n=>normalize(n.label+' '+n.kind).includes(s));}
function neighbors(id){return edges.filter(e=>e.includes(id)).map(e=>e[0]===id?e[1]:e[0]);}
const api={nodes,edges,project,search,neighbors};if(typeof module==='object')module.exports=api;else root.AgentGraph=api;
})(typeof globalThis!=='undefined'?globalThis:this);

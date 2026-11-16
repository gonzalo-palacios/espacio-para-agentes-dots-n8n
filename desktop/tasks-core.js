/* Código original MIT. Sin red ni almacenamiento. */
(function(root){
'use strict';
function fromNote(note){
 if(typeof note!=='string')throw new TypeError('Ingresá texto');
 if(note.length>10000)throw new RangeError('Máximo 10000 caracteres');
 const seen=new Set();
 return note.split(/[;\n]+/).map(x=>x.trim()).filter(x=>{const k=x.toLocaleLowerCase('es').replace(/\s+/g,' ');if(!k||seen.has(k))return false;seen.add(k);return true;}).map((action,i)=>({id:i+1,action,responsible:'',deadline:'',done:false}));
}
function clean(value){return String(value||'').replace(/[\r\n]+/g,' ').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/([\\`*_\[\]#])/g,'\\$1');}
function toMarkdown(tasks){return '# Lista de tareas\n\n'+tasks.map(t=>'- ['+(t.done?'x':' ')+'] '+clean(t.action)+(t.responsible?' · Responsable: '+clean(t.responsible):'')+(t.deadline?' · Plazo: '+clean(t.deadline):'')).join('\n')+'\n';}
function toJSON(tasks){return JSON.stringify({schema_version:1,processor:'local-deterministic',tasks:tasks.map(t=>({id:t.id,action:t.action,responsible:t.responsible,deadline:t.deadline,done:!!t.done}))},null,2);}
const api={fromNote,toMarkdown,toJSON};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TasksCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);

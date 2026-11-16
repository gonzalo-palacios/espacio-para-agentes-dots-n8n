(function(){
'use strict';
const A=globalThis.AgentAppearance,key='dots-n8n-appearance-v1';
const status=document.getElementById('appearance-status');
const controls=['mode','wallpaper','shape'].map(name=>document.getElementById('appearance-'+name));
function apply(value){
 const safe=A.normalize(value);
 for(const name of Object.keys(safe)){
  document.body.dataset[name]=safe[name];
  document.getElementById('appearance-'+name).value=safe[name];
 }
 return safe;
}
function current(){return Object.fromEntries(controls.map(el=>[el.name,el.value]))}
apply(A.defaults);
try{
 const saved=localStorage.getItem(key);
 if(saved){apply(A.decode(saved));status.textContent='Apariencia guardada en este navegador. Los cambios nuevos requieren pulsar Guardar.';}
}catch{status.textContent='El navegador no permite guardar ajustes. Podés personalizar esta sesión.'}
for(const control of controls)control.addEventListener('change',()=>{
 apply(current());status.textContent='Vista previa aplicada. Este cambio no se guarda hasta pulsar Guardar.';
});
document.getElementById('appearance-save').addEventListener('click',()=>{
 try{localStorage.setItem(key,A.encode(current()));status.textContent='Apariencia guardada solo en este navegador. No se envía a ningún servidor.'}
 catch{status.textContent='No se pudo guardar. Tu vista previa sigue disponible en esta sesión.'}
});
document.getElementById('appearance-reset').addEventListener('click',()=>{
 apply(A.defaults);
 try{localStorage.removeItem(key);status.textContent='Ajustes olvidados. Volviste al escritorio original.'}
 catch{status.textContent='Vista restablecida. No se pudo borrar el ajuste guardado: revisá los permisos de almacenamiento del navegador.'}
});
})();

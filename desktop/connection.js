'use strict';
const button=document.getElementById('send'),status=document.getElementById('status'),result=document.getElementById('result');let token;
async function initialize(){
 if(location.protocol==='file:'){status.textContent='Abrí INICIAR_CON_N8N.cmd y entrá a la dirección local que aparece en la ventana.';return;}
 try{const response=await fetch('/api/connection',{cache:'no-store'});if(!response.ok)throw Error();const config=await response.json();
 if(!config.enabled){status.textContent='Modo sin conexión. Cerrá el servidor e iniciá INICIAR_CON_N8N.cmd para habilitar n8n.';return;}
 token=config.token;button.disabled=false;status.textContent='Puente habilitado. Pulsá Enviar prueba para comprobar que n8n responde.';
 }catch{status.textContent='No se pudo consultar el servidor local.';}
}
button.addEventListener('click',async()=>{
 button.disabled=true;result.replaceChildren();status.textContent='Esperando el resultado de n8n…';
 try{const response=await fetch('/api/demo',{method:'POST',headers:{'Content-Type':'application/json','X-Nod-Token':token},body:'{}',signal:AbortSignal.timeout(25000)});const data=await response.json();if(!response.ok)throw Error(data.error);
 for(const task of data.tasks){const li=document.createElement('li');li.textContent=task.action;result.append(li);}status.textContent='Conexión comprobada: n8n procesó y devolvió las dos tareas.';
 }catch(error){status.textContent=error.name==='TimeoutError'?'Resultado incierto: revisá n8n antes de repetir.':error.message;}
 finally{setTimeout(()=>{button.disabled=false;},2000);}
});
initialize();

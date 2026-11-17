'use strict';
// Diagnóstico explícito, sin claves, archivos de entrada ni destinos remotos.
function payload(){ return {text:'Comprar papel; Revisar inventario',mode:'demo'}; }
function endpoint(port='5678'){
 if(typeof port!=='string'|| !/^[1-9][0-9]{0,4}$/.test(port)||Number(port)>65535) throw new Error('Puerto inválido');
 return `http://127.0.0.1:${port}/webhook-test/dots-community-demo`;
}
async function send({confirm=false,port='5678',transport=fetch}={}){
 if(confirm!==true) throw new Error('Se requiere confirmación explícita');
 const url=endpoint(port);
 let response;
 try {response=await transport(url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload()),signal:AbortSignal.timeout(5000)});}
 catch {throw new Error('Fallo de transporte: resultado desconocido. Verificar ejecución antes de repetir.');}
 if(!response.ok) throw new Error(`HTTP ${response.status}; no se imprime el cuerpo de error`);
 const reader=response.body.getReader(); let bytes=0,chunks=[];
 const sizeError=new Error('Respuesta demasiado grande');
 try { while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>16384)throw sizeError;chunks.push(Buffer.from(value));} }
 catch (error) {if(error===sizeError)throw error;throw new Error('No se pudo completar la respuesta: resultado desconocido. Verificar ejecución antes de repetir.');}
 finally {await reader.cancel().catch(()=>{});}
 let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new Error('Respuesta JSON inválida');}
 const expected=payload().text.split(';').map(x=>x.trim());
 if(data?.mode!=='demo'||!Array.isArray(data.tasks)||data.tasks.length!==2||data.tasks.some((t,i)=>t?.action!==expected[i]))throw new Error('Contrato de respuesta inválido');
 // Solo devolver campos esperados, nunca contenido arbitrario del servicio.
 return {mode:'demo',tasks:expected.map(action=>({action}))};
}
module.exports={payload,endpoint,send};
if(require.main===module){
 const args=process.argv.slice(2);
 const confirm=args.includes('--send-demo');const ports=args.filter(x=>x.startsWith('--port='));
 if(args.some(x=>x!=='--send-demo'&&!x.startsWith('--port='))||ports.length>1){console.error('Uso: node src/local-bridge.cjs [--send-demo] [--port=5678]');process.exitCode=1;}
 else{
 const port=ports[0]?.slice(7)||'5678';
 try{console.log('Destino de prueba:',endpoint(port));console.log('Datos ficticios:',JSON.stringify(payload()));
 if(!confirm)console.log('Vista previa: no se envió nada. Agregá --send-demo solo en tu instancia local aislada.');
 else send({confirm,port}).then(result=>console.log(JSON.stringify(result,null,2))).catch(()=>{console.error('Prueba fallida: resultado desconocido. Revisá la ejecución en n8n antes de repetir; puede haberse procesado. No se reintenta automáticamente.');process.exitCode=1;});
 }catch(e){console.error(e.message);process.exitCode=1;}
 }
}

const seen = new Set();
return $input.all().map(item => {
  const r = item.json;
  let reason = 'solo simulacion';
  let result = 'blocked';
  if (typeof r.request_id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(r.request_id)) reason = 'identificador invalido';
  else if (seen.has(r.request_id)) reason = 'duplicado en este lote';
  else {
    seen.add(r.request_id);
    if (r.action !== 'delegate') reason = 'no es delegacion';
    else if (r.confirmed !== true) reason = 'falta confirmacion de ejemplo';
    else if (!['research', 'documents'].includes(r.target)) reason = 'destino no permitido';
    else if (!Number.isInteger(r.hops) || r.hops < 0 || r.hops >= 2) reason = 'limite de saltos';
    else if (typeof r.task !== 'string' || !r.task.trim() || r.task.length > 2000) reason = 'tarea invalida';
    else {result = 'simulated'; reason = 'ejemplo validado, no enviado';}
  }
  return {json: {request_id: typeof r.request_id === 'string' ? r.request_id.slice(0,64) : null, result, reason, external_action: false}};
});

const items = $input.all();
return items.flatMap(item => {
  const text = item.json.text;
  if (typeof text !== 'string' || text.length > 10000) throw new Error('text debe ser texto de hasta 10000 caracteres');
  const lines = text.split(/[;\n]+/).map(x => x.trim()).filter(Boolean);
  return lines.map((action, i) => ({json: {position: i + 1, action, responsible: null, deadline: null, status: 'por revisar', mode: 'demo'}}));
});

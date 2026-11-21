'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {extractOffers} = require('../src/shopper-offers.cjs');
const {prepareEvidence} = require('../src/shopper-evidence-context.cjs');
const workflow = JSON.parse(fs.readFileSync(path.join(__dirname,'../workflows/03-compras-evidencia-offline.json'),'utf8'));
const code = workflow.nodes.find(n=>n.name==='Extraer evidencia').parameters.jsCode;
const page='https://shop.example.org/perfume-demo';
const clean='?variant=100';
const ambig='?variant=100&variant=50';
const at='2026-01-01T00:00:00.000Z';
const now=Date.parse(at);
const make=(source,product,offer)=>({
  sourceUrl:page+source,observedAt:at,html:'<script type="application/ld+json">'+JSON.stringify({
    '@type':'Product',name:'Perfume ficticio',sku:'DEMO-100',url:product===null?undefined:page+product,
    offers:{'@type':'Offer',url:offer===null?undefined:page+offer,price:'55000',priceCurrency:'ARS',availability:'https://schema.org/InStock'}
  })+'</script>'
});
const identical='?variant=100&formato=grande';
const cases=[
  ['repetidos contradictorios aun si todas las URLs son idénticas',ambig,ambig,ambig,0],
  ['repetidos idénticos no acreditan que el selector sea escalar','?variant=100&variant=100','','?variant=100&variant=100',0],
  ['nombre percent-encoded repetido','?variant=100&%76ariant=50',null,'?variant=100&%76ariant=50',0],
  ['nombres que solo difieren en mayúsculas','?variant=100&VARIANT=50',null,'?variant=100&VARIANT=50',0],
  ['declaración Product contradictoria aunque Offer coincida',clean,ambig,clean,0],
  ['variante de fuente ambigua nunca se confirma por URL base',ambig,'','',0],
  ['valor vacío en ambas URLs','?variant=',null,'?variant=',0],
  ['valor en blanco codificado','?variant=%20',null,'?variant=%20',0],
  ['selector sin valor','?variant',null,'?variant',0],
  ['nombre vacío','?=100',null,'?=100',0],
  ['elemento vacío','?variant=100&',null,'?variant=100&',0],
  ['URL sin consulta no equivale a una consulta vacía','',null,'?',0],
  ['codificación incompleta','?variant=%ZZ',null,'?variant=%ZZ',0],
  ['mismos pares pero orden distinto no se presume equivalente',identical,null,'?formato=grande&variant=100',0],
  ['una codificación alternativa no se presume equivalente',clean,null,'?variant=%31%30%30',0],
  ['dos selectores únicos no vacíos en el mismo orden',identical,'',identical,1],
  ['un selector exacto no ambiguo',clean,clean,clean,1],
  ['sin selector se conserva la identidad de ficha base','','','',1],
];
let pass=0;
function test(name,f){try{f();pass++;console.log('ok',name);}catch(e){console.error('FAIL',name,e.message);}}
for(const [name,source,product,offer,expected] of cases) test(name,()=>{
  const input=make(source,product,offer);
  const out=extractOffers(input);
  const inline=vm.runInNewContext('(function(){'+code+'})()',{$input:{all:()=>[{json:input}]}},{timeout:1000})[0].json;
  assert.deepEqual(JSON.parse(JSON.stringify(inline)),out,'paridad módulo/nodo');
  assert.equal(out.offers.length,expected);
  const envelope=JSON.parse(prepareEvidence([out],{now,allowedSourceUrls:[input.sourceUrl]}).evidenceJson);
  assert.equal(envelope.offers.length,expected);
  assert.equal(out.total,null);assert.equal(out.ranking,null);assert.equal(out.purchaseApproved,false);
});
test('preparador rechaza evidencia histórica etiquetada como válida con selector ambiguo',()=>{
  const sourceUrl=page+ambig;
  const legacy={offers:[{identityStatus:'url_matches_page',sourceUrl,offerUrl:sourceUrl,product:'Perfume ficticio',price:55000,currency:'ARS',observedAt:at}]};
  assert.deepEqual(JSON.parse(prepareEvidence([legacy],{now,allowedSourceUrls:[sourceUrl]}).evidenceJson).offers,[]);
});
test('preparador no confía en una etiqueta histórica sin URL exacta de variante',()=>{
  const sourceUrl=page+clean;
  for(const offerUrl of [undefined,page,page+ambig,page+'?variant=50']){
    const legacy={offers:[{identityStatus:'url_matches_page',sourceUrl,offerUrl,product:'Perfume ficticio',price:55000,currency:'ARS',observedAt:at}]};
    assert.deepEqual(JSON.parse(prepareEvidence([legacy],{now,allowedSourceUrls:[sourceUrl]}).evidenceJson).offers,[]);
  }
});
const count=cases.length+2;
console.log(pass+'/'+count+' casos de selectores; sin red ni servidor n8n');
if(pass!==count)process.exitCode=1;

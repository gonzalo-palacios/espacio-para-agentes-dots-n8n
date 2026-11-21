'use strict';
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {resolve} = require('node:path');
const {runInNewContext} = require('node:vm');
const root=resolve(__dirname,process.argv[2]||'..');
const {extractOffers}=require(resolve(root,'src/shopper-offers.cjs'));
const {prepareEvidence}=require(resolve(root,'src/shopper-evidence-context.cjs'));
const workflow=JSON.parse(readFileSync(resolve(root,'workflows/03-compras-evidencia-offline.json'),'utf8'));
const node=workflow.nodes.find(n=>n.name==='Extraer evidencia').parameters.jsCode;
const runNode=input=>JSON.parse(JSON.stringify(runInNewContext('(function(){'+node+'})()',{$input:{all:()=>[{json:input}]}},{timeout:1000})[0].json));
const path='https://shop.example.org/perfume-demo';
const selected=path+'?variant=100';
const other=path+'?variant=50';
const observedAt='2026-01-01T00:00:00.000Z';
const wrap=(sourceUrl,productUrl,offerUrl)=>({sourceUrl,observedAt,html:'<script type="application/ld+json">'+JSON.stringify({'@type':'Product',name:'Perfume ficticio',sku:'DEMO',url:productUrl,offers:{'@type':'Offer',price:'55000',priceCurrency:'ARS',availability:'https://schema.org/InStock',url:offerUrl}})+'</script>'});
const cases=[
 ['otra variante en la oferta',wrap(selected,path,other),null],
 ['otra variante en Product aunque Offer coincida',wrap(selected,other,selected),null],
 ['ficha base sin prueba de variante',wrap(selected,path,path),'unknown'],
 ['ficha base con variante explícita en Offer',wrap(selected,path,selected),'url_matches_page'],
 ['ficha base con variante explícita en Product',wrap(selected,selected,path),'url_matches_page'],
 ['sin selector en captura no atribuye variante explícita',wrap(path,path,other),null],
 ['www, slash y fragmento no cambian ficha base',wrap(path,'https://www.shop.example.org/perfume-demo/#ficha',path),'url_matches_page'],
];
let failures=0;
for(const [name,input,expected] of cases){
 try{
  const r=extractOffers(input);assert.deepEqual(runNode(input),r,'paridad con nodo n8n exacto');
  assert.equal(r.offers.length,expected===null?0:1);
  if(expected!==null){
   assert.equal(r.offers[0].identityStatus,expected);
   assert.equal(r.offers[0].evidence.independentlyVerified,false);
   if(input.sourceUrl===selected && expected==='url_matches_page')assert.equal(r.offers[0].offerUrl,selected,'conservar la URL que acredita la variante');
  }
  assert.equal(JSON.parse(prepareEvidence([r],{allowedSourceUrls:[input.sourceUrl],now:Date.parse(observedAt)}).evidenceJson).offers.length,expected==='url_matches_page'?1:0);
  assert.equal(r.total,null);assert.equal(r.ranking,null);assert.equal(r.purchaseApproved,false);
  console.log('ok',name);
 }catch(e){failures++;console.error('FAIL',name,e.message);}
}
console.log(cases.length-failures+'/'+cases.length+' casos; sin red ni servidor n8n');
process.exitCode=failures?1:0;

'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {extractOffers} = require('../src/shopper-offers.cjs');
const offer = {'@type':'Offer',price:'123456.78',priceCurrency:'ARS',availability:'https://schema.org/InStock',url:'https://shop.example.org/item'};
const product = {'@type':'Product',name:'Producto ficticio',sku:'DEMO',offers:offer};
const wrap = obj => ({sourceUrl:'https://shop.example.org/item',observedAt:'2026-01-01T00:00:00Z',html:'<script type="application/ld+json">'+JSON.stringify(obj)+'</script>'});
let count = 0;
function test(name, fn) {fn(); count++; console.log('ok', name);}
test('extrae decimal y evidencia sin aprobar compra',()=>{const r=extractOffers(wrap(product)); assert.equal(r.offers[0].price,123456.78);assert.equal(r.offers[0].currency,'ARS');assert.equal(r.purchaseApproved,false);assert.equal(r.offers[0].evidence.independentlyVerified,false);assert.equal(r.total,null);});
test('precio ausente no es cero',()=>{const r=extractOffers(wrap({...product,offers:{...offer,price:null}}));assert.equal(r.offers[0].price,null);});
test('no confunde separadores locales',()=>{for(const price of ['1.234,56','1,234.56','12 cuotas de 5000','',-1,0])assert.equal(extractOffers(wrap({...product,offers:{...offer,price}})).offers[0].price,null);});
test('moneda no inferida',()=>{assert.equal(extractOffers(wrap({...product,offers:{...offer,priceCurrency:'$'}})).offers[0].currency,null);});
test('stock desconocido sigue desconocido',()=>{assert.ok(extractOffers(wrap({...product,offers:{...offer,availability:undefined}})).offers[0].missing.includes('stock'));});
test('soporta graph y arrays',()=>{assert.equal(extractOffers(wrap({'@graph':[product]})).offers.length,1);assert.equal(extractOffers(wrap([product])).offers.length,1);});
test('aggregate no se convierte en precio exacto',()=>{assert.equal(extractOffers(wrap({...product,offers:{'@type':'AggregateOffer',lowPrice:1}})).offers.length,0);});
test('no resuelve referencias externas',()=>{assert.equal(extractOffers(wrap({...product,offers:{'@id':'https://other.example.org'}})).offers.length,0);});
test('HTML sin producto y JSON roto no inventan datos',()=>{assert.equal(extractOffers({...wrap({}),html:'<p>Oferta 1</p>'}).status,'no_supported_offers');assert.deepEqual(extractOffers({...wrap({}),html:'<script type="application/ld+json">bad</script>'}).warnings,['json_ld_invalido']);});
test('nunca ejecuta contenido script',()=>{assert.equal(extractOffers({...wrap({}),html:'<script>throw Error("no")</script>'}).offers.length,0);});
test('rechaza URLs no publicas y credenciales',()=>{for(const sourceUrl of ['file:///etc/passwd','http://shop.example.org','https://127.0.0.1','https://[::1]','https://localhost','https://foo.internal','https://user:pass@shop.example.org'])assert.throws(()=>extractOffers({...wrap(product),sourceUrl}));});
test('limites entrada y fecha',()=>{assert.throws(()=>extractOffers({...wrap(product),html:'x'.repeat(1000001)}));assert.throws(()=>extractOffers({...wrap(product),observedAt:'no-date'}));});
test('ignora comentarios y atributos data-type',()=>{assert.equal(extractOffers({...wrap(product),html:'<!--'+wrap(product).html+'-->'}).offers.length,0);assert.equal(extractOffers({...wrap(product),html:wrap(product).html.replace('type=', 'data-type=')}).offers.length,0);});
test('fecha corta y dominio interno con punto final rechazados',()=>{assert.throws(()=>extractOffers({...wrap(product),observedAt:'1'}));assert.throws(()=>extractOffers({...wrap(product),sourceUrl:'https://foo.internal.'}));});
test('stock arbitrario no se valida',()=>{const r=extractOffers(wrap({...product,offers:{...offer,availability:'quizas'}}));assert.equal(r.offers[0].availability,null);assert.equal(r.offers[0].availabilityRaw,'quizas');assert.ok(r.offers[0].missing.includes('stock'));});
test('mainEntity recupera producto principal',()=>{assert.equal(extractOffers(wrap({'@type':'WebPage',mainEntity:product})).offers.length,1);});
test('excluye productos relacionados de otra URL',()=>{const r=extractOffers(wrap([product,{...product,name:'otro',offers:{...offer,url:'https://shop.example.org/other'}}]));assert.equal(r.offers.length,1);assert.ok(r.warnings.includes('producto_relacionado_excluido'));});
test('Product.url relacionado sin Offer.url no se atribuye',()=>{assert.equal(extractOffers(wrap({...product,url:'https://shop.example.org/other',offers:{...offer,url:undefined}})).offers.length,0);});
test('sin URL de producto/oferta identidad desconocida',()=>{const o=extractOffers(wrap({...product,offers:{...offer,url:undefined}})).offers[0];assert.equal(o.offerUrl,null);assert.equal(o.identityStatus,'unknown');assert.ok(o.missing.includes('identidad_de_ficha_sin_url'));});
test('rechaza IP abreviada y controles sin global URL',()=>{for(const sourceUrl of ['https://127.1','https://0x7f000001','https://shop.example.org\\\\@127.0.0.1','https://shop.example.org\n'])assert.throws(()=>extractOffers({...wrap(product),sourceUrl}));});
test('carrito compartido no acredita stock ni condicion de pago para la variante',()=>{
  const cart='<aside>Tu carrito está vacío. Este producto no tiene stock.</aside>';
  const payments='<section>Base ARS 120000 · transferencia ARS 96000 · efectivo en salón ARS 90000 · 3 cuotas de ARS 40000 · envío aparte</section>';
  // Futuro lector de texto visible: solo evidencia local al artículo/variante;
  // separar base, transferencia, salón, cuotas (cantidad/importe) y flete.
  const control=extractOffers({...wrap({}),sourceUrl:'https://shop.example.org/contacto',html:'<main>Contacto</main>'+cart+payments});
  assert.deepEqual(control.offers,[]);
  for (const availability of [undefined,'https://schema.org/InStock']) {
    const page=wrap({...product,name:'Perfume ficticio 100 ml',sku:'DEMO-100',offers:{...offer,price:'120000',availability}});
    const r=extractOffers({...page,html:page.html+'<main>Perfume ficticio 100 ml</main>'+cart+payments});
    assert.equal(r.offers.length,1);
    const item=r.offers[0];
    assert.equal(item.sku,'DEMO-100');
    assert.equal(item.price,120000);
    assert.equal(item.currency,'ARS');
    assert.equal(item.availability,availability ?? null);
    assert.equal(item.missing.includes('stock'),!availability);
    assert.equal(item.evidence.independentlyVerified,false);
    assert.ok(item.missing.includes('variante_y_condiciones_de_pago'));
    assert.ok(item.missing.includes('envio_e_impuestos'));
    assert.equal(r.total,null);
    assert.equal(r.ranking,null);
    assert.equal(r.purchaseApproved,false);
  }
});
const wf=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../workflows/03-compras-evidencia-offline.json'),'utf8'));
test('plantilla inactiva sin red ni secretos ni modelo',()=>{assert.equal(wf.active,false);assert.ok(wf.nodes.every(n=>['n8n-nodes-base.manualTrigger','n8n-nodes-base.executeWorkflowTrigger','n8n-nodes-base.code'].includes(n.type)));assert.ok(wf.nodes.every(n=>!n.credentials));});
test('ejemplo y nodo exactos ejecutados aislados',()=>{const example=wf.nodes.find(n=>n.name==='Ejemplo ficticio').parameters.jsCode;const code=wf.nodes.find(n=>n.name==='Extraer evidencia').parameters.jsCode;const items=vm.runInNewContext('(function(){'+example+'})()',{}, {timeout:1000});const result=vm.runInNewContext('(function(){'+code+'})()',{$input:{all:()=>items}}, {timeout:1000});assert.equal(result[0].json.offers.length,1);assert.equal(result[0].json.purchaseApproved,false);assert.equal(result[0].json.offers[0].currency,'ARS');});
console.log(count+' tests passed; no network, no paid API, no n8n server execution');

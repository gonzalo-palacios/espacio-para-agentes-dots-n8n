'use strict';
const assert=require('node:assert/strict'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream');
const {__testing}=require('../src/shopper-fetch.cjs');
const {extractOffers}=require('../src/shopper-offers.cjs');
const {prepareEvidence}=require('../src/shopper-evidence-context.cjs');
const url='https://shop.example.org/perfume';
const product={'@type':'Product',name:'Perfume ficticio',offers:{'@type':'Offer',url,price:'40.50',priceCurrency:'ARS',availability:'https://schema.org/InStock'}};
function harness(html,status=200){let requests=0;return {requests:()=>requests,fetch:__testing.createFetcher([url],{}, {resolve:async()=>[{address:'93.184.216.34',family:4}],request:(opts,cb)=>{requests++;const req=new EventEmitter();req.destroy=()=>{};req.end=()=>queueMicrotask(()=>{const res=new PassThrough();res.statusCode=status;res.headers={'content-type':'text/html;charset=utf-8'};res.complete=true;cb(res);if(!res.destroyed)res.end(html);});return req;}})};}
(async()=>{
 const h=harness('<script type="application/ld+json">'+JSON.stringify({'@type':'WebPage',mainEntity:product})+'</script>');
 const capture=await h.fetch(url),data=extractOffers(capture),context=prepareEvidence([data],{allowedSourceUrls:[url]});const e=JSON.parse(context.evidenceJson);
 assert.equal(h.requests(),1);assert.equal(e.offers.length,1);assert.equal(e.offers[0].price,40.5);assert.equal(e.modelInvoked,false);assert.equal(e.purchaseApproved,false);assert.ok(!context.evidenceJson.includes('<script'));
 console.log('ok acquisition mock → extraction → fresh model-data envelope');
 await assert.rejects(h.fetch('https://other.example.org/'),{code:'NOT_ALLOWLISTED'});assert.equal(h.requests(),1);console.log('ok nonallowlisted source never reaches transport');
 const empty=harness('<html>Sin oferta compatible</html>');const x=prepareEvidence([extractOffers(await empty.fetch(url))],{allowedSourceUrls:[url]});assert.equal(x.status,'no_fresh_evidence');assert.equal(JSON.parse(x.evidenceJson).offers.length,0);console.log('ok missing evidence has no paid fallback');
 const redirect=harness('',302);await assert.rejects(redirect.fetch(url),{code:'REDIRECT_REJECTED'});assert.equal(redirect.requests(),1);console.log('ok redirect stops composition without followup');
 console.log('4 pipeline tests passed; mocked transport only, no network/model');
})().catch(e=>{console.error(e);process.exitCode=1;});

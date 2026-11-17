'use strict';
const assert=require('node:assert/strict');
const {EventEmitter}=require('node:events');
const {PassThrough}=require('node:stream');
const {createFetcher,__testing}=require('../src/shopper-fetch.cjs');
const url='https://shop.example.org/product?variant=1';
const public4={address:'93.184.216.34',family:4};
let count=0;
async function test(name,fn){await fn();count++;console.log('ok',name);}
function fixture({records=[public4],resolver,headers={'content-type':'text/html; charset=utf-8'},status=200,chunks=['<p>demo</p>'],complete=true,hang=false,fail=false,responseError=false}={}) {
 const state={dns:0,requests:0,destroyed:0};
 const resolve=async(host,signal)=>{state.dns++;state.host=host;state.signal=signal;return resolver?resolver(host,signal):records;};
 const request=(opts,callback)=>{
  state.requests++;state.options=opts;const req=new EventEmitter();
  req.destroy=()=>{state.destroyed++;};
  req.end=()=>queueMicrotask(()=>{
   if(fail){req.emit('error',new Error('private-secret transport detail'));return;}
   if(hang)return;
   const res=new PassThrough();res.statusCode=status;res.headers=headers;res.complete=complete;
   state.response=res;callback(res);
   if(res.destroyed)return;
   if(responseError){res.emit('error',new Error('private response'));return;}
   chunks.forEach(c=>{if(!res.destroyed)res.write(c);});if(!res.destroyed)res.end();
  });return req;
 };
 return {state,fetch:__testing.createFetcher([url],{timeoutMs:100,maxBytes:100},{resolve,request})};
}
(async()=>{
 await test('trusted exact allowlist precedes DNS; payload cannot supply config',async()=>{
  const {fetch,state}=fixture();
  for(const bad of [url+'&next=1',url.replace('variant=1','variant=2'),'https://other.example.org',url+'#fragment',{url,allowlist:[url]}])await assert.rejects(fetch(bad),{code:'NOT_ALLOWLISTED'});
  assert.equal(state.dns,0);assert.equal(state.requests,0);
 });
 await test('invalid configured URLs and limits fail closed',()=>{
  for(const u of ['http://shop.example.org','https://127.0.0.1','https://127.1','https://0x7f000001','https://2130706433','https://[::1]','https://user:pass@shop.example.org','https://shop.example.org:444','https://shop.example.org/#x','https://foo.internal','https://shop.example.org\\@evil.org','https://shop.example.org\n'])assert.throws(()=>createFetcher([u]),{code:'URL_REJECTED'});
  assert.throws(()=>createFetcher([]));assert.throws(()=>createFetcher([url],{maxBytes:1000001}));assert.throws(()=>createFetcher([url],{timeoutMs:10001}));
 });
 await test('IP matrix rejects reserved private local mapped and transition addresses',()=>{
  for(const ip of ['0.1.2.3','10.1.1.1','100.64.0.1','100.127.255.255','127.0.0.1','169.254.169.254','172.16.0.1','172.31.255.255','192.0.0.9','192.0.2.1','192.31.196.1','192.52.193.1','192.88.99.1','192.168.0.1','192.175.48.1','198.18.0.1','198.19.255.255','198.51.100.1','203.0.113.1','224.0.0.1','240.1.1.1','255.255.255.255','::','::1','::ffff:127.0.0.1','::ffff:808:808','64:ff9b::808:808','100::1','2001::1','2001:1::1','2001:db8::1','2002:0808:0808::1','2620:4f:8000::1','3fff::1','fc00::1','fdff::1','fe80::1','ff02::1','fe80::1%eth0','bad'])assert.equal(__testing.isGlobalIp(ip),false,ip);
  for(const ip of ['8.8.8.8','93.184.216.34','100.63.255.255','100.128.0.0','172.15.255.255','172.32.0.0','2001:4860:4860::8888','2606:4700:4700::1111'])assert.equal(__testing.isGlobalIp(ip),true,ip);
 });
 await test('all DNS answers checked, not only first; mixed A AAAA rejected',async()=>{
  for(const records of [[],[public4,{address:'127.0.0.1',family:4}],[public4,{address:'fe80::1',family:6}],[{address:'93.184.216.34',family:6}],Array(65).fill(public4)]){
   const {fetch,state}=fixture({records});await assert.rejects(fetch(url),{code:'DNS_ADDRESS_REJECTED'});assert.equal(state.requests,0);
  }
 });
 await test('fixed lookup prevents rebinding and retains TLS hostname',async()=>{
  const records=[{...public4}];const {fetch,state}=fixture({records});const r=await fetch(url);
  assert.equal(r.html,'<p>demo</p>');assert.equal(r.sourceUrl,url);assert.equal(r.bytes,11);assert.ok(Number.isFinite(Date.parse(r.observedAt)));
  records[0].address='127.0.0.1'; const opts=state.options;
  for(let i=0;i<3;i++)opts.lookup('shop.example.org',{},(e,a,f)=>{assert.ifError(e);assert.equal(a,public4.address);assert.equal(f,4);});
  opts.lookup('shop.example.org',{all:true},(e,a)=>{assert.ifError(e);assert.deepEqual(a,[public4]);});
  opts.lookup('other.example.org',{},e=>assert.equal(e.code,'HOST_MISMATCH'));
  assert.equal(state.dns,1);assert.equal(state.requests,1);assert.equal(opts.servername,'shop.example.org');assert.equal(opts.hostname,'shop.example.org');assert.equal(opts.rejectUnauthorized,true);assert.equal(opts.port,443);assert.equal(opts.method,'GET');assert.equal(opts.autoSelectFamily,false);assert.equal(opts.agent.options.useEnvProxy,false);assert.deepEqual(opts.agent.options.proxyEnv,{});assert.ok(opts.ca.length>0);assert.equal(typeof opts.checkServerIdentity,'function');
  assert.deepEqual(Object.keys(opts.headers).sort(),['Accept','Accept-Encoding','User-Agent']);assert.equal(opts.headers['Accept-Encoding'],'identity');
 });
 await test('allowlist copied, caller mutation cannot expand it',async()=>{
  const list=[url];const fetch=__testing.createFetcher(list,{}, {resolve:async()=>{throw Error('should not resolve');},request:()=>{throw Error('should not send');}});list.push('https://evil.example.org/');await assert.rejects(fetch(list[1]),{code:'NOT_ALLOWLISTED'});
 });
 await test('IPv6 address can be pinned without fallback',async()=>{
  const {fetch,state}=fixture({records:[{address:'2606:4700:4700::1111',family:6}]});await fetch(url);state.options.lookup('shop.example.org',{},(e,a,f)=>{assert.ifError(e);assert.equal(a,'2606:4700:4700::1111');assert.equal(f,6);});
 });
 await test('redirects and non200 statuses rejected without second request',async()=>{
  for(const status of [301,302,303,307,308,403,404,429,500]){const {fetch,state}=fixture({status,headers:{'content-type':'text/html',location:'http://169.254.169.254'}});await assert.rejects(fetch(url),{code:status<400?'REDIRECT_REJECTED':'HTTP_STATUS_REJECTED'});assert.equal(state.requests,1);assert.ok(state.response.destroyed);}
 });
 await test('compressed bodies and nonHTML or legacy charset rejected',async()=>{
  for(const encoding of ['gzip','br','deflate','gzip, identity'])await assert.rejects(fixture({headers:{'content-type':'text/html','content-encoding':encoding}}).fetch(url),{code:'ENCODING_REJECTED'});
  for(const type of [undefined,'application/json','text/plain','text/htmlx'])await assert.rejects(fixture({headers:{'content-type':type}}).fetch(url),{code:'CONTENT_TYPE_REJECTED'});
  await assert.rejects(fixture({headers:{'content-type':'text/html; charset=iso-8859-1'}}).fetch(url),{code:'CHARSET_REJECTED'});
 });
 await test('content length and streamed bytes enforce hard cap',async()=>{
  await assert.rejects(fixture({headers:{'content-type':'text/html','content-length':'101'}}).fetch(url),{code:'BODY_TOO_LARGE'});
  await assert.rejects(fixture({chunks:['a'.repeat(60),'b'.repeat(41)]}).fetch(url),{code:'BODY_TOO_LARGE'});
  await assert.rejects(fixture({chunks:['é'.repeat(51)]}).fetch(url),{code:'BODY_TOO_LARGE'});
  assert.equal((await fixture({chunks:['x'.repeat(100)]}).fetch(url)).bytes,100);
 });
 await test('incomplete response, mismatch, invalid UTF8 and response errors do not return HTML',async()=>{
  await assert.rejects(fixture({complete:false}).fetch(url),{code:'RESPONSE_INCOMPLETE'});
  await assert.rejects(fixture({headers:{'content-type':'text/html','content-length':'99'}}).fetch(url),{code:'RESPONSE_INCOMPLETE'});
  await assert.rejects(fixture({chunks:[Buffer.from([0xff])]}).fetch(url),{code:'CHARSET_REJECTED'});
  await assert.rejects(fixture({responseError:true}).fetch(url),{code:'RESPONSE_ERROR'});
 });
 await test('DNS timeout stops before request; late DNS answer never sends',async()=>{
  let release;const {fetch,state}=fixture({resolver:()=>new Promise(r=>{release=r;})});await assert.rejects(fetch(url),{code:'TOTAL_TIMEOUT'});assert.equal(state.signal.aborted,true);release([public4]);await new Promise(r=>setImmediate(r));assert.equal(state.requests,0);
 });
 await test('total transport deadline destroys request; no retry',async()=>{
  const {fetch,state}=fixture({hang:true});await assert.rejects(fetch(url),{code:'TOTAL_TIMEOUT'});assert.equal(state.requests,1);assert.ok(state.destroyed>0);
 });
 await test('total deadline covers stalled body and request cleanup',async()=>{
  let requestCount=0,destroyed=false;
  const fetch=__testing.createFetcher([url],{timeoutMs:40},{resolve:async()=>{await new Promise(r=>setTimeout(r,15));return [public4];},request:(opts,cb)=>{
   requestCount++;const req=new EventEmitter();req.destroy=()=>{destroyed=true;};req.end=()=>queueMicrotask(()=>{const res=new PassThrough();res.headers={'content-type':'text/html'};res.statusCode=200;res.complete=false;cb(res);res.write('<p>unfinished');});return req;
  }});
  await assert.rejects(fetch(url),{code:'TOTAL_TIMEOUT'});assert.equal(requestCount,1);assert.equal(destroyed,true);
 });
 await test('transport and DNS errors sanitized and no retry',async()=>{
  const a=fixture({fail:true});await assert.rejects(a.fetch(url),e=>e.code==='TRANSPORT_ERROR'&&!e.message.includes('private'));assert.equal(a.state.requests,1);
  const b=fixture({resolver:()=>{throw Error('private DNS');}});await assert.rejects(b.fetch(url),{code:'DNS_ERROR'});assert.equal(b.state.dns,1);assert.equal(b.state.requests,0);
 });
 await test('attempt budget blocks fourth call before DNS even after failures',async()=>{
  for(const fail of [false,true]){
   const {fetch,state}=fixture({fail});
   for(let i=0;i<3;i++){if(fail)await assert.rejects(fetch(url),{code:'TRANSPORT_ERROR'});else await fetch(url);}
   await assert.rejects(fetch(url),{code:'REQUEST_BUDGET_EXHAUSTED'});assert.equal(state.dns,3);assert.equal(state.requests,3);
  }
  let dnsCalls=0;const fetch=__testing.createFetcher([url],{maxRequests:1},{resolve:async()=>{dnsCalls++;throw Error('DNS fail');},request:()=>{throw Error('unexpected request');}});
  await assert.rejects(fetch(url+'x'),{code:'NOT_ALLOWLISTED'});await assert.rejects(fetch(url),{code:'DNS_ERROR'});await assert.rejects(fetch(url),{code:'REQUEST_BUDGET_EXHAUSTED'});assert.equal(dnsCalls,1);
  for(const maxRequests of [0,4,1.5,Infinity])assert.throws(()=>createFetcher([url],{maxRequests}),{code:'LIMIT_REJECTED'});
 });
 await test('only one concurrent fetch per configured instance',async()=>{
  const {fetch,state}=fixture({hang:true});const first=fetch(url);await assert.rejects(fetch(url),{code:'CONCURRENCY_LIMIT'});await assert.rejects(first,{code:'TOTAL_TIMEOUT'});assert.equal(state.requests,1);
 });
 console.log(`${count} tests passed; mocked resolver/transport only; no network, no paid API`);
})().catch(e=>{console.error(e);process.exitCode=1;});

'use strict';
// Trusted application configuration only. Never construct the allowlist from page/model output.
const https = require('node:https');
const dns = require('node:dns').promises;
const net = require('node:net');
const tls = require('node:tls');
const MAX_BYTES = 1000000;
const MAX_TIME_MS = 10000;
const error = code => Object.assign(new Error(code), {code});
function ipNumber(ip) {
  if (net.isIP(ip) === 4) return ip.split('.').reduce((n,x)=>(n<<8n)|BigInt(x),0n);
  if (net.isIP(ip) !== 6 || ip.includes('%') || ip.includes('.')) return null;
  const [a,b] = ip.split('::');
  const left = a ? a.split(':') : [], right = b ? b.split(':') : [];
  const parts = b === undefined ? left : [...left,...Array(8-left.length-right.length).fill('0'),...right];
  return parts.reduce((n,x)=>(n<<16n)|BigInt('0x'+x),0n);
}
function inRange(n, base, bits, width) { return n >> BigInt(width-bits) === ipNumber(base) >> BigInt(width-bits); }
// Conservative: reject every special-purpose range, even some globally reachable exceptions.
// IANA registries checked 2026-11-17. This static list needs maintenance, not a routing guarantee.
// https://www.iana.org/assignments/iana-ipv4-special-registry/
// https://www.iana.org/assignments/iana-ipv6-special-registry/
const V4_DENY = [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.31.196.0',24],['192.52.193.0',24],['192.88.99.0',24],['192.168.0.0',16],['192.175.48.0',24],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',3]];
const V6_DENY = [['2001::',23],['2001:db8::',32],['2002::',16],['2620:4f:8000::',48],['3fff::',20]];
function isGlobalIp(ip) {
  if (typeof ip !== 'string' || ip.includes('%')) return false;
  const family=net.isIP(ip), n=ipNumber(ip);
  if (n === null) return false;
  if (family === 4) return !V4_DENY.some(([a,b])=>inRange(n,a,b,32));
  return family === 6 && inRange(n,'2000::',3,128) && !V6_DENY.some(([a,b])=>inRange(n,a,b,128));
}
function parseUrl(raw) {
  if (typeof raw !== 'string' || raw.length > 4096 || /[\s\\\x00-\x1f\x7f]/.test(raw)) throw error('URL_REJECTED');
  let u; try { u=new URL(raw); } catch { throw error('URL_REJECTED'); }
  if (u.protocol !== 'https:' || u.username || u.password || u.port || u.hash || net.isIP(u.hostname) ||
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]*$/i.test(u.hostname) ||
      /(^|\.)(localhost|local|internal|test|invalid)$/i.test(u.hostname)) throw error('URL_REJECTED');
  return u;
}
async function resolveAll(host, signal) {
  const resolver = new dns.Resolver({timeout:MAX_TIME_MS,tries:1});
  const cancel=()=>resolver.cancel(); signal.addEventListener('abort',cancel,{once:true});
  try {
    const records=await Promise.all([4,6].map(async family=>{
      try { return (await resolver[family===4?'resolve4':'resolve6'](host)).map(address=>({address,family})); }
      catch(e) { if(e.code==='ENODATA') return []; throw e; }
    }));
    return records.flat();
  } finally {signal.removeEventListener('abort',cancel); resolver.cancel();}
}
function buildFetcher(allowedUrls, options={}, deps={resolve:resolveAll,request:https.request}) {
  if (!Array.isArray(allowedUrls) || !allowedUrls.length || allowedUrls.length>100) throw error('ALLOWLIST_REQUIRED');
  allowedUrls.forEach(parseUrl); const allowlist = new Set(allowedUrls);
  const maxBytes=options.maxBytes ?? MAX_BYTES, timeoutMs=options.timeoutMs ?? MAX_TIME_MS, maxRequests=options.maxRequests ?? 3;
  if(!Number.isInteger(maxRequests)||maxRequests<1||maxRequests>3||!Number.isInteger(maxBytes)||maxBytes<1||maxBytes>MAX_BYTES||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>MAX_TIME_MS) throw error('LIMIT_REJECTED');
  let busy=false, attempts=0;
  return async function fetchHtml(raw) {
    if(typeof raw!=='string'||!allowlist.has(raw)) throw error('NOT_ALLOWLISTED');
    const url=parseUrl(raw);
    if(busy) throw error('CONCURRENCY_LIMIT');
    if(attempts>=maxRequests) throw error('REQUEST_BUDGET_EXHAUSTED');
    // Count authorized attempts, including DNS/TLS/status failures. No automatic retries.
    attempts++;busy=true;
    const controller=new AbortController(); let req, response, agent, timer;
    const work=new Promise((resolve,reject)=>{
      let finished=false;
      function finish(err,result) {
        if(finished)return;finished=true;clearTimeout(timer);
        controller.abort();response?.destroy();req?.destroy();agent?.destroy();
        if(err)reject(err);else resolve(result);
      }
      timer=setTimeout(()=>finish(error('TOTAL_TIMEOUT')),timeoutMs);
      Promise.resolve().then(()=>deps.resolve(url.hostname,controller.signal)).then(addresses=>{
        if(finished)return;
        if(!Array.isArray(addresses)||!addresses.length||addresses.length>64||addresses.some(r=>!r||net.isIP(r.address)!==r.family||!isGlobalIp(r.address))) return finish(error('DNS_ADDRESS_REJECTED'));
        const pinned={address:addresses[0].address,family:addresses[0].family};
        const lookup=(hostname,opts,cb)=>{
          if(typeof opts==='function'){cb=opts;opts={};}
          if(hostname!==url.hostname)return cb(error('HOST_MISMATCH'));
          // Always the previously validated address; no second resolution or fallback.
          if(opts?.all)cb(null,[{...pinned}]);else cb(null,pinned.address,pinned.family);
        };
        agent=new https.Agent({keepAlive:false,maxSockets:1,maxTotalSockets:1,maxCachedSessions:0,useEnvProxy:false,proxyEnv:{}});
        const requestOptions={protocol:'https:',hostname:url.hostname,port:443,path:url.pathname+url.search,method:'GET',
          servername:url.hostname,lookup,family:pinned.family,autoSelectFamily:false,agent,
          rejectUnauthorized:true,checkServerIdentity:tls.checkServerIdentity,ca:tls.rootCertificates,minVersion:'TLSv1.2',
          maxHeaderSize:16384,signal:controller.signal,
          headers:{Accept:'text/html, application/xhtml+xml','Accept-Encoding':'identity','User-Agent':'ShopperEvidencePrototype/0.1'}};
        try {
          req=deps.request(requestOptions,res=>{
            response=res;
            if(finished){res.destroy();return;}
            res.on('error',()=>finish(error('RESPONSE_ERROR')));
            res.on('aborted',()=>finish(error('RESPONSE_INCOMPLETE')));
            if(res.statusCode!==200)return finish(error(res.statusCode>=300&&res.statusCode<400?'REDIRECT_REJECTED':'HTTP_STATUS_REJECTED'));
            const type=res.headers['content-type'],encoding=res.headers['content-encoding'];
            if(typeof type!=='string'||!/^\s*(text\/html|application\/xhtml\+xml)(\s*;|\s*$)/i.test(type))return finish(error('CONTENT_TYPE_REJECTED'));
            if(encoding!==undefined && (typeof encoding!=='string'||encoding.trim().toLowerCase()!=='identity'))return finish(error('ENCODING_REJECTED'));
            // No transcoding or compressed bodies; strict UTF-8 is a deliberate coverage limit.
            const charset=/;\s*charset\s*=\s*"?([^;"\s]+)/i.exec(type);
            if(charset&&!/^utf-?8$/i.test(charset[1]))return finish(error('CHARSET_REJECTED'));
            const length=res.headers['content-length'];
            if(length!==undefined&&(typeof length!=='string'||!/^\d+$/.test(length)||Number(length)>maxBytes))return finish(error('BODY_TOO_LARGE'));
            let bytes=0;const chunks=[];
            res.on('data',chunk=>{if(finished)return;const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);bytes+=b.length;if(bytes>maxBytes)return finish(error('BODY_TOO_LARGE'));chunks.push(b);});
            res.on('end',()=>{
              if(finished)return;
              if(!res.complete||(length!==undefined&&bytes!==Number(length)))return finish(error('RESPONSE_INCOMPLETE'));
              let html;try{html=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));}catch{return finish(error('CHARSET_REJECTED'));}
              finish(null,{html,sourceUrl:raw,observedAt:new Date().toISOString(),bytes,contentType:type});
            });
            res.on('close',()=>{if(!finished)finish(error('RESPONSE_INCOMPLETE'));});
          });
          req.on('error',()=>finish(error('TRANSPORT_ERROR')));
          req.end();
        } catch {finish(error('TRANSPORT_ERROR'));}
      }).catch(()=>finish(error('DNS_ERROR')));
    });
    try{return await work;}finally{busy=false;}
  };
}
function createFetcher(allowlist,options){return buildFetcher(allowlist,options);}
module.exports={createFetcher,__testing:Object.freeze({isGlobalIp,createFetcher:buildFetcher})};

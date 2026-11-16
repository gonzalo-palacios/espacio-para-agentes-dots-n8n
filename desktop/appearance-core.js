/* Local appearance values only. No network, identifiers, files or credentials. */
(function(root){
'use strict';
const defaults=Object.freeze({mode:'desktop',wallpaper:'ocean',shape:'rounded'});
const options={mode:['desktop','phone'],wallpaper:['ocean','sunset','forest'],shape:['rounded','square','circle']};
function normalize(value){
 const input=value&&typeof value==='object'?value:{};
 return Object.fromEntries(Object.keys(defaults).map(key=>[key,options[key].includes(input[key])?input[key]:defaults[key]]));
}
function decode(text){try{return normalize(JSON.parse(text))}catch{return {...defaults}}}
function encode(value){return JSON.stringify(normalize(value))}
const api={defaults,normalize,decode,encode};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
else root.AgentAppearance=api;
})(typeof globalThis!=='undefined'?globalThis:this);

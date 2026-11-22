// Assets are injected by scripts/build.mjs. No account data or secrets belong here.
const enc=new TextEncoder();
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'};
const json=(v,status=200,extra={})=>new Response(JSON.stringify(v),{status,headers:{...headers,'Content-Type':'application/json',...extra}});
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
async function digest(s){return hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));}
async function sign(s,secret){const k=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',k,enc.encode(s)));}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0;}
async function authenticated(req,env){if(!env.SESSION_SECRET)return false;const c=(req.headers.get('Cookie')||'').match(/(?:^|; )cinc_session=([^;]+)/)?.[1];if(!c)return false;const [exp,nonce,sig]=c.split('.');return Number(exp)>Date.now()&&equal(sig,await sign(exp+'.'+nonce,env.SESSION_SECRET));}
export const emptyState=()=>({campaigns:[],events:[],resources:[],contacts:{},notes:{},signals:[],tasks:[],favorites:{},matchDecisions:{},reports:[],imports:[],activity:[],settings:{goal:250,priorityBrokerages:[],priorityPlatforms:[]}});
export default {async fetch(req,env){try{
 const u=new URL(req.url),p=u.pathname;
 if(req.method!=='GET'&&req.method!=='HEAD'&&req.headers.get('Origin')&&req.headers.get('Origin')!==u.origin)return json({error:'Request origin is not allowed.'},403);
 if(p==='/api/login'&&req.method==='POST'){
  if(!env.PASSWORD_HASH||!env.SESSION_SECRET||!env.BUCKET)return json({error:'Workspace sign-in is not configured.'},503);
  const rateKey='auth/'+await digest(req.headers.get('CF-Connecting-IP')||'unknown');const old=await env.BUCKET.get(rateKey);let rate=old?await old.json():{count:0,until:Date.now()+900000};if(rate.until<Date.now())rate={count:0,until:Date.now()+900000};
  if(rate.count>=10)return json({error:'Too many attempts. Try again in 15 minutes.'},429);
  const b=await req.json();if(typeof b.password!=='string'||b.password.length>200||!equal(await digest(b.password),env.PASSWORD_HASH)){rate.count++;await env.BUCKET.put(rateKey,JSON.stringify(rate));return json({error:'That password was not recognized.'},401);}
  await env.BUCKET.delete(rateKey);const payload=(Date.now()+43200000)+'.'+crypto.randomUUID();const cookie=payload+'.'+await sign(payload,env.SESSION_SECRET);
  return json({ok:true},200,{'Set-Cookie':`cinc_session=${cookie}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`});
 }
 if(p==='/api/logout'&&req.method==='POST')return json({ok:true},200,{'Set-Cookie':'cinc_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
 if(p==='/api/bootstrap'&&req.method==='POST'){
  if(!env.INGEST_SECRET||!equal(req.headers.get('X-Ingest-Key'),env.INGEST_SECRET))return json({error:'Unauthorized'},401);
  const b=await req.json();if(!['teams','clients','matches','meta'].includes(b.key))return json({error:'Invalid dataset'},400);
  if(await env.BUCKET.head('data/'+b.key))return json({error:'Dataset already exists; no replacement performed.'},409);
  await env.BUCKET.put('data/'+b.key,JSON.stringify(b.data));return json({ok:true});
 }
 if(p.startsWith('/api/')){
  if(!await authenticated(req,env))return json({error:'Please sign in.'},401);
  if(!env.BUCKET)return json({error:'Shared storage is not configured.'},503);
  if(p==='/api/session')return json({ok:true});
  if(p.startsWith('/api/data/')&&req.method==='GET'){
   const key=p.split('/').pop();if(!['teams','clients','matches','meta'].includes(key))return json({error:'Not found'},404);
   const o=await env.BUCKET.get('data/'+key);return o?new Response(o.body,{headers:{...headers,'Content-Type':'application/json'}}):json(key==='meta'?{}:[]);
  }
  if(p==='/api/state'&&req.method==='GET'){const o=await env.BUCKET.get('workspace');return o?new Response(o.body,{headers:{...headers,'Content-Type':'application/json','ETag':o.httpEtag}}):json(emptyState(),200,{'ETag':'"empty"'});}
  if(p==='/api/state'&&req.method==='PUT'){
   const text=await req.text();if(text.length>8e6)return json({error:'Import is too large. Split into smaller files.'},413);
   const state=JSON.parse(text);for(const k of ['campaigns','events','resources','signals','tasks','reports','imports','activity'])if(!Array.isArray(state[k]))return json({error:'Invalid workspace data.'},400);
   const match=req.headers.get('If-Match');if(!match)return json({error:'Refresh before saving.'},428);
   const options={onlyIf:match==='"empty"'?{etagDoesNotMatch:'*'}:{etagMatches:match.replaceAll('"','')}};
   const saved=await env.BUCKET.put('workspace',text,options);if(!saved)return json({error:'Someone else saved changes. Reload, then try your edit again.'},409);
   return json({ok:true},200,{'ETag':saved.httpEtag});
  }
  return json({error:'Not found'},404);
 }
 const key=p==='/'?'/index.html':p;const a=ASSETS[key];if(!a)return new Response('Not found',{status:404});
 return new Response(Uint8Array.from(atob(a.data),c=>c.charCodeAt(0)),{headers:{...headers,'Content-Type':a.type,'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://tile.openstreetmap.org; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com"}});
 }catch(e){console.error('Request failed',e.name);return json({error:'Unable to complete this request. Please try again.'},500);}}};

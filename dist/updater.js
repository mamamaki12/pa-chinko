// App version shown in the settings, and "update to the latest version": compares this page's build with version.json
// (written by scripts/stamp-version.mjs on deploy), refetches every published file past the browser cache and reloads.
export const DEV='dev';
export function readBuild(doc=document){const meta=n=>doc.querySelector(`meta[name="${n}"]`)?.content||'';return {build:meta('app-build')||DEV,version:meta('app-version'),builtAt:meta('app-built-at')};}
export function isNewer(current,latest){return !!(latest&&typeof latest.build==='string'&&latest.build&&current.build!==DEV&&latest.build!==current.build);}
export function formatBuiltAt(iso){const d=new Date(iso);return iso&&!isNaN(d)?`${d.getMonth()+1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`:'';}
export function versionLabel(info){if(!info||info.build===DEV)return '開発版（公開前のファイル）';const at=formatBuiltAt(info.builtAt);return `${at?`${at} 公開版`:'公開版'}（${[info.version&&`v${info.version}`,info.build].filter(Boolean).join('・')}）`;}
export async function fetchLatest(fetchFn=fetch,now=Date.now()){try{const r=await fetchFn(`version.json?t=${now}`,{cache:'no-store'});if(!r.ok)return null;const j=await r.json();return j&&typeof j.build==='string'?j:null;}catch{return null;}}
// Refetch with cache:'reload' so the browser's HTTP cache holds the new files, then drop any Cache Storage / service worker.
export async function refreshFiles(files,{fetchFn=fetch,cachesApi=globalThis.caches,serviceWorker=globalThis.navigator?.serviceWorker}={}){const list=['./',...(Array.isArray(files)?files:[])];const results=await Promise.allSettled(list.map(f=>fetchFn(f,{cache:'reload'})));try{if(cachesApi)for(const k of await cachesApi.keys())await cachesApi.delete(k);}catch{}try{if(serviceWorker)for(const r of await serviceWorker.getRegistrations())await r.unregister();}catch{}return results.filter(r=>r.status==='fulfilled'&&r.value.ok).length;}
export function reloadUrl(href,build){const u=new URL(href);u.searchParams.set('v',build||String(Date.now()));return u.toString();}
export function cleanUrl(href){const u=new URL(href);if(!u.searchParams.has('v'))return null;u.searchParams.delete('v');return u.toString();}

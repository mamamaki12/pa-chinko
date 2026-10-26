// Run on deploy (see .github/workflows/pages.yml): writes dist/version.json, puts the build into index.html's meta tags,
// and adds ?v=<build> to the scripts and styles, so a reloaded page never mixes old and new files from the browser cache.
import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
function walk(dir){return readdirSync(dir).flatMap(n=>{const p=join(dir,n);return statSync(p).isDirectory()?walk(p):[p];});}
export function stampHtml(html,{build,version,builtAt}){const meta=(n,v)=>{const tag=`<meta name="${n}" content="${v}">`,re=new RegExp(`<meta name="${n}" content="[^"]*">`);return re.test(html)?html.replace(re,tag):html.replace('</head>',`${tag}</head>`);};
  html=meta('app-build',build);html=meta('app-version',version);html=meta('app-built-at',builtAt);
  return html.replace(/(src|href)="((?!https?:|\/\/)[\w./-]+\.(?:js|css))"/g,`$1="$2?v=${build}"`);}
export function stampModule(code,build){return code.replace(/(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.\.?\/[\w./-]+\.js)\2/g,`$1$2$3?v=${build}$2`);}
export function stamp(dir,{build,version,builtAt}){const files=walk(dir).map(p=>relative(dir,p).split(sep).join('/')).filter(f=>f!=='version.json').sort();
  for(const f of files){const p=join(dir,f);if(f==='index.html')writeFileSync(p,stampHtml(readFileSync(p,'utf8'),{build,version,builtAt}));else if(f.endsWith('.js'))writeFileSync(p,stampModule(readFileSync(p,'utf8'),build));}
  const info={build,version,builtAt,files};writeFileSync(join(dir,'version.json'),JSON.stringify(info,null,2)+'\n');return info;}
if(process.argv[1]===fileURLToPath(import.meta.url)){const [dir='dist',sha=process.env.GITHUB_SHA||'']=process.argv.slice(2);const root=join(fileURLToPath(import.meta.url),'../..');
  const version=JSON.parse(readFileSync(join(root,'package.json'),'utf8')).version,build=(sha||Date.now().toString(36)).slice(0,7);
  const info=stamp(dir,{build,version,builtAt:new Date().toISOString()});console.log(`stamped ${dir}: ${info.build} (${info.files.length} files)`);}

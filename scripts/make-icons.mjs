// Draws the app icons (gold "RR" monogram, like the header logo) into assets/icons/ and dist/assets/icons/.
// Not part of the deploy: run by hand after changing the design (needs Playwright: `node scripts/make-icons.mjs`).
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=join(fileURLToPath(import.meta.url),'../..');
const font=`data:font/woff2;base64,${readFileSync(join(root,'assets/fonts/cinzel-latin-700-normal.woff2')).toString('base64')}`;
// maskable: Android crops the icon to a circle or other shape, so the monogram is kept inside the central 80%.
export const ICONS=[
  {file:'apple-touch-icon.png',size:180},
  {file:'icon-192.png',size:192},
  {file:'icon-512.png',size:512},
  {file:'icon-maskable-512.png',size:512,maskable:true},
  {file:'favicon-32.png',size:32,small:true},
  {file:'favicon-16.png',size:16,small:true},
];
function page({size,maskable,small}){const s=maskable?.72:1,frame=small?0:.5*(1-.64*s),fw=Math.max(1,size*.012);
  return `<!doctype html><html><head><style>@font-face{font-family:Cinzel;src:url(${font})}
  html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden}
  .bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 38%,#24393c,#151c1e 58%,#0c1011)}
  .frame{position:absolute;inset:${frame*size}px;border:${fw}px solid #c9a96f;box-shadow:0 0 0 ${fw*2.2}px #0c1011,0 0 0 ${fw*3}px #c9a96f88}
  .r{position:absolute;font:700 ${size*(small?.82:.42)*s}px/1 Cinzel;background:linear-gradient(170deg,#fbe8bd,#d6b47b 48%,#9b7543);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 ${size*.008}px ${size*.012}px #000a)}
  .r1{left:${size*(small?.5:.5)}px;top:${size*(small?.5:.5)}px;transform:translate(${small?-62:-68}%,${small?-56:-58}%)}
  .r2{left:${size*.5}px;top:${size*.5}px;font-size:${size*(small?.82:.42)*s*.82}px;transform:translate(${small?-22:-24}%,${small?-32:-26}%);filter:drop-shadow(${-size*.01}px 0 0 #0c1011) drop-shadow(0 ${-size*.006}px 0 #0c1011) drop-shadow(0 ${size*.008}px ${size*.012}px #000a)}
  </style></head><body><div class="bg"></div>${small?'':'<div class="frame"></div>'}<span class="r r1">R</span><span class="r r2">R</span></body></html>`;}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const {chromium}=createRequire(import.meta.url)('playwright');const browser=await chromium.launch();
  for(const icon of ICONS){const p=await browser.newPage({viewport:{width:icon.size,height:icon.size}});
    await p.setContent(page(icon));await p.evaluate(()=>document.fonts.ready);const png=await p.screenshot({type:'png'});await p.close();
    for(const dir of ['assets/icons','dist/assets/icons']){mkdirSync(join(root,dir),{recursive:true});writeFileSync(join(root,dir,icon.file),png);}
    console.log(icon.file,icon.size);}
  await browser.close();}

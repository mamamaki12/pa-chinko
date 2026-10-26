import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {ICONS} from '../scripts/make-icons.mjs';
// Width and height from the PNG header (IHDR).
function pngSize(path){const b=readFileSync(path);assert.equal(b.toString('latin1',1,4),'PNG',path);return [b.readUInt32BE(16),b.readUInt32BE(20)];}
test('アイコンはrootとdistの両方にあり、決めた大きさの正方形',()=>{for(const {file,size} of ICONS)for(const dir of ['assets/icons','dist/assets/icons']){const p=`${dir}/${file}`;assert.ok(existsSync(p),p);assert.deepEqual(pngSize(p),[size,size],p);}});
test('ページがアイコンとマニフェストを読み込み、マニフェストのアイコンが実在する',()=>{for(const dir of ['.','dist']){const html=readFileSync(`${dir}/index.html`,'utf8');
  for(const m of html.matchAll(/<link rel="(?:icon|apple-touch-icon|manifest)"[^>]*href="([^"]+)"/g))assert.ok(existsSync(`${dir}/${m[1]}`),`${dir}/${m[1]}`);
  assert.match(html,/<link rel="apple-touch-icon" href="assets\/icons\/apple-touch-icon\.png">/);assert.match(html,/<link rel="manifest" href="manifest\.webmanifest">/);
  const manifest=JSON.parse(readFileSync(`${dir}/manifest.webmanifest`,'utf8'));assert.ok(manifest.icons.some(i=>i.sizes==='512x512'&&i.purpose==='maskable'));
  for(const i of manifest.icons){assert.ok(existsSync(`${dir}/${i.src}`),i.src);const [w,h]=pngSize(`${dir}/${i.src}`);assert.equal(i.sizes,`${w}x${h}`);}}});

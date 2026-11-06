import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import {join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
// GitHub Pages publishes dist/ (see README「配信」), so every published file must be the same as the one next to the README.
// A file changed only at the top (as engine.js once was) would otherwise never reach the players.
const root=fileURLToPath(new URL('..',import.meta.url)),dist=join(root,'dist');
const walk=dir=>readdirSync(dir).flatMap(n=>{const p=join(dir,n);return statSync(p).isDirectory()?walk(p):[p];});
test('dist/ のファイルは元のファイルと同じ',()=>{const stale=walk(dist).map(p=>relative(dist,p).split(sep).join('/')).filter(f=>f!=='version.json').filter(f=>!existsSync(join(root,f))||!readFileSync(join(root,f)).equals(readFileSync(join(dist,f))));
  assert.deepEqual(stale,[],`dist/ にコピーし直してください: ${stale.join(', ')}`);});
test('ページが読み込むファイルはすべて dist/ にある',()=>{const top=readdirSync(root).filter(f=>/\.(js|css|html|webmanifest)$/.test(f)),missing=top.filter(f=>!existsSync(join(dist,f)));
  assert.deepEqual(missing,[],`dist/ にコピーしてください: ${missing.join(', ')}`);});

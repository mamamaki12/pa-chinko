import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {REACH_SCENES,reachSceneLayers} from '../reach-fx.js';
import {SCENE_IDS} from '../lcd-fx.js';
// 流星・天空城リーチの場面の絵（#68）: the pictures exist, and they follow the time of the stage only.
const sp={kind:'sp',at:4.8,until:9.3},spsp={kind:'spsp',at:7.3,until:12.8};
test('場面の絵はすべて assets/lcd-stages/ と dist/ にある',()=>{for(const id of SCENE_IDS)for(const dir of ['assets','dist/assets'])assert.ok(existsSync(new URL(`../${dir}/lcd-stages/${id}.webp`,import.meta.url)),`${dir}/lcd-stages/${id}.webp`);
  assert.deepEqual([...REACH_SCENES.sp.ids,...REACH_SCENES.spsp.ids].sort(),[...SCENE_IDS].sort());});
test('流星は星空→流星群→大流星、天空城は閉じた門→全開の門の順に変わる',()=>{const top=(s,t)=>reachSceneLayers(s,t).at(-1).id;
  assert.equal(top(sp,sp.at),'reach-meteor-1');assert.equal(top(sp,sp.at+2),'reach-meteor-2');assert.equal(top(sp,sp.until-.1),'reach-meteor-3');
  assert.equal(top(spsp,spsp.at),'reach-castle-1');assert.equal(top(spsp,spsp.until-.1),'reach-castle-4');
  const seen=[];for(let t=spsp.at;t<spsp.until;t+=.05){const id=top(spsp,t);if(seen.at(-1)!==id)seen.push(id);}assert.deepEqual(seen,REACH_SCENES.spsp.ids);});
test('切り替わりはクロスフェードで、下の絵が隠れきったら描かない',()=>{const mid=reachSceneLayers(sp,sp.at+.3*4.5+.25);assert.equal(mid.length,2);assert.equal(mid[0].alpha,1);assert.ok(mid[1].alpha>0&&mid[1].alpha<1);
  const late=reachSceneLayers(sp,sp.until-.1);assert.deepEqual(late.map(l=>l.id),['reach-meteor-3']);});
test('ノーマル・バトル・始まる前は場面の絵を出さない',()=>{assert.deepEqual(reachSceneLayers({kind:'normal',at:2.8,until:4.8},3),[]);assert.deepEqual(reachSceneLayers({kind:'battle',at:4.8,until:12},6),[]);
  assert.deepEqual(reachSceneLayers(sp,sp.at-.1),[]);assert.deepEqual(reachSceneLayers(null,1),[]);});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {SCENES,OBJECT_IDS,VISITORS,sceneDrifters,visitorAt} from '../lcd-scenes.js';
// 背景に漂う物（#70）: the pictures exist, every open-sky painted scene has some, and what a scene has depends only on the scene.
test('漂う物の絵はすべて assets/lcd-objects/ と dist/ にある',()=>{for(const id of OBJECT_IDS)for(const dir of ['assets','dist/assets'])assert.ok(existsSync(new URL(`../${dir}/lcd-objects/${id}.webp`,import.meta.url)),`${dir}/lcd-objects/${id}.webp`);
  for(const v of Object.values(VISITORS))for(const id of v.ids)assert.ok(OBJECT_IDS.includes(id),id);});
test('空の見える絵の背景には漂う物があり、広間と洞窟には出ない。中身は背景の番号だけで決まる',()=>{const painted=SCENES.filter(s=>s.shot);assert.ok(painted.length>0);
  for(const s of painted){const d=sceneDrifters(s);if(['throne','crystalcave'].includes(s.stage.id)){assert.equal(d,null,s.name);continue;}
    assert.ok(d&&VISITORS[d.visitor]&&d.period>=14,s.name);assert.deepEqual(sceneDrifters(s),d);if(s.stage.id==='whale')assert.notEqual(d.visitor,'whale',s.name);}
  const kinds=new Set(painted.map(sceneDrifters).filter(Boolean).map(d=>d.visitor));assert.deepEqual([...kinds].sort(),['dragon','ship','whale']);});
test('訪れる物は右から左へ横切り、横切ったあとはしばらく出ない',()=>{const d={visitor:'ship',period:20,seed:3},w=344;let seen=0,prev=null;
  for(let t=0;t<40;t+=.1){const a=visitorAt(d,w,t);if(a){seen++;assert.ok(a.x<=w&&a.x>=-a.dw-1);if(prev)assert.ok(a.x<prev.x||a.q<prev.q);}prev=a;}
  assert.ok(seen>0&&seen<400*.9,String(seen));});

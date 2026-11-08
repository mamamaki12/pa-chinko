import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {SCENES,OBJECT_IDS,VISITORS,sceneDrifters,visitorAt,sceneForeground} from '../lcd-scenes.js';
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
test('手前の物（#72）: 桜の並木は桜の枝、庭園と世界樹はつる、洞窟は水晶。ほかは時間帯に合うものが一部の背景だけに出る',()=>{const painted=SCENES.filter(s=>s.shot);
  for(const s of painted){const f=sceneForeground(s);if(f)assert.ok(OBJECT_IDS.includes(f),f);assert.equal(sceneForeground(s),f);
    if(s.stage.id==='sakura')assert.equal(f,'fg-sakura-branch');if(['garden','worldtree'].includes(s.stage.id))assert.equal(f,'fg-vine');if(s.stage.id==='crystalcave')assert.equal(f,'fg-crystal');
    if(f==='fg-sakura-branch'&&s.stage.id!=='sakura')assert.ok(s.time.dark<.5,s.name);}
  const share=painted.filter(s=>sceneForeground(s)).length/painted.length;assert.ok(share>.2&&share<.7,String(share));
  assert.equal(sceneForeground(SCENES.find(s=>!s.shot)??null),null);});

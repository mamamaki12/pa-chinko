import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {NAVIGATOR_ATLAS,NAVIGATOR_FACES,FADE,FIDGETS,portraitCell,portraitLayers,blinking,faceVariant,fidgetAt,portraitMotion} from '../navigator-art.js';
import {EVENTS,createNavi} from '../lcd-character.js';

test('ミニキャラの画像があり、すべての反応の表情に絵がある',()=>{
  assert.ok(existsSync(new URL('../'+NAVIGATOR_ATLAS.path,import.meta.url)));
  assert.ok(existsSync(new URL('../dist/'+NAVIGATOR_ATLAS.path,import.meta.url)));
  for(const e of Object.values(EVENTS))assert.ok(e.expr in NAVIGATOR_ATLAS.expressions,e.expr);
  assert.deepEqual(portraitCell('sora','surprise'),{column:2,row:0});assert.deepEqual(portraitCell('hana','sleepy'),{column:3,row:1});
});

test('表情は切り替えのときだけ短く重ねて入れ替わり、動きを減らす設定ではすぐ切り替わる',()=>{
  const n=createNavi('hana');assert.equal(portraitLayers(n,1).length,1);
  n.expr='happy';const start=portraitLayers(n,2);assert.equal(start.length,2);assert.equal(start[0].column,0);assert.equal(start[1].alpha,0);
  const mid=portraitLayers(n,2+FADE/2);assert.ok(mid[0].alpha>0&&mid[1].alpha>0);
  assert.deepEqual(portraitLayers(n,2+FADE),[{column:1,row:1,alpha:1}]);
  const r=createNavi('sora');portraitLayers(r,0,true);r.expr='surprise';assert.deepEqual(portraitLayers(r,1,true),[{column:2,row:0,alpha:1}]);
});

test('まばたきと口パクの顔パーツがそろっていて、画像の中に収まる',()=>{
  assert.ok(existsSync(new URL('../'+NAVIGATOR_FACES.path,import.meta.url)));
  assert.ok(existsSync(new URL('../dist/'+NAVIGATOR_FACES.path,import.meta.url)));
  for(const kind of ['sora','hana'])for(const key of ['normal:blink','surprise:blink','normal:open','happy:shut','surprise:shut','closed:open']){
    const [px,py,ox,oy,w,h]=NAVIGATOR_FACES[kind][key];assert.ok(px+w<=512&&py+h<=127&&ox+w<=384&&oy+h<=512,`${kind} ${key}`);}
});

const idle=kind=>({...createNavi(kind),greeted:true,poseAt:-9,poseUntil:0});
test('ときどきまばたきし、ソラとハナはそろわない',()=>{
  const s=idle('sora'),h=idle('hana');let bs=0,bh=0,both=0;
  for(let t=0;t<30;t+=.01){const a=blinking(s,t),b=blinking(h,t);bs+=a;bh+=b;both+=a&&b;}
  for(const b of [bs,bh]){assert.ok(b/3000>.02&&b/3000<.08,String(b));}
  assert.ok(both<bs/4);
  // A smiling face (eyes already closed) never blinks; reduced motion and a cross-fade show the plain picture.
  const n=idle('sora');const t=[...Array(1000).keys()].map(i=>i/100).find(t=>blinking(n,t));
  assert.equal(faceVariant(n,t,portraitLayers(n,t)),'normal:blink');
  assert.equal(faceVariant(n,t,portraitLayers(n,t),true),null);
  n.expr='happy';assert.equal(faceVariant(n,t+.01,portraitLayers(n,t+.01)),null);
});

test('しゃべっている間は口が開いたり閉じたりし、句読点では閉じる',()=>{
  const n={...idle('hana'),line:'こんにちは、ハナだよ',lineAt:0,lineUntil:9};const seen=new Set();
  for(let t=0;t<.6;t+=.02){n.shown=Math.floor(t*16);seen.add(faceVariant(n,t,[{column:0,row:1,alpha:1}]));}
  assert.ok(seen.has('normal:open'));
  n.shown=6;for(let t=0;t<.5;t+=.02)assert.notEqual(faceVariant(n,t,[{column:0,row:1,alpha:1}]),'normal:open');
  n.shown=2;assert.equal(faceVariant(n,.05,[{column:1,row:1,alpha:1}]),null);assert.equal(faceVariant(n,.15,[{column:1,row:1,alpha:1}]),'happy:shut');
});

test('反応ごとに体が動き、動きを減らす設定では止まる',()=>{
  const at=(pose,prio=1)=>({...idle('sora'),pose,poseAt:0,poseUntil:5,prio});
  const range=(n,key,from=0,to=2)=>{let lo=1e9,hi=-1e9;for(let t=from;t<to;t+=.01){const v=portraitMotion(n,t,{gentle:false})[key];lo=Math.min(lo,v);hi=Math.max(hi,v);}return [lo,hi];};
  assert.ok(range(at('cheer'),'lift')[1]>.08);assert.ok(range(at('point'),'lift',0,.4)[1]>.1);
  assert.ok(range(at('cheer',3),'sx',0,.7)[0]<-.5,'大きな当たりはくるっと回る');assert.ok(range(at('cheer',1),'sx',0,.7)[0]>0);
  assert.ok(range(at('wave'),'bend')[1]>.03);assert.ok(range(at('bow'),'angle',1,2)[0]>.05);
  for(const pose of ['cheer','point','wave','sleepy']){const m=portraitMotion(at(pose),.3,{reduced:true});assert.equal(m.lift,0);assert.equal(m.bend,0);assert.equal(m.sx,1);}
});

test('何もないときはときどき小さな仕草をし、抽選中やおしゃべり中はしない',()=>{
  const n=idle('hana');const names=new Set();for(let t=2;t<80;t+=.05){const f=fidgetAt(n,t);if(f)names.add(f.name);}
  assert.deepEqual([...names].sort(),[...FIDGETS].sort());
  const w={...idle('hana'),pose:'watch'};for(let t=2;t<40;t+=.05)assert.equal(fidgetAt(w,t),null);
  const s={...idle('hana'),line:'のんびりいこうね',lineAt:0,lineUntil:99,shown:0};for(let t=2;t<40;t+=.05)assert.equal(fidgetAt(s,t),null);
});

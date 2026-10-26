import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SCENES,SCENE_COUNT,PLACES,TIMES,WEATHERS,SKIES,skyFits,deckFor,createBackdrop,stepBackdrop,backdropView,SHOT_LEN,MIN_SHOW} from '../lcd-scenes.js';

test('背景は数百種類あり、番号・名前・組み合わせがすべて違う',()=>{
  assert.equal(SCENES.length,SCENE_COUNT);assert.ok(SCENE_COUNT>=300);
  assert.deepEqual(SCENES.map(s=>s.no),SCENES.map((_,i)=>i+1));
  assert.equal(new Set(SCENES.map(s=>s.name)).size,SCENES.length);
  assert.equal(new Set(SCENES.map(s=>[s.place.id,s.time.id,s.weather.id,s.sky.id].join())).size,SCENES.length);
});

test('場所・時間帯・天気・空の出来事はどれも何度も使われ、昼の花火や夜の虹のような合わない組み合わせはない',()=>{
  for(const [key,table] of [['place',PLACES],['time',TIMES],['weather',WEATHERS],['sky',SKIES]])for(const item of table){const n=SCENES.filter(s=>s[key]===item).length;assert.ok(n>=15,`${key} ${item.id}: ${n}`);}
  for(const s of SCENES)assert.ok(skyFits(s.sky,s.time),s.name);
  assert.ok(!SCENES.some(s=>s.sky.id==='rainbow'&&s.time.dark>.1));assert.ok(!SCENES.some(s=>s.sky.id==='fireworks'&&s.time.dark<.3));
});

test('台ごとの背景はそれぞれ百種類以上あり、リーチ用と大当たり用の背景もそろっている',()=>{
  for(const machine of ['aurora','astral']){const deck=deckFor(machine);assert.ok(deck.length>=150,`${machine}: ${deck.length}`);
    const b=createBackdrop(machine);assert.ok(b.decks.reach.length>=10,`${machine} reach: ${b.decks.reach.length}`);assert.ok(b.decks.bonus.length>=30,`${machine} bonus: ${b.decks.bonus.length}`);}
  assert.ok(deckFor('aurora').every(s=>s.time.theme!=='astral'));assert.ok(deckFor('astral').every(s=>s.time.theme!=='aurora'));
});

test('待機中は決まった時間ごとに次の背景へ移り、山札をひと回りするまで同じ背景は出ない',()=>{
  const b=createBackdrop('aurora',n=>0),seen=new Set();let t=0;stepBackdrop(b,t);
  for(let i=0;i<b.decks.normal.length;i++){seen.add(b.scene);const before=b.scene;stepBackdrop(b,t+=SHOT_LEN-.01);assert.equal(b.scene,before);stepBackdrop(b,t+=.02);assert.notEqual(b.scene,before);}
  assert.equal(seen.size,b.decks.normal.length);
});

test('変動が始まると背景が変わり、リーチでは演出用、大当たり中はお祭りの背景になり、終わると戻る',()=>{
  const b=createBackdrop('aurora');stepBackdrop(b,0);const first=b.scene;
  stepBackdrop(b,1,{phase:'draw',draw:1});assert.equal(b.scene,first,'出てすぐは変えない');
  stepBackdrop(b,MIN_SHOW+.1,{phase:'draw',draw:2});assert.notEqual(b.scene,first);
  stepBackdrop(b,MIN_SHOW+1,{phase:'reach',draw:2});assert.ok(b.scene.drama);assert.ok(b.scene.time.dark>=.3);
  stepBackdrop(b,MIN_SHOW+3,{phase:'bonus',draw:2});assert.ok(b.scene.party);
  for(let t=MIN_SHOW+3;t<60;t+=.5){stepBackdrop(b,t,{phase:'bonus',draw:2});assert.ok(b.scene.party);}
  stepBackdrop(b,61,{phase:'idle',draw:2});assert.equal(b.pool,'normal');
});

test('切り替わりは前の背景から少しずつ混ざり、動きを減らす設定では時間では変わらず一瞬で切り替わる',()=>{
  const b=createBackdrop('astral');stepBackdrop(b,0);stepBackdrop(b,SHOT_LEN);let v=backdropView(b,SHOT_LEN);assert.ok(v.prev);assert.equal(v.mix,0);
  v=backdropView(b,SHOT_LEN+.5);assert.ok(v.mix>0&&v.mix<1);v=backdropView(b,SHOT_LEN+5);assert.equal(v.prev,null);assert.equal(v.mix,1);
  const r=createBackdrop('astral');stepBackdrop(r,0,{timed:false});const s=r.scene;stepBackdrop(r,100,{timed:false});assert.equal(r.scene,s);
  stepBackdrop(r,101,{phase:'bonus',timed:false});assert.notEqual(r.scene,s);assert.equal(backdropView(r,101).mix,1);
  const p=createBackdrop('aurora');stepBackdrop(p,0,{pin:123});assert.equal(p.scene.no,123);stepBackdrop(p,100,{phase:'bonus',pin:123});assert.equal(p.scene.no,123);
});

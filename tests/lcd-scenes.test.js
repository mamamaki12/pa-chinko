import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SCENES,SCENE_COUNT,STAGES,TIMES,WEATHERS,SKIES,skyFits,deckFor,createBackdrop,stepBackdrop,backdropView,stageChange,SHOT_LEN,MIN_SHOW} from '../lcd-scenes.js';

test('背景のシーンは構図の違う舞台が数十種類あり、どの舞台も描き方（止まった絵と動く絵）か元の絵のカメラを持つ',()=>{
  assert.ok(STAGES.length>=40,String(STAGES.length));assert.equal(new Set(STAGES.map(s=>s.id)).size,STAGES.length);assert.equal(new Set(STAGES.map(s=>s.name)).size,STAGES.length);
  for(const s of STAGES){assert.ok(s.shot||typeof s.plate==='function'&&typeof s.live==='function',s.id);assert.ok(s.times.length>=4&&s.weathers.length>=1&&s.skies.length>=1,s.id);
    for(const id of s.times)assert.ok(TIMES.some(t=>t.id===id),`${s.id} ${id}`);for(const id of s.weathers)assert.ok(WEATHERS.some(w=>w.id===id),`${s.id} ${id}`);for(const id of s.skies)assert.ok(SKIES.some(k=>k.id===id),`${s.id} ${id}`);}
});

test('背景は数百種類あり、番号・名前・組み合わせがすべて違い、どの舞台も時間帯ごとに出てくる',()=>{
  assert.equal(SCENES.length,SCENE_COUNT);assert.ok(SCENE_COUNT>=300,String(SCENE_COUNT));
  assert.deepEqual(SCENES.map(s=>s.no),SCENES.map((_,i)=>i+1));
  assert.equal(new Set(SCENES.map(s=>s.name)).size,SCENES.length);
  assert.equal(new Set(SCENES.map(s=>[s.stage.id,s.time.id,s.weather.id,s.sky.id].join())).size,SCENES.length);
  for(const st of STAGES)assert.equal(SCENES.filter(s=>s.stage===st).length,st.times.length,st.id);
  for(const s of SCENES){assert.ok(skyFits(s.sky,s.time),s.name);assert.ok(s.stage.times.includes(s.time.id)&&s.stage.weathers.includes(s.weather.id)&&s.stage.skies.includes(s.sky.id),s.name);}
  assert.ok(!SCENES.some(s=>s.sky.id==='rainbow'&&s.time.dark>.1));assert.ok(!SCENES.some(s=>s.sky.id==='fireworks'&&s.time.dark<.3));assert.ok(!SCENES.some(s=>s.sky.id==='moon'&&s.time.dark>=.8),'夜は時間帯が月を描くので満月の出来事は重ねない');
});

test('台ごとの背景はそれぞれ百種類以上あり、リーチ用と大当たり用の背景もそろっている',()=>{
  for(const machine of ['aurora','astral']){const deck=deckFor(machine);assert.ok(deck.length>=150,`${machine}: ${deck.length}`);assert.ok(new Set(deck.map(s=>s.stage)).size>=35,`${machine} stages`);
    const b=createBackdrop(machine);assert.ok(b.decks.reach.length>=10,`${machine} reach: ${b.decks.reach.length}`);assert.ok(b.decks.bonus.length>=30,`${machine} bonus: ${b.decks.bonus.length}`);}
  assert.ok(deckFor('aurora').every(s=>s.time.theme!=='astral'));assert.ok(deckFor('astral').every(s=>s.time.theme!=='aurora'));
});

test('待機中は決まった時間ごとに次の背景へ移り、山札をひと回りするまで同じ背景は出ず、同じ舞台が続かない',()=>{
  const b=createBackdrop('aurora',n=>0),seen=new Set();let t=0;stepBackdrop(b,t);
  for(let i=0;i<b.decks.normal.length;i++){seen.add(b.scene);const before=b.scene;stepBackdrop(b,t+=SHOT_LEN-.01);assert.equal(b.scene,before);stepBackdrop(b,t+=.02);assert.notEqual(b.scene,before);assert.notEqual(b.scene.stage,before.stage);}
  assert.equal(seen.size,b.decks.normal.length);
});

test('変動が始まると背景が変わり、リーチでは演出用、大当たり中はお祭りの背景になり、終わると戻る',()=>{
  const b=createBackdrop('aurora');stepBackdrop(b,0);const first=b.scene;
  stepBackdrop(b,1,{phase:'draw',draw:1});assert.equal(b.scene,first,'出てすぐは変えない');
  stepBackdrop(b,MIN_SHOW+.1,{phase:'draw',draw:2});assert.notEqual(b.scene,first);
  stepBackdrop(b,MIN_SHOW+1,{phase:'reach',draw:2});assert.ok(b.scene.drama);
  stepBackdrop(b,MIN_SHOW+3,{phase:'bonus',draw:2});assert.ok(b.scene.party);
  for(let t=MIN_SHOW+3;t<60;t+=.5){stepBackdrop(b,t,{phase:'bonus',draw:2});assert.ok(b.scene.party);}
  stepBackdrop(b,61,{phase:'idle',draw:2});assert.equal(b.pool,'normal');
  const c=createBackdrop('astral');stepBackdrop(c,0);stepBackdrop(c,1,{phase:'draw',draw:1});stageChange(c,1.5,'bonus');assert.ok(c.scene.party);stepBackdrop(c,3,{phase:'draw',draw:1});assert.ok(c.scene.party,'ステージチェンジは変動が終わるまで続く');stepBackdrop(c,4,{phase:'idle',draw:1});assert.equal(c.pool,'normal');
});

test('切り替わりは前の背景から少しずつ混ざり、動きを減らす設定では時間では変わらず一瞬で切り替わる',()=>{
  const b=createBackdrop('astral');stepBackdrop(b,0);stepBackdrop(b,SHOT_LEN);let v=backdropView(b,SHOT_LEN);assert.ok(v.prev);assert.equal(v.mix,0);
  v=backdropView(b,SHOT_LEN+.5);assert.ok(v.mix>0&&v.mix<1);v=backdropView(b,SHOT_LEN+5);assert.equal(v.prev,null);assert.equal(v.mix,1);
  const r=createBackdrop('astral');stepBackdrop(r,0,{timed:false});const s=r.scene;stepBackdrop(r,100,{timed:false});assert.equal(r.scene,s);
  stepBackdrop(r,101,{phase:'bonus',timed:false});assert.notEqual(r.scene,s);assert.equal(backdropView(r,101).mix,1);
  const p=createBackdrop('aurora');stepBackdrop(p,0,{pin:123});assert.equal(p.scene.no,123);stepBackdrop(p,100,{phase:'bonus',pin:123});assert.equal(p.scene.no,123);
});

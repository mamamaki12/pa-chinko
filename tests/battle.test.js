import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planSpin,BATTLE} from '../engine.js';
import {battleScene,battleEvents,battleTime,SHEET,POSES,STAGE,FOES,ARENA} from '../battle-fx.js';
import {BOARD} from '../engine.js';
// A battle plan with this outcome against this enemy (a miss reaches only on 1/15 of draws and some wins revive, so draw until it fits).
const plan=(outcome,{asked,pressed,enemy='cloud'}={})=>{let p;do p=planSpin(outcome!=='lose',0,{gentle:false,force:{kind:'battle',revive:outcome==='revive',enemy}});while(!p.reach||p.battle.outcome!==outcome);if(asked||pressed!=null)p.asked=true;if(pressed!=null)p.pressed=p.push+pressed;return p;};
const look=s=>s&&JSON.stringify({...s,fx:s.fx.map(e=>e.kind)});
test('バトルはバトルの段階が始まってから出る',()=>{const p=plan('win');assert.equal(battleScene(p,p.stages[1].at-.01),null);assert.ok(battleScene(p,p.stages[1].at));assert.equal(battleTime(planSpin(true,0,{force:{kind:'sp'}}),20),null);});
test('同じ敵なら、ボタンを押すまでは当たりも外れも同じ見た目と音',()=>{for(const enemy of Object.keys(BATTLE.enemies)){const ps=['win','lose','revive'].map(o=>plan(o,{enemy}));for(let t=ps[0].stages[1].at;t<ps[0].push;t+=.05){const v=ps.map(p=>look(battleScene(p,t)));assert.equal(v[0],v[1]);assert.equal(v[0],v[2]);const e=ps.map(p=>JSON.stringify(battleEvents(p,t)));assert.equal(e[0],e[1]);assert.equal(e[0],e[2]);}
  const a=ps.map(o=>{o.asked=true;return o;});for(let t=a[0].push;t<a[0].push+3;t+=.1){const v=a.map(p=>look(battleScene(p,t)));assert.equal(v[0],v[1]);assert.equal(v[0],v[2]);}}});
test('復活はreviveAtまで外れとまったく同じで、そのあと光る',()=>{const l=plan('lose',{pressed:0}),r=plan('revive',{pressed:0});for(let f=0;f<BATTLE.reviveAt;f+=.02)assert.equal(look(battleScene(l,l.pressed+f)),look(battleScene(r,r.pressed+f)));
  const s=battleScene(r,r.pressed+BATTLE.reviveAt+.05);assert.equal(s.hana.pose,'glow');assert.ok(s.aura>0);assert.ok(battleEvents(r,r.pressed+BATTLE.reviveAt).some(([k])=>k==='revive'));assert.ok(!battleEvents(l,l.pressed+5).some(([k])=>k==='revive'));});
test('決着：勝ちはハナの勝ちポーズと敵の退場、負けは敵が去りハナは落ち着いたまま',()=>{for(const enemy of Object.keys(BATTLE.enemies)){const w=plan('win',{pressed:0,enemy}),l=plan('lose',{pressed:0,enemy}),r=plan('revive',{pressed:0,enemy});
  const mid=battleScene(w,w.pressed+1.05);assert.equal(mid.hana.pose,'strike');assert.ok(mid.fx.some(e=>e.kind==='beam'));assert.equal(mid.foe.alpha,1);
  const hit=battleScene(w,w.pressed+1.3);assert.equal(hit.foe.pose,'dizzy');assert.ok(hit.foe.alpha>.5&&hit.foe.x>STAGE.foe);
  const ws=battleScene(w,w.pressed+BATTLE.hold.win);assert.equal(ws.hana.pose,'victory');assert.ok(ws.title>0);assert.ok(ws.foe.alpha<.2);
  const rs=battleScene(r,r.pressed+BATTLE.hold.revive);assert.equal(rs.hana.pose,'victory');assert.ok(rs.foe.alpha<.2);
  for(let f=BATTLE.clash+.01;f<3;f+=.05){const s=battleScene(l,l.pressed+f);assert.equal(s.hana.pose,'calm');assert.equal(s.title,0);assert.equal(s.aura,0);}
  const ls=battleScene(l,l.pressed+BATTLE.hold.lose);assert.equal(ls.foe.pose,'leave');}});
test('キャラは液晶の中に立ち、絵のマスはシートに収まる',()=>{const d=BOARD.display;assert.ok(STAGE.ground<d.y2&&STAGE.ground-STAGE.height>d.y1);for(const x of [STAGE.hana,STAGE.foe])assert.ok(x>d.x1+40&&x<d.x2-40);
  for(const [r,c] of Object.values(POSES.hana)){assert.ok(r<SHEET.feet.length&&c<4);assert.ok(SHEET.feet[r][c]>SHEET.h*.8&&SHEET.feet[r][c]<=SHEET.h);}
  assert.equal(FOES.h,SHEET.h);const rows=new Set();for(const enemy of Object.keys(BATTLE.enemies)){const f=FOES[enemy];rows.add(f.row);assert.ok(['gust','shards','stars'].includes(f.shot));const [ax,ay]=f.attack;assert.ok(ax>=0&&ax<FOES.w&&ay>=0&&ay<FOES.h);
    for(const c of Object.values(POSES.foe)){assert.ok(c<4);assert.ok(f.feet[c]>FOES.h*.8&&f.feet[c]<=FOES.h);}}assert.equal(rows.size,Object.keys(BATTLE.enemies).length);});
test('バトルの舞台の絵は液晶をすき間なく覆い、床の手前の縁にキャラが立つ',()=>{const d=BOARD.display,h=d.y2-d.y1,dh=h*ARENA.size,dw=dh*16/9,top=STAGE.ground-ARENA.floor*dh;
  assert.ok(top<=d.y1&&top+dh>=d.y2);assert.ok(STAGE.mid-dw/2<=d.x1&&STAGE.mid+dw/2>=d.x2);for(const enemy of Object.keys(BATTLE.enemies))assert.ok(FOES[enemy].arena in ARENA);});
test('敵ごとに攻撃の弾が違う',()=>{const shots=Object.keys(BATTLE.enemies).map(enemy=>{const p=plan('win',{enemy}),t=p.stages[1].at+BATTLE.intro+.8+.4;return battleScene(p,t).fx.map(e=>e.kind).join();});assert.deepEqual(shots,['gust','shards','stars']);});
test('動きを減らす設定では、キャラは定位置で弾は飛ばない',()=>{const p=plan('win');for(let t=p.stages[1].at;t<p.push;t+=.1){const s=battleScene(p,t,{reduced:true});assert.equal(s.hana.x,STAGE.hana);assert.equal(s.foe.x,STAGE.foe);assert.equal(s.hana.lift,0);assert.equal(s.foe.lift,0);assert.ok(!s.fx.some(e=>['petals','gust','shards','stars'].includes(e.kind)));}});

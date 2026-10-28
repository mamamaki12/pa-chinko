import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drawHold,holdTrust,HOLD_COLORS,HOLD_PICK,planSpin,MISS_REST} from '../engine.js';

test('保留の抽選は1/99で当たり、外れの1/15がリーチになる',()=>{let win=0,reach=0,n=200000;for(let i=0;i<n;i++){const h=drawHold();if(h.win){win++;assert.equal(h.prize,300);assert.ok(h.reach);}else if(h.reach)reach++;}
  assert.ok(Math.abs(win/n-1/99)<.002,String(win/n));assert.ok(Math.abs(reach/(n-win)-1/15)<.004,String(reach/(n-win)));});
test('保留の色は実機に近い信頼度で、虹は当たり確定、白はほぼ外れ',()=>{assert.equal(holdTrust('rainbow'),1);assert.ok(holdTrust('white')<.01);
  const order=HOLD_COLORS.map(holdTrust);for(let i=1;i<order.length;i++)assert.ok(order[i]>order[i-1]);
  assert.ok(holdTrust('blue')>.03&&holdTrust('blue')<.15);assert.ok(holdTrust('green')>.1&&holdTrust('green')<.38);assert.ok(holdTrust('red')>.4&&holdTrust('red')<.6);assert.ok(holdTrust('gold')>.77&&holdTrust('gold')<.96);
  for(const o in HOLD_PICK)assert.equal(Object.values(HOLD_PICK[o]).reduce((a,b)=>a+b,0),10000);});
test('外れに虹は出ず、保留変化は上がるだけ',()=>{for(let i=0;i<100000;i++){const h=drawHold();if(!h.win)assert.notEqual(h.color,'rainbow');assert.ok(HOLD_COLORS.indexOf(h.shown)<=HOLD_COLORS.indexOf(h.color));}});
test('「いつも同じ」では保留はいつも白で変化もしない',()=>{for(let i=0;i<20000;i++){const h=drawHold({variety:false});assert.equal(h.color,'white');assert.equal(h.shown,'white');}});
test('保留の色を選んでも当たりの確率は変わらない',()=>{const seq=[0,0,0,0];let k=0;const rand=()=>seq[k++%seq.length];assert.equal(drawHold({rand}).win,true);
  let wins=0;for(let i=0;i<100000;i++)if(drawHold({force:'rainbow'}).win)wins++;assert.ok(Math.abs(wins/100000-1/99)<.002);});
test('入賞時に決めたリーチの有無で変動する',()=>{for(let i=0;i<300;i++){assert.equal(planSpin(false,0,{reach:true}).reach,true);assert.equal(planSpin(false,0,{reach:false}).reach,false);}});
test('外れのあとは1秒ほど止める',()=>{assert.ok(MISS_REST>=.8&&MISS_REST<=1.5);});

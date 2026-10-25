import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STRIP,payout,resolvePachinko,advanceBall,randomInt,collideDisplay,MAX_HOLDS,addHold,planSpin} from '../engine.js';
test('配当と外れ、左チェリーの優先順位',()=>{assert.equal(payout(['seven','seven','seven']),150);assert.equal(payout(['bell','bell','bell']),15);assert.equal(payout(['cherry','cherry','cherry']),8);assert.equal(payout(['cherry','bell','bar']),2);assert.equal(payout(['bell','bar','seven']),0);});
test('パチンコの99通りに当たりは1つ',()=>{assert.equal(Array.from({length:99},(_,i)=>resolvePachinko(i)).filter(Boolean).length,1);assert.equal(resolvePachinko(0),300);});
test('釘との衝突で玉が反射する',()=>{const b={x:360,y:195,vx:0,vy:100};advanceBall(b,1/120,[{x:360,y:200}]);assert.ok(b.vy<0);assert.ok(Number.isFinite(b.x));});
test('盤面の外周から逸脱しない',()=>{const b={x:110,y:400,vx:60,vy:-800};for(let i=0;i<3000;i++){advanceBall(b,1/120,[]);assert.ok(Math.hypot(b.x-360,b.y-370)<=272.01);} });
test('リール配列と乱数の範囲',()=>{assert.equal(STRIP.length,21);for(let i=0;i<1000;i++){const n=randomInt(99);assert.ok(n>=0&&n<99&&Number.isInteger(n));}});

test('中央液晶を玉が貫通しない',()=>{const b={x:300,y:231,vx:10,vy:100};collideDisplay(b);assert.equal(b.y,230);assert.ok(b.vy<0);});

test('保留は4つまで',()=>{let h=0;for(let i=0;i<6;i++)h=addHold(h);assert.equal(h,MAX_HOLDS);assert.equal(MAX_HOLDS,4);});
test('当たりは必ずリーチを経て3つ揃う',()=>{for(let i=0;i<200;i++){const p=planSpin(true,0);assert.ok(p.reach);assert.ok(p.numbers.every(n=>n===p.numbers[0]));assert.ok(p.stops[1]>p.stops[2]);}});
test('外れは揃わず、リーチ外れは1つ違いで止まらない',()=>{let reaches=0;for(let i=0;i<3000;i++){const p=planSpin(false,i%5);const [l,m,r]=p.numbers;assert.ok(!(l===m&&m===r));p.numbers.forEach(n=>assert.ok(n>=1&&n<=9));if(p.reach){reaches++;assert.equal(l,r);const d=Math.abs(m-l);assert.ok(d>1&&d<8);}else assert.notEqual(l,r);}assert.ok(reaches>50&&reaches<400);});
test('保留が多いほど外れの変動は短い',()=>{const noReach={rand:n=>n===15?1:0};assert.ok(planSpin(false,3,noReach).duration<planSpin(false,1,noReach).duration);assert.ok(planSpin(false,1,noReach).duration<planSpin(false,0,noReach).duration);const r=planSpin(false,0,{rand:()=>0});assert.ok(r.reach);assert.ok(planSpin(true,0,{gentle:true}).duration<planSpin(true,0,{gentle:false}).duration);});

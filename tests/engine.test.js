import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STRIP,payout,resolvePachinko,advanceBall,randomInt,collideDisplay} from '../engine.js';
test('配当と外れ、左チェリーの優先順位',()=>{assert.equal(payout(['seven','seven','seven']),150);assert.equal(payout(['bell','bell','bell']),15);assert.equal(payout(['cherry','cherry','cherry']),8);assert.equal(payout(['cherry','bell','bar']),2);assert.equal(payout(['bell','bar','seven']),0);});
test('パチンコの99通りに当たりは1つ',()=>{assert.equal(Array.from({length:99},(_,i)=>resolvePachinko(i)).filter(Boolean).length,1);assert.equal(resolvePachinko(0),300);});
test('釘との衝突で玉が反射する',()=>{const b={x:360,y:195,vx:0,vy:100};advanceBall(b,1/120,[{x:360,y:200}]);assert.ok(b.vy<0);assert.ok(Number.isFinite(b.x));});
test('盤面の外周から逸脱しない',()=>{const b={x:110,y:400,vx:60,vy:-800};for(let i=0;i<3000;i++){advanceBall(b,1/120,[]);assert.ok(Math.hypot(b.x-360,b.y-370)<=272.01);} });
test('リール配列と乱数の範囲',()=>{assert.equal(STRIP.length,21);for(let i=0;i<1000;i++){const n=randomInt(99);assert.ok(n>=0&&n<99&&Number.isInteger(n));}});

test('中央液晶を玉が貫通しない',()=>{const b={x:300,y:231,vx:10,vy:100};collideDisplay(b);assert.equal(b.y,230);assert.ok(b.vy<0);});

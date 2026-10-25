import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STRIP,BOARD,payout,resolvePachinko,advanceBall,randomInt,collideDisplay,makePins,launchBall,advanceRail,inStart} from '../engine.js';
test('配当と外れ、左チェリーの優先順位',()=>{assert.equal(payout(['seven','seven','seven']),150);assert.equal(payout(['bell','bell','bell']),15);assert.equal(payout(['cherry','cherry','cherry']),8);assert.equal(payout(['cherry','bell','bar']),2);assert.equal(payout(['bell','bar','seven']),0);});
test('パチンコの99通りに当たりは1つ',()=>{assert.equal(Array.from({length:99},(_,i)=>resolvePachinko(i)).filter(Boolean).length,1);assert.equal(resolvePachinko(0),300);});
test('釘との衝突で玉が反射する',()=>{const b={x:360,y:195,vx:0,vy:100};advanceBall(b,1/120,[{x:360,y:200}]);assert.ok(b.vy<0);assert.ok(Number.isFinite(b.x));});
test('盤面の外周から逸脱しない',()=>{const b={x:BOARD.cx-250,y:BOARD.cy+30,vx:60,vy:-800};for(let i=0;i<3000;i++){advanceBall(b,1/120,[]);assert.ok(Math.hypot(b.x-BOARD.cx,b.y-BOARD.cy)<=BOARD.r+.01);} });
test('リール配列と乱数の範囲',()=>{assert.equal(STRIP.length,21);for(let i=0;i<1000;i++){const n=randomInt(99);assert.ok(n>=0&&n<99&&Number.isInteger(n));}});

test('中央液晶を玉が貫通しない',()=>{const {x1,y1}=BOARD.display;const b={x:x1+90,y:y1+1,vx:10,vy:100};collideDisplay(b);assert.equal(b.y,y1);assert.ok(b.vy<0);});
test('中央液晶は盤面の内側にある',()=>{const {x1,x2,y1,y2}=BOARD.display;for(const [x,y] of [[x1,y1],[x2,y1],[x1,y2],[x2,y2]])assert.ok(Math.hypot(x-BOARD.cx,y-BOARD.cy)<BOARD.r);});
test('釘は盤面の内側にあり、液晶とガイドに重ならない',()=>{const {x1,x2,y1,y2}=BOARD.display;for(const p of makePins()){assert.ok(Math.hypot(p.x-BOARD.cx,p.y-BOARD.cy)<BOARD.r);assert.ok(!(p.x>x1&&p.x<x2&&p.y>y1&&p.y<y2));}});
test('発射した玉はレールを上り、強いほど右で盤面に出る',()=>{const exit=power=>{const b=launchBall(power);let n=0;while(b.rail&&n++<1000)advanceRail(b,1/120);assert.ok(!b.rail);assert.ok(Math.hypot(b.x-BOARD.cx,b.y-BOARD.cy)<BOARD.r);return b.x;};assert.ok(exit(1)>exit(.45));assert.ok(exit(.45)<BOARD.cx);});
test('START入賞口は下向きに入った玉だけを数える',()=>{assert.ok(inStart({x:BOARD.cx,y:614,vx:0,vy:50}));assert.ok(!inStart({x:BOARD.cx,y:614,vx:0,vy:-50}));assert.ok(!inStart({x:BOARD.cx+40,y:614,vx:0,vy:50}));});

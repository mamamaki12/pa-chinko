import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BOARD,START,PLASTIC,NAILS,advanceBall,inStart,collideDisplay,collidePlastic} from '../engine.js';
test('液晶の斜めの下端は透明ステージを塞がない',()=>{
  for(const x of [190,205,235,485,515,530]){const b={x,y:500,vx:30,vy:50};collideDisplay(b);assert.deepEqual(b,{x,y:500,vx:30,vy:50});}
  const b={x:210,y:470,vx:0,vy:100};collideDisplay(b);assert.ok(b.y>470);assert.ok(b.x<210);
});
test('プラスチックの上は支え、下の玉を上面へ吸い寄せない',()=>{
  for(const [x1,y1,x2,y2] of PLASTIC){const x=(x1+x2)/2,y=(y1+y2)/2;
    const below={x,y:y+12,vx:10,vy:50};collidePlastic(below,x,y+10);assert.equal(below.y,y+12);
    const above={x,y:y-1,vx:0,vy:100};collidePlastic(above,x,y-10);assert.ok(above.y<y-1);
  }
});
test('両側のステージを中央の落とし口まで転がれる（30/60/120fps）',()=>{
  for(const dt of [1/30,1/60,1/120])for(const x of [220,500]){
    const b={x,y:470,vx:0,vy:0};let reached=false;
    for(let t=0;t<5;t+=dt){advanceBall(b,dt,NAILS);if(b.x>347&&b.x<373&&b.y>570){reached=true;break;}}
    assert.ok(reached,`${dt} ${x}: ${b.x},${b.y}`);
  }
});
test('高速な玉も釘とプラスチックをすり抜けない',()=>{
  const pin={x:100,y:420,r:1.5},b={x:100,y:390,vx:0,vy:1800};advanceBall(b,1/30,[pin]);assert.ok(b.y<420);
  const c={x:240,y:485,vx:0,vy:1800};advanceBall(c,1/30,[]);assert.ok(c.y<540);
});
test('入賞は上の口を下向きに横切った時だけ（側面・下・上向きは不可）',()=>{
  const center=(START.x1+START.x2)/2;
  const yes={x:center,y:START.y-10,vx:0,vy:900};advanceBall(yes,1/30,[]);assert.ok(inStart(yes));
  for(const b of [{x:center,y:614,vx:0,vy:80},{x:center,y:630,vx:0,vy:-900},{x:330,y:615,vx:900,vy:0}]){advanceBall(b,1/120,[]);assert.ok(!inStart(b));}
});
test('上面と重なる飾り釘の判定を残さない',()=>{
  for(const p of NAILS)for(const [x,y,xx,yy] of PLASTIC){const dx=xx-x,dy=yy-y,t=((p.x-x)*dx+(p.y-y)*dy)/(dx*dx+dy*dy);if(t>=0&&t<=1)assert.ok(Math.hypot(p.x-x-t*dx,p.y-y-t*dy)>=8);}
});

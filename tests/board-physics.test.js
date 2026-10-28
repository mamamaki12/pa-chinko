import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BOARD,START,PLASTIC,NAILS,STAGE_SPILL,advanceBall,inStart,collideDisplay,collidePlastic} from '../engine.js';
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
    for(let t=0;t<5;t+=dt){advanceBall(b,dt,NAILS,()=>1);if(b.x>347&&b.x<373&&b.y>570){reached=true;break;}}
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
test('ステージの玉は転がるうちに手前へこぼれ、こぼれた玉はステージを通り抜ける',()=>{
  assert.ok(STAGE_SPILL>0);
  const b={x:220,y:470,vx:0,vy:0};for(let t=0;t<5&&!b.front;t+=1/60)advanceBall(b,1/60,NAILS,()=>0);assert.equal(b.front,true);
  const [x1,y1,x2,y2]=PLASTIC[2],x=(x1+x2)/2,y=(y1+y2)/2,c={x,y:y-1,vx:0,vy:100,front:true};collidePlastic(c,x,y-10,1/60,()=>0);assert.equal(c.y,y-1);
  const kept={x,y:y-1,vx:0,vy:100};collidePlastic(kept,x,y-10,1/60,()=>1);assert.ok(kept.y<y-1&&!kept.front);
});
test('ステージを転がる玉は縁の金の粒に挟まって止まらない（止まらずに中央の落とし口まで行く）',()=>{
  assert.ok(NAILS.some(p=>p.rim));
  for(const dt of [1/30,1/60,1/120])for(const x of [220,280,440,500,550]){
    const b={x,y:x<360?470:x<520?480:460,vx:0,vy:0};let anchor={x:b.x,y:b.y,t:0},still=0,reached=false;
    for(let t=0;t<5;t+=dt){advanceBall(b,dt,NAILS,()=>1);if(b.x>347&&b.x<373&&b.y>570){reached=true;break;}if(Math.hypot(b.x-anchor.x,b.y-anchor.y)>3)anchor={x:b.x,y:b.y,t};else still=Math.max(still,t-anchor.t);}
    assert.ok(reached,`${dt} ${x}: ${b.x},${b.y}`);assert.ok(still<.2,`${dt} ${x}: ${still.toFixed(2)}秒止まった`);
  }
});
test('縁の粒も、上から落ちてきた玉には当たる',()=>{
  const p=NAILS.find(n=>n.id==='nail-237');assert.ok(p.rim);
  const b={x:p.x,y:p.y-20,vx:0,vy:200};advanceBall(b,1/30,NAILS,()=>1);assert.ok(b.y<p.y);
});
test('釘の間に乗った玉は、止まって見えるほど待たずにこぼれ落ちる',()=>{
  const b={x:172,y:318,vx:0,vy:0};let t=0;for(;t<2&&b.y<322;t+=1/120)advanceBall(b,1/120,NAILS,()=>1);assert.ok(t<.25,`${t.toFixed(2)}秒`);
});

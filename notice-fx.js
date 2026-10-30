import {NOTICE_KINDS} from './engine.js';
import {drawFx} from './lcd-fx.js';
// 予告 (notice) shows on the LCD at the start of a draw (see pickNotice in engine.js for how they are picked). 群予告: butterflies,
// birds, petals or stars sweep across the screen in a wave; セリフ予告: a line in a coloured frame; カットイン: a slanted band with big
// lettering slides through; ステージチェンジ: a light wipe, behind which the background switches to a reach or bonus scene.
// The colour (blue < green < red < gold) tells how likely a win is. Gentle mode draws fewer, dimmer pieces and a weaker wipe;
// prefers-reduced-motion shows the notice still, with no wipe. Behind the ステージチェンジ wipe a painted swirl turns (lcd-fx.js): petals for
// Hana (AURORA), stardust for Sora (ASTRAL).

export const NOTICE_LEN=1.5,STAGE_AT=.35;
export const NOTICE_TINTS={blue:{main:'#4aa8ff',light:'#e6f4ff',deep:'#1d4fa8'},green:{main:'#3fd87a',light:'#eafff0',deep:'#167a3c'},red:{main:'#ff4a3a',light:'#fff0ec',deep:'#a01a12'},gold:{main:'#ffc83a',light:'#fffbe6',deep:'#b0700c'}};
// What the セリフ and カットイン say for each colour.
export const NOTICE_WORDS={blue:'なにか来そう…',green:'チャンスかも！',red:'これは熱い…！',gold:'激アツ!!'};
export const CUTIN_WORDS={blue:'CHANCE',green:'CHANCE!',red:'激アツ',gold:'超激アツ'};
const clamp=v=>v<0?0:v>1?1:v,ease=v=>v*v*(3-2*v);
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
// How visible the notice is at age (seconds since it started): fades in over .15 s and out over the last .3 s.
export function noticeAlpha(age,reduced=false){if(age<0||age>=NOTICE_LEN)return 0;return reduced?1:Math.min(1,age/.15,(NOTICE_LEN-age)/.3);}
export function noticeName(n){return n?NOTICE_KINDS[n.kind]:'';}

function piece(ctx,kind,s,t,i,tint){ctx.beginPath();
  if(kind==='butterflies'){const f=.25+.75*Math.abs(Math.sin(t*14+i));for(const side of [-1,1]){ctx.save();ctx.scale(side*f,1);ctx.fillStyle=tint.main;ctx.beginPath();ctx.ellipse(s*.45,-s*.2,s*.45,s*.32,-.5,0,7);ctx.ellipse(s*.35,s*.25,s*.3,s*.22,.5,0,7);ctx.fill();ctx.fillStyle=tint.light+'cc';ctx.beginPath();ctx.ellipse(s*.4,-s*.22,s*.18,s*.12,-.5,0,7);ctx.fill();ctx.restore();}ctx.fillStyle='#2a1a30';ctx.fillRect(-s*.06,-s*.35,s*.12,s*.7);}
  else if(kind==='birds'){const f=Math.sin(t*12+i*1.3)*s*.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.moveTo(-s,-f);ctx.quadraticCurveTo(-s*.4,-s*.35,0,0);ctx.quadraticCurveTo(s*.4,-s*.35,s,-f);
    ctx.strokeStyle='#140a24';ctx.lineWidth=Math.max(3,s*.3);ctx.stroke();ctx.strokeStyle=tint.main;ctx.lineWidth=Math.max(1.6,s*.16);ctx.stroke();}
  else if(kind==='petals'){ctx.rotate(t*4+i);ctx.scale(1,Math.max(.2,Math.abs(Math.cos(t*5+i))));ctx.fillStyle=tint.main;ctx.ellipse(0,0,s*.6,s*.32,0,0,7);ctx.fill();ctx.fillStyle=tint.light+'cc';ctx.beginPath();ctx.ellipse(s*.15,0,s*.35,s*.18,0,0,7);ctx.fill();}
  else{ctx.rotate(t*3+i);ctx.fillStyle=tint.light;for(let k=0;k<10;k++){const a=k*Math.PI/5,r=k%2?s*.4:s;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();}}
// 群予告: n pieces fly from left to right in a wavy band, each with a soft glow of the notice colour.
function flock(ctx,n,{x,y,w,h},age,tint,{gentle,reduced}){const many=n.kind==='petals'?1.6:1,count=Math.round((reduced?8:gentle?14:24)*many),size=Math.min(w,h)*(n.kind==='petals'?.06:.075);
  for(let i=0;i<count;i++){const lag=hash(i+3)*.45,q=reduced?.15+.7*hash(i+5):clamp((age-lag)/(NOTICE_LEN-.5));if(!reduced&&(q<=0||q>=1))continue;
    const px=x-size*2+q*(w+size*4)+(hash(i+7)-.5)*w*.15,py=y+h*(.2+.55*hash(i+11))+Math.sin(q*9+i)*h*.06,s=size*(.7+.6*hash(i+13));
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=gentle?.35:.6;const g=ctx.createRadialGradient(px,py,0,px,py,s*2.2);g.addColorStop(0,tint.main);g.addColorStop(1,tint.main+'00');ctx.fillStyle=g;ctx.fillRect(px-s*2.2,py-s*2.2,s*4.4,s*4.4);ctx.restore();
    ctx.save();ctx.translate(px,py);piece(ctx,n.kind,s,reduced?0:age,i,tint);ctx.restore();}}
function label(ctx,text,x,y,size,tint,{gentle,font='900 {s}px "Hiragino Sans","Noto Sans JP",sans-serif'}={}){ctx.font=font.replace('{s}',size);ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  ctx.lineWidth=size*.22;ctx.strokeStyle='#14040f';ctx.strokeText(text,x,y);ctx.shadowColor=tint.main;ctx.shadowBlur=gentle?4:14;const g=ctx.createLinearGradient(0,y-size/2,0,y+size/2);g.addColorStop(0,tint.light);g.addColorStop(.55,tint.main);g.addColorStop(1,tint.deep);ctx.fillStyle=g;ctx.fillText(text,x,y);ctx.shadowBlur=0;}
// Draws the notice n (null for none) at age seconds into the box {x,y,w,h}.
export function drawNotice(ctx,n,age,{x,y,w,h,gentle=true,reduced=false,machine='aurora'}){const a=n?noticeAlpha(age,reduced):0;if(!a)return;const tint=NOTICE_TINTS[n.color]??NOTICE_TINTS.blue;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.globalAlpha=a;const box={x,y,w,h},opts={gentle,reduced};
  if(n.kind==='words'){const pop=reduced?1:1+.25*Math.exp(-10*age),bw=w*.62,bh=h*.17,cx=x+w*.6,cy=y+h*.2;ctx.translate(cx,cy);ctx.scale(pop,pop);
    ctx.fillStyle='rgba(12,6,24,.82)';ctx.strokeStyle=tint.main;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-bw/2,-bh/2,bw,bh,bh/2);ctx.fill();ctx.stroke();label(ctx,NOTICE_WORDS[n.color],0,1,Math.round(bh*.5),tint,opts);}
  else if(n.kind==='cutin'){const inq=reduced?.5:age<.25?ease(age/.25)*.5:age>NOTICE_LEN-.3?.5+ease((age-NOTICE_LEN+.3)/.3)*.5:.5,cx=x+w*(1.5-2*inq),cy=y+h*.5,bh=h*.3;
    ctx.save();ctx.translate(x+w/2,cy);ctx.rotate(-.12);ctx.fillStyle='rgba(10,4,20,.85)';ctx.fillRect(-w,-bh/2,w*2,bh);ctx.fillStyle=tint.main;ctx.fillRect(-w,-bh/2,w*2,4);ctx.fillRect(-w,bh/2-4,w*2,4);
    if(!reduced){ctx.strokeStyle=tint.light+'55';ctx.lineWidth=1.5;for(let i=0;i<14;i++){const ly=(hash(i)-.5)*bh*.8,lx=((hash(i+4)*w*2-age*w*3)%(w*2)+w*2)%(w*2)-w;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+w*.25,ly);ctx.stroke();}}ctx.restore();
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-.12);label(ctx,CUTIN_WORDS[n.color],0,0,Math.round(bh*.62),tint,{...opts,font:'italic 900 {s}px "Arial Black","Hiragino Sans","Noto Sans JP",sans-serif'});ctx.restore();}
  else if(n.kind==='stage'){if(!reduced){drawFx(ctx,machine==='astral'?'fx-star-swirl':'fx-petal-swirl',x+w/2,y+h*.45,w*(.5+.7*ease(clamp(age/NOTICE_LEN))),{rot:age*1.6,op:'screen',alpha:(gentle?.35:.7)*clamp((age-.05)/.3)});const q=clamp(age/(STAGE_AT*2)),sx=x-w*.3+q*w*1.6;const g=ctx.createLinearGradient(sx-w*.3,0,sx+w*.3,0);g.addColorStop(0,'#fff0');g.addColorStop(.5,gentle?'rgba(255,255,255,.45)':'rgba(255,255,255,.9)');g.addColorStop(1,'#fff0');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);}
    if(reduced||age>STAGE_AT)label(ctx,'STAGE CHANGE',x+w/2,y+h*.18,Math.round(h*.085),tint,{...opts,font:'italic 900 {s}px Georgia,serif'});}
  else flock(ctx,n,box,age,tint,opts);
  ctx.restore();}

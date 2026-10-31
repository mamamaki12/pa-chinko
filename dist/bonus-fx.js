import {drawFx,drawUi} from './lcd-fx.js';
import {goldText,titleScale,PALETTES} from './celebration.js';
// The LCD while the jackpot rounds are being played (右打ち), and the 確変 (ST) plate. Like a real machine the round screen keeps moving:
// slow light rays and rising sparkles behind the numbers, a big ROUND title that bursts in at each round (FINAL ROUND for the last),
// ten jewels that light up one by one as balls go into the attacker, a 右打ち plate with flowing arrows and a light sweep, and the
// balls won so far. The 確変 plate gets an aurora frame, twinkling stars and a counter that pops when it goes down.
// Everything is a function of the time, the bonus ({round, count, open, paid, at: round start, hitAt: last ball in}) and st
// ({left, at: last change}). Gentle mode dims and slows; prefers-reduced-motion keeps everything still. Nothing here depends on
// a draw: the jackpot is already decided.

const JP='900 {s}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif JP","Noto Serif CJK JP",serif';
const clamp=v=>v<0?0:v>1?1:v,hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};

// Behind the numbers: turning rays, sparkles rising from the bottom and, for a second at each round start, a burst of light.
export function drawRoundBack(ctx,[x,y,w,h],b,t,{gentle=true,reduced=false}){const k=gentle?.65:1;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  drawFx(ctx,'fx-rays',x+w/2,y+h*.6,w*1.5,{rot:reduced?0:t*(gentle?.12:.22),op:'screen',alpha:(b.open?.3:.18)*k,tint:'#ffd6ec'});
  if(!reduced){for(let i=0;i<12;i++){const sp=.12+.1*hash(i),q=(t*sp+hash(i+9))%1,px=x+w*(.05+.9*hash(i+3))+Math.sin(t*1.3+i)*8,py=y+h*(1.05-q*1.1);
      drawFx(ctx,'fx-sparkle-set',px,py,10+14*hash(i+5),{cell:i,alpha:k*Math.sin(q*Math.PI)});}
    const age=t-b.at;if(age>=0&&age<1){drawFx(ctx,'fx-light-burst',x+w/2,y+h*.62,w*(.4+.9*age),{rot:age*.5,op:'screen',alpha:(gentle?.45:.8)*(1-age)});
      drawFx(ctx,'fx-shockwave',x+w/2,y+h*.62,w*(.2+1.4*age),{tint:'#ff9fd2',alpha:(gentle?.5:.9)*(1-age)});}}
  ctx.restore();}

function jewel(ctx,cx,cy,r,lit,pop){ctx.save();ctx.translate(cx,cy);ctx.scale(pop,pop);
  if(lit){const g=ctx.createRadialGradient(-r*.3,-r*.3,0,0,0,r*1.1);g.addColorStop(0,'#ffffff');g.addColorStop(.35,'#ffc4e4');g.addColorStop(1,'#e0287c');
    ctx.shadowColor='#ff6fb6';ctx.shadowBlur=r*2.2;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  else{ctx.fillStyle='#1a0b1fdd';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#f2d891';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,r+.6,0,Math.PI*2);ctx.stroke();ctx.restore();}

// The 右打ち plate at its usual place (box: x, y, w, h), with arrows flowing to the right and a light sweep.
export function drawRightPlate(ctx,[px,py,pw,ph],t,{gentle=true,reduced=false,text='右打ち',left=false}){const beat=reduced?0:.5+.5*Math.sin(t*(gentle?3:5));
  ctx.save();ctx.shadowColor='#ff5fae';ctx.shadowBlur=(gentle?5:9)+beat*(gentle?4:8);const g=ctx.createLinearGradient(px,py,px,py+ph);g.addColorStop(0,'#5a1450');g.addColorStop(.55,'#2a0a2c');g.addColorStop(1,'#14040f');
  ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(px,py,pw,ph,ph/2);ctx.fill();ctx.shadowBlur=0;
  const rim=ctx.createLinearGradient(px,0,px+pw,0);rim.addColorStop(0,'#fff3c4');rim.addColorStop(.5,'#d0841f');rim.addColorStop(1,'#ffe08a');ctx.strokeStyle=rim;ctx.lineWidth=1.8;ctx.stroke();
  ctx.save();ctx.clip();if(!reduced){const q=(t/1.8)%1,sx=px-pw*.4+q*pw*1.8,sw=ctx.createLinearGradient(sx-18,0,sx+18,0);sw.addColorStop(0,'#fff0');sw.addColorStop(.5,gentle?'#ffffff55':'#ffffff99');sw.addColorStop(1,'#fff0');ctx.fillStyle=sw;ctx.fillRect(px,py,pw,ph);}ctx.restore();
  const tx=left?px+pw*.62:px+pw*.38;goldText(ctx,text,tx,py+ph/2+1,ph*.55,t,{pal:PALETTES.aurora,font:JP,glow:gentle?.4:.8});
  const ax=left?px+pw*.2:px+pw*.8,dir=left?-1:1;for(let i=0;i<3;i++){const ph2=reduced?.6:clamp(Math.sin((t*3-i*.55)*Math.PI)*.5+.5),cx=ax+dir*(i-1)*7;
    ctx.globalAlpha=.35+.65*ph2;ctx.fillStyle=i===2?'#ffffff':'#ffb6dc';ctx.beginPath();ctx.moveTo(cx-dir*3,py+ph*.3);ctx.lineTo(cx+dir*4,py+ph/2);ctx.lineTo(cx-dir*3,py+ph*.7);ctx.closePath();ctx.fill();}
  ctx.restore();}

// The round title sits a little left of the middle, clear of the 右打ち plate; the jewels start right of the hold lamps.
const CX=340,JX=350,JS=11;
// Over the numbers: the round title, the jewels (or NEXT ROUND between rounds), the 右打ち plate and the balls won.
export function drawRoundHud(ctx,[x1,y1,x2,y2],b,t,{rounds,count,gentle=true,reduced=false}){const age=t-b.at,last=b.round>=rounds,pal=last?PALETTES.rush:PALETTES.aurora;
  if(!reduced&&age>=0&&age<1.1)drawFx(ctx,'ui-num-line',CX,463,340,{alpha:(gentle?.5:.85)*Math.sin(clamp(age/1.1)*Math.PI)});
  drawUi(ctx,'ui-plate-label',CX,466,last?200:180,{alpha:.95});
  const sc=b.open?titleScale(age,reduced):1;ctx.save();ctx.translate(CX,464);ctx.scale(sc,sc);
  if(last)goldText(ctx,'FINAL ROUND',0,0,19,t,{pal,glow:gentle?.5:.9});
  else{const w=goldText(ctx,'ROUND',-14,0,17,t,{pal,glow:gentle?.4:.8});goldText(ctx,String(b.round),-14+w/2+12,-1,25,t,{pal,glow:gentle?.6:1});goldText(ctx,`/ ${rounds}`,-14+w/2+30,2,13,t,{pal,glow:.3});}
  ctx.restore();
  if(b.open){const hit=t-(b.hitAt??-9);for(let i=0;i<count;i++){const cx=JX+(i-(count-1)/2)*JS,lit=i<b.count,pop=lit&&i===b.count-1&&!reduced?1+.7*Math.exp(-9*hit):1;jewel(ctx,cx,491,4,lit,pop);}
    if(!reduced&&hit<.35&&b.count>0)drawFx(ctx,'ui-num-stop',JX+(b.count-1-(count-1)/2)*JS,491,46*(1-hit*1.5),{alpha:(gentle?.6:1)*(1-hit/.35)});}
  else{ctx.save();ctx.globalAlpha=reduced?1:.65+.35*Math.sin(t*Math.PI*1.6);goldText(ctx,'NEXT ROUND',CX,491,12,t,{pal:PALETTES.aurora,glow:.5});ctx.restore();}
  drawRightPlate(ctx,[x2-112,y2-50,104,32],t,{gentle,reduced});
  ctx.save();ctx.fillStyle='#1a0717c8';ctx.strokeStyle='#f2d89199';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x2-104,y1+8,96,24,12);ctx.fill();ctx.stroke();ctx.restore();
  goldText(ctx,`獲得 ${b.paid}玉`,x2-56,y1+21,13,t,{pal:PALETTES.aurora,font:JP,glow:.4});}

// The 確変 (ST) plate in the top right: an aurora frame, stars twinkling inside, 確変中 in gold and the draws left, which pop when they go down.
export function drawStPlate(ctx,[px,py,pw,ph],st,t,{gentle=true,reduced=false}){const pal=PALETTES.rush,age=t-(st.at??-9);
  ctx.save();ctx.shadowColor=pal.glow;ctx.shadowBlur=(gentle?6:12)+(reduced?0:Math.sin(t*2.4)*(gentle?2:5));
  const g=ctx.createLinearGradient(px,py,px,py+ph);g.addColorStop(0,'#1a1060');g.addColorStop(1,'#080a2a');ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(px,py,pw,ph,9);ctx.fill();ctx.shadowBlur=0;
  const off=reduced?0:(t*.25)%1,rim=ctx.createLinearGradient(px,py,px+pw,py+ph);[['#7dffc8',0],['#b48cff',.33],['#ff9ad5',.66],['#7dffc8',1]].forEach(([c,p])=>rim.addColorStop((p+off)%1,c));
  ctx.strokeStyle=rim;ctx.lineWidth=2;ctx.stroke();ctx.strokeStyle='#ffe08a88';ctx.lineWidth=.8;ctx.beginPath();ctx.roundRect(px+3,py+3,pw-6,ph-6,7);ctx.stroke();
  ctx.save();ctx.clip();for(let i=0;i<9;i++){const tw=reduced?.6:.5+.5*Math.sin(t*(1.5+hash(i)*2)+i*2);ctx.globalAlpha=.25+.6*tw;ctx.fillStyle=i%3?'#ffffff':'#7dffc8';ctx.beginPath();ctx.arc(px+pw*hash(i+1),py+ph*hash(i+11),.6+1.1*hash(i+21),0,Math.PI*2);ctx.fill();}
    if(!reduced){const q=(t/2.6)%1,sx=px-pw*.4+q*pw*1.8,sw=ctx.createLinearGradient(sx-14,0,sx+14,0);sw.addColorStop(0,'#fff0');sw.addColorStop(.5,gentle?'#ffffff33':'#ffffff66');sw.addColorStop(1,'#fff0');ctx.globalAlpha=1;ctx.fillStyle=sw;ctx.fillRect(px,py,pw,ph);}ctx.restore();
  ctx.restore();
  goldText(ctx,'確変中',px+pw/2,py+ph*.32,ph*.36,t,{pal,font:JP,glow:gentle?.5:.9});
  ctx.save();ctx.textAlign='right';ctx.textBaseline='middle';ctx.font='bold 10px sans-serif';ctx.fillStyle='#e8fff6';ctx.fillText('ST 残り',px+pw*.47,py+ph*.74);ctx.restore();
  const pop=reduced?1:1+.5*Math.exp(-8*Math.max(0,age));ctx.save();ctx.translate(px+pw*.62,py+ph*.73);ctx.scale(pop,pop);goldText(ctx,String(st.left),0,0,ph*.36,t,{pal,glow:gentle?.5:.9});ctx.restore();
  ctx.save();ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='bold 10px sans-serif';ctx.fillStyle='#e8fff6';ctx.fillText('回',px+pw*.77,py+ph*.74);ctx.restore();}

// Extra light around the big title of an entry show (大当たり, 確変突入・確変昇格): wings opening behind it and a ring with a burst
// when the title lands. Drawn under drawShow's title.
export function drawTitleFx(ctx,s,t,[cx,cy],{rush=false,gentle=true,reduced=false}){if(reduced||!s||s.kind.endsWith('End'))return;const age=t-s.at,k=gentle?.6:1,tint=rush?'#b9ffe0':null;
  if(age<0||age>4.6)return;const fade=Math.min(1,(age-.3)/.4,(4.6-age)/.6);
  if(fade>0)drawFx(ctx,'fx-wings',cx,cy+4,340+50*Math.min(1,(age-.3)/.5),{op:'screen',alpha:(gentle?.75:1)*fade,tint});
  if(fade>0)drawFx(ctx,'fx-magic-circle',cx,cy,250,{rot:-age*(gentle?.3:.5),alpha:.35*k*fade,tint:rush?'#9fffd4':'#ffd0ea'});
  const land=age-.55;if(land>0&&land<.8){drawFx(ctx,'fx-shockwave',cx,cy,120+520*land,{tint:rush?'#7dffc8':'#ffd36a',alpha:.9*k*(1-land/.8)});drawFx(ctx,'fx-light-burst',cx,cy,200+260*land,{op:'screen',alpha:.7*k*(1-land/.8)});}}

// Win shows: what the machine does once 7-7-7 (BIG) or 7-7-BAR (REG) lines up on ASTRAL or the numbers line up on AURORA (jackpot),
// like the entry show of a real machine. The LCD gives one soft white flash, a gold sunburst turns behind the title,
// shock rings spread, fireworks burst and confetti falls while the title zooms in with a bounce and the winning symbols glow.
// Meanwhile the cabinet LEDs run the 'fanfare' scene (cabinet-leds.js) and a fanfare plays (music.js). During the bonus the LCD
// keeps a lighter party background, and the end of the bonus gets a short finale.
// Rules: a show starts only after the result is on screen, so it never hints at an outcome; nothing flashes more than 3 times
// a second (the one white flash fades out, the LEDs follow MAX_HZ); gentle mode softens and slows everything and
// prefers-reduced-motion shows the title still, with no flash, fireworks or confetti.

// len: seconds the show lasts; fanfare: seconds the BGM waits for the fanfare.
export const SHOWS={big:{len:5.5,fanfare:3.6},reg:{len:4.5,fanfare:3.6},jackpot:{len:5,fanfare:3.6},bigEnd:{len:3.2,fanfare:0},regEnd:{len:3.2,fanfare:0},jackpotEnd:{len:3.2,fanfare:0},kakuhen:{len:5,fanfare:3.6},kakuhenEnd:{len:3.6,fanfare:0}};
export const FLASH=.5;
export function startShow(kind,t,extra={}){return {...extra,kind,at:t};}
export function showOn(s,t){return !!s&&t>=s.at&&t-s.at<SHOWS[s.kind].len;}
export function fanfareOn(s,t){return showOn(s,t)&&t-s.at<SHOWS[s.kind].fanfare;}
// LED scene of the show, or null when the scene of the moment applies.
export function showScene(s,t){return !showOn(s,t)?null:s.kind.endsWith('End')?'finale':'fanfare';}
// The single white flash at the start of an entry show (the finale has none).
export function flashAlpha(s,t,{gentle=true,reduced=false}={}){const a=s?t-s.at:-1;if(reduced||!s||s.kind.endsWith('End')||a<0||a>=FLASH)return 0;return (gentle?.35:.8)*(1-a/FLASH)**2;}
// Title zoom: from 2.6× to 1× with a damped bounce.
export function titleScale(age,reduced=false){if(reduced)return 1;if(age<0)return 0;return 1+1.6*Math.exp(-7*age)*Math.cos(13*age);}
// Fade in quickly, hold, fade out over the last .6 s.
export function showAlpha(s,t){const a=t-s.at,len=SHOWS[s.kind].len;return Math.max(0,Math.min(1,a/.12,(len-a)/.6));}

export const PALETTES={
  astral:{sparks:['#ffe27a','#7fd8ff','#ffffff','#b9a4ff','#ff9ad5'],glow:'#5fb6ff',ink:'#0d1d45',night:['8,14,58','40,16,80'],ray:'255,222,130',gold:['#fffbe6','#ffe27a','#c88a1c','#ffd75e','#fff3c4']},
  aurora:{sparks:['#ffd36a','#ff7cc4','#ffffff','#ffb6dc','#9fe8ff'],glow:'#ff5fae',ink:'#3a0b2c',night:['44,8,48','70,14,40'],ray:'255,200,225',gold:['#fffbe6','#ffe08a','#d0841f','#ffcf6a','#fff0c8']},
  // 確変 (ST) on AURORA: the aurora night, green, violet and pink with gold.
  // The 確変突入・確変昇格 title: letters of aurora light (white, mint, violet, pink) instead of gold.
  prism:{sparks:['#7dffc8','#b48cff','#ffffff','#ff9ad5','#ffe27a'],glow:'#7a5cff',ink:'#120838',night:['8,12,46','34,10,62'],ray:'190,255,230',gold:['#ffffff','#b9ffe6','#8f6bff','#ff8fd0','#fff6c8']},
  rush:{sparks:['#7dffc8','#b48cff','#ffffff','#ff9ad5','#ffe27a'],glow:'#8a5cff',ink:'#140a3c',night:['8,12,46','34,10,62'],ray:'190,255,230',gold:['#fffbe6','#ffe08a','#d0841f','#ffcf6a','#fff0c8']},
};

// --- Browser side: drawing. Everything is a function of time, so nothing has to be stepped. ---
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function sunburst(ctx,cx,cy,R,rot,alpha,rgb,n=16){ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(cx,cy);ctx.rotate(rot);
  const g=ctx.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,`rgba(${rgb},${alpha})`);g.addColorStop(.25,`rgba(${rgb},${alpha*.7})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,da=Math.PI/n*.55;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a-da)*R,Math.sin(a-da)*R);ctx.lineTo(Math.cos(a+da)*R,Math.sin(a+da)*R);ctx.closePath();ctx.fill();}
  ctx.restore();}
function glowDot(ctx,x,y,r,color,alpha){ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r*3);g.addColorStop(0,'#ffffff');g.addColorStop(.25,color);g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(x-r*3,y-r*3,r*6,r*6);}
// Fireworks: burst k starts at k*every (from `from`) at a spot picked by k, its sparks fly out, slow down, fall and fade.
function fireworks(ctx,[x,y,w,h],time,{every,from=0,until=Infinity,sparks=22,size=1,colors,alpha=1}){
  ctx.save();ctx.globalCompositeOperation='lighter';const life=1.3;
  for(let k=Math.max(0,Math.floor((time-from-life)/every));k<=Math.floor((time-from)/every);k++){const start=from+k*every,p=time-start;if(p<0||p>=life||start>until)continue;
    const bx=x+w*(.12+.76*hash(k+.1)),by=y+h*(.14+.42*hash(k+.7)),col=colors[Math.floor(hash(k+.3)*colors.length)],col2=colors[Math.floor(hash(k+.9)*colors.length)],fade=(1-p/life)**1.4;
    if(p<.12)glowDot(ctx,bx,by,6*size*(1-p/.12)+2,'#ffffff',alpha);
    for(let i=0;i<sparks;i++){const ang=i/sparks*Math.PI*2+hash(k)*3,v=(70+40*hash(k*13+i))*size,d=v*(1-Math.exp(-3*p))/3,d0=v*(1-Math.exp(-3*Math.max(0,p-.09)))/3,fall=26*p*p*size,
      sx=bx+Math.cos(ang)*d,sy=by+Math.sin(ang)*d+fall,tx=bx+Math.cos(ang)*d0,ty=by+Math.sin(ang)*d0+26*Math.max(0,p-.09)**2*size,c=i%3?col:col2;
      ctx.globalAlpha=alpha*fade*.9;ctx.strokeStyle=c;ctx.lineWidth=2.4*size;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(sx,sy);ctx.stroke();
      glowDot(ctx,sx,sy,2.3*size,c,alpha*fade*(p>.8&&(i+k)%2?.5+.5*Math.sin(p*40):1));}}
  ctx.restore();}
// Confetti drifting down across the box (count pieces), tumbling as they fall.
function confetti(ctx,[x,y,w,h],time,{count,colors,alpha=1,speed=1}){ctx.save();
  for(let i=0;i<count;i++){const fall=(38+34*hash(i+.2))*speed,py=y-12+((time*fall+hash(i+.5)*(h+24))%(h+24)),px=x+((hash(i+.8)*w+Math.sin(time*1.7+i)*14)%w+w)%w,flip=Math.cos(time*(3+hash(i)*4)+i);
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(px,py);ctx.rotate(time*(1+hash(i+.4)*2)+i);ctx.scale(1,Math.max(.12,Math.abs(flip)));ctx.fillStyle=colors[i%colors.length];ctx.fillRect(-5,-3,10,6);
    if(flip>0){ctx.fillStyle='#ffffff66';ctx.fillRect(-5,-3,10,2);}ctx.restore();}
  ctx.restore();}
// Gold lettering with a dark outline, a coloured glow and a light band sweeping across it.
export function goldText(ctx,str,x,y,size,t,{pal,font='900 {s}px Georgia, serif',glow=1}){
  ctx.save();ctx.font=font.replace('{s}',Math.round(size));ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  const w=ctx.measureText(str).width,top=y-size*.5,G=pal.gold,fill=ctx.createLinearGradient(0,top,0,top+size);
  [[0,G[0]],[.38,G[1]],[.55,G[2]],[.78,G[3]],[1,G[4]]].forEach(([p,c])=>fill.addColorStop(p,c));
  ctx.shadowColor=pal.glow;ctx.shadowBlur=size*.45*glow;ctx.lineWidth=size*.2;ctx.strokeStyle=pal.ink;ctx.strokeText(str,x,y);
  ctx.shadowBlur=0;ctx.lineWidth=size*.07;ctx.strokeStyle='#fff8dc';ctx.strokeText(str,x,y);ctx.fillStyle=fill;ctx.fillText(str,x,y);
  const band=((t*.55)%1.6-.3)*w+x-w/2,sh=ctx.createLinearGradient(band-size*.6,0,band+size*.6,0);sh.addColorStop(0,'#fff0');sh.addColorStop(.5,'#ffffffd0');sh.addColorStop(1,'#fff0');
  ctx.fillStyle=sh;ctx.fillText(str,x,y);ctx.restore();return w;}

// The party background of the bonus (BIG / jackpot rounds), under the character and the numbers: the picture turns to a night
// sky in the machine's colours, with a slowly turning sunburst, a burst of fireworks every couple of seconds and confetti.
export function drawStage(ctx,box,t,{machine,gentle=true,reduced=false}){if(reduced)return;const pal=PALETTES[machine],[x,y,w,h]=box,k=gentle?.6:1;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const sky=ctx.createLinearGradient(0,y,0,y+h);sky.addColorStop(0,`rgba(${pal.night[0]},.55)`);sky.addColorStop(1,`rgba(${pal.night[1]},.4)`);ctx.fillStyle=sky;ctx.fillRect(x,y,w,h);
  sunburst(ctx,x+w/2,y+h*.62,Math.hypot(w,h)*.7,t*(gentle?.18:.3),.22*k,pal.ray,14);
  fireworks(ctx,box,t,{every:gentle?2.2:1.4,sparks:gentle?16:22,size:1,colors:pal.sparks,alpha:.85*k});
  confetti(ctx,box,t,{count:gentle?14:24,colors:pal.sparks,alpha:.8,speed:gentle?.7:1});
  ctx.restore();}

// 確変 (ST): the LCD turns to an aurora night over the usual picture: a navy tint, three curtains of aurora light (green, violet,
// pink) waving slowly across the top, twinkling stars and a soft rim. reduced keeps the curtains still; gentle makes them dimmer and slower.
// Until the generated aurora paintings (pa-chinko-stages, kk-*) arrive, this is drawn over the painted backgrounds.
export function drawAurora(ctx,box,t,{gentle=true,reduced=false}={}){const pal=PALETTES.rush,[x,y,w,h]=box,k=gentle?.85:1,tt=reduced?0:t*(gentle?.35:.6);
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  const sky=ctx.createLinearGradient(0,y,0,y+h);sky.addColorStop(0,`rgba(${pal.night[0]},.72)`);sky.addColorStop(.6,`rgba(${pal.night[1]},.48)`);sky.addColorStop(1,`rgba(${pal.night[1]},.3)`);ctx.fillStyle=sky;ctx.fillRect(x,y,w,h);
  ctx.globalCompositeOperation='screen';
  [['95,240,180',0,.85],['180,140,255',2.1,.6],['255,124,196',4.2,.38]].forEach(([rgb,ph,a])=>{const top=sx=>y+h*(.06+.07*Math.sin(sx*.011+tt+ph)+.03*Math.sin(sx*.031-tt*1.7)),len=sx=>h*(.26+.1*Math.sin(sx*.017-tt*1.2+ph));
    const g=ctx.createLinearGradient(0,y,0,y+h*.55);g.addColorStop(0,`rgba(${rgb},0)`);g.addColorStop(.25,`rgba(${rgb},${a*k})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;
    ctx.beginPath();for(let sx=x;sx<=x+w;sx+=8)ctx.lineTo(sx,top(sx));for(let sx=x+w;sx>=x;sx-=8)ctx.lineTo(sx,top(sx)+len(sx));ctx.closePath();ctx.fill();
    // Fine vertical rays inside the curtain, shimmering slowly.
    ctx.lineWidth=2;for(let sx=x+3,i=0;sx<x+w;sx+=6,i++){const r=hash(i+ph),flick=reduced?.6:.5+.5*Math.sin(t*(.6+r)+i);ctx.strokeStyle=`rgba(${rgb},${a*k*.45*r*flick})`;ctx.beginPath();ctx.moveTo(sx,top(sx)+2);ctx.lineTo(sx,top(sx)+len(sx)*.85);ctx.stroke();}});
  for(let i=0;i<26;i++){const tw=reduced?.7:.5+.5*Math.sin(t*(1+hash(i)*2)+i*3);glowDot(ctx,x+w*hash(i+.31),y+h*.55*hash(i+.77),.8+hash(i+.5)*.9,pal.sparks[i%pal.sparks.length],.6*tw*k);}
  ctx.globalAlpha=1;ctx.shadowColor=pal.glow;ctx.shadowBlur=gentle||reduced?6:14;ctx.lineWidth=2;ctx.strokeStyle='rgba(125,255,200,.55)';ctx.strokeRect(x+3,y+3,w-6,h-6);
  ctx.restore();}

// The show on the LCD. box: [x,y,w,h] of the LCD; at: [cx,cy] where the title sits; lines: [{text,size,dy,font}];
// symbols(ctx,age): draws extra pieces that pop in with the title (the three 7s on ASTRAL); delay: seconds before the title comes in.
export function drawShow(ctx,s,t,box,{machine,at,lines,symbols,under,delay=.08,gentle=true,reduced=false}){if(!showOn(s,t))return;
  const pal=PALETTES[machine],[x,y,w,h]=box,age=t-s.at,a=showAlpha(s,t),entry=!s.kind.endsWith('End'),k=gentle?.6:1,[cx,cy]=at;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  if(!reduced){
    // Dim the picture a little so the show stands out, then the sunburst and the rings.
    ctx.fillStyle=`rgba(4,6,20,${(entry?.42:.25)*a})`;ctx.fillRect(x,y,w,h);
    sunburst(ctx,cx,cy,Math.hypot(w,h)*.8,age*(gentle?.4:.75),(entry?.42:.3)*k*a,pal.ray,entry?18:12);
    if(entry){ctx.save();ctx.globalCompositeOperation='lighter';for(const r0 of [0,.22,.44]){const p=(age-r0)/.9;if(p<=0||p>=1)continue;ctx.globalAlpha=(1-p)*k;ctx.strokeStyle=pal.gold[1];ctx.lineWidth=7*(1-p)+1;ctx.beginPath();ctx.ellipse(cx,cy,12+p*w*.7,8+p*h*.75,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}
    fireworks(ctx,box,age,{every:entry?(gentle?.7:.42):.8,from:entry?.25:.1,until:SHOWS[s.kind].len-1.4,sparks:gentle?16:24,size:entry?1.35:1,colors:pal.sparks,alpha:k*a});
    confetti(ctx,box,age,{count:entry?(gentle?22:40):(gentle?14:24),colors:pal.sparks,alpha:a,speed:gentle?.8:1.15});
  }
  // under: extra light drawn between the background and the title (bonus-fx.js drawTitleFx).
  under?.(ctx,age);
  // Title and the extra pieces, zooming in together.
  const sc=titleScale(age-(entry?delay:0),reduced);if(sc>0){ctx.save();ctx.globalAlpha=a;ctx.translate(cx,cy);ctx.scale(sc,sc);ctx.translate(-cx,-cy);
    symbols?.(ctx,age);for(const l of lines)goldText(ctx,l.text,cx,cy+(l.dy??0),l.size,t,{pal:PALETTES[l.pal]??pal,font:l.font,glow:(gentle?.6:1)*(l.glow??1)});ctx.restore();}
  const f=flashAlpha(s,t,{gentle,reduced});if(f>0){ctx.fillStyle=`rgba(255,252,240,${f})`;ctx.fillRect(x,y,w,h);}
  ctx.restore();}

// Winning symbols glowing in their cells (the 7s on the pay line, the LCD numbers): a pulsing halo behind the light
// and a light sweep along the line at the start. cells: [[x,y,w,h]].
export function drawWinCells(ctx,s,t,cells,{machine,gentle=true,reduced=false}){if(!showOn(s,t)||s.kind.endsWith('End'))return;
  const pal=PALETTES[machine],age=t-s.at,a=showAlpha(s,t),pulse=reduced?.7:.55+.45*Math.sin(age*Math.PI*2*(gentle?.8:1.5)),k=gentle?.55:1;
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [x,y,w,h] of cells){const g=ctx.createRadialGradient(x+w/2,y+h/2,0,x+w/2,y+h/2,Math.max(w,h)*.7);g.addColorStop(0,`rgba(${pal.ray},${.55*pulse*k*a})`);g.addColorStop(1,`rgba(${pal.ray},0)`);ctx.fillStyle=g;ctx.fillRect(x-w*.2,y-h*.4,w*1.4,h*1.8);
    ctx.globalAlpha=a*(.4+.5*pulse)*k;ctx.strokeStyle=pal.gold[1];ctx.lineWidth=3;ctx.shadowColor=pal.glow;ctx.shadowBlur=10;ctx.strokeRect(x+2,y+2,w-4,h-4);ctx.shadowBlur=0;ctx.globalAlpha=1;}
  if(!reduced&&age<.9&&cells.length){const x0=cells[0][0],x1=cells.at(-1)[0]+cells.at(-1)[2],y0=Math.min(...cells.map(c=>c[1])),y1=Math.max(...cells.map(c=>c[1]+c[3])),sx=x0+(x1-x0+160)*(age/.9)-80,g=ctx.createLinearGradient(sx-70,0,sx+70,0);
    g.addColorStop(0,'#fff0');g.addColorStop(.5,`rgba(255,255,255,${.7*k})`);g.addColorStop(1,'#fff0');ctx.fillStyle=g;ctx.fillRect(x0,y0,x1-x0,y1-y0);}
  ctx.restore();}

// The BIG / REG BONUS panel on the LCD during the bonus: shimmering title, a gauge of the medals paid so far and the count.
export function drawBonusPanel(ctx,[x,y,w,h],t,{machine,title,count,progress,alpha=1,gentle=true}){const pal=PALETTES[machine];
  ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor=pal.glow;ctx.shadowBlur=gentle?6:14;ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fillStyle=pal.ink+'d8';ctx.fill();ctx.shadowBlur=0;
  const rim=ctx.createLinearGradient(x,y,x+w,y+h);[[0,pal.gold[0]],[.3,pal.gold[2]],[.5,pal.gold[1]],[.7,pal.gold[2]],[1,pal.gold[4]]].forEach(([p,c])=>rim.addColorStop(p,c));ctx.lineWidth=2.5;ctx.strokeStyle=rim;ctx.stroke();
  goldText(ctx,title,x+w/2,y+h*.32,h*.34,t,{pal,glow:gentle?.4:.8});
  const gx=x+12,gy=y+h*.6,gw=w-24,gh=7;ctx.beginPath();ctx.roundRect(gx,gy,gw,gh,3.5);ctx.fillStyle='#ffffff22';ctx.fill();
  const fw=Math.max(0,Math.min(1,progress))*gw;if(fw>0){ctx.beginPath();ctx.roundRect(gx,gy,fw,gh,3.5);const f=ctx.createLinearGradient(0,gy,0,gy+gh);f.addColorStop(0,pal.gold[0]);f.addColorStop(1,pal.gold[2]);ctx.fillStyle=f;ctx.fill();
    const gl=gx+((t*.8)%1.3-.15)*gw,s=ctx.createLinearGradient(gl-20,0,gl+20,0);s.addColorStop(0,'#fff0');s.addColorStop(.5,'#ffffffcc');s.addColorStop(1,'#fff0');ctx.save();ctx.clip();ctx.fillStyle=s;ctx.fillRect(gx,gy,fw,gh);ctx.restore();}
  ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.fillStyle='#eaf3ff';ctx.fillText(count,x+w/2,y+h-7);
  ctx.restore();}

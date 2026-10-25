// ASTRAL pachislot reel panel, drawn over the original cabinet art (assets/astral.webp, 720×960).
// The cabinet keeps its look; only the panel around the reel window is made to read like a real pachislot:
// three reels showing three symbols each, bet lamps 1/2/3 in the left medallions, START / REPLAY / PAY lamps in the right ones,
// and 7-segment CREDIT / PAYOUT counters on the plates under the window. The lever, MAX BET dome and stop buttons
// painted on the cabinet are tappable, and get a lit / pressed look here. All drawings are original.
import {REELS} from './engine.js';

// Coordinates follow the parts painted in astral.webp, so hit areas and highlights sit on the art.
export const LAYOUT={
  window:[177,348,370,151],
  reels:[[192,100],[312,100],[432,100]],reelY:349,reelH:149,pitch:46,radius:80,
  // [x, y, radius] of the round medallions painted beside the window.
  lamps:{left:[[130,381,19],[127,457,26],[123,518,20]],right:[[593,382,19],[595,458,26],[595,515,20]]},
  plates:{credit:[182,510,118,32],payout:[444,510,104,32]},
  lever:{x:160,y:600,r:23},
  bet:{x:587,y:549,r:24},
  stops:{x:[283,360,437],y:600,r:18},
};

// Returns 'lever' | 'bet' | 'stop0' | 'stop1' | 'stop2' | null for a point in canvas coordinates.
export function hitSlot(x,y){
  const {lever,bet,stops}=LAYOUT;
  if(Math.hypot(x-lever.x,y-lever.y)<lever.r+16)return 'lever';
  if(Math.hypot(x-bet.x,y-bet.y)<bet.r+14)return 'bet';
  for(let i=0;i<3;i++)if(Math.hypot(x-stops.x[i],y-stops.y)<stops.r+16)return `stop${i}`;
  return null;
}

// Cinzel / Cinzel Decorative (SIL Open Font License, assets/fonts/) match the engraved lettering of the cabinet art.
// The canvas is redrawn every frame, so text switches to them as soon as they load; until then a serif fallback is used.
export function loadSlotFonts(){
  if(typeof FontFace==='undefined'||typeof document==='undefined')return;
  for(const [family,file,weight] of [['Cinzel','cinzel-latin-700-normal.woff2','700'],['Cinzel','cinzel-latin-900-normal.woff2','900'],['Cinzel Decorative','cinzel-decorative-latin-900-normal.woff2','900']])
    new FontFace(family,`url(assets/fonts/${file})`,{weight}).load().then(f=>document.fonts.add(f)).catch(()=>{});
}
const SERIF='"Cinzel", Georgia, serif',DECO='"Cinzel Decorative", "Cinzel", Georgia, serif';

let ctx;
function rr(x,y,w,h,r,fill,stroke,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function grad(x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function radial(x,y,r0,r1,stops){const g=ctx.createRadialGradient(x,y,r0,x,y,r1);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
// font is '[style] [weight] family', e.g. 'italic 900 Georgia'; the size goes between them as the CSS font shorthand needs.
function text(t,x,y,size,color,font='Arial',align='center'){const parts=font.split(' '),family=parts.pop();ctx.textAlign=align;ctx.font=`${parts.join(' ')} ${size}px ${family}`;ctx.fillStyle=color;ctx.fillText(t,x,y);}
function circle(x,y,r,fill,stroke,lw=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function glow(color,blur,fn){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=blur;fn();ctx.restore();}
// Engraved gold lettering: dark outline, gold gradient fill and a thin highlight, glowing when lit.
function goldText(t,x,y,size,family,{lit=false,glowColor='#ffb300',gentle=false,weight=900,spacing=0}={}){
  ctx.save();ctx.font=`${weight} ${size}px ${family}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  if(spacing&&'letterSpacing' in ctx)ctx.letterSpacing=`${spacing}px`;
  ctx.lineWidth=Math.max(2,size*.2);ctx.strokeStyle='#170c02';ctx.strokeText(t,x,y+1);
  ctx.fillStyle=lit?grad(0,y-size/2,0,y+size/2,[[0,'#ffffff'],[.45,'#fff3c2'],[.55,'#ffd25a'],[1,'#fff0b0']]):grad(0,y-size/2,0,y+size/2,[[0,'#fff3c4'],[.4,'#e9b949'],[.55,'#9c6512'],[.8,'#e7b84c'],[1,'#ffeaa0']]);
  if(lit){ctx.shadowColor=glowColor;ctx.shadowBlur=gentle?6:16;}
  ctx.fillText(t,x,y);ctx.shadowBlur=0;
  ctx.lineWidth=Math.max(.6,size*.03);ctx.strokeStyle='#fff9e080';ctx.strokeText(t,x,y-.5);
  ctx.restore();
}
const chrome=(x,y,x2,y2)=>grad(x,y,x2,y2,[[0,'#f4f7fb'],[.18,'#9aa3ae'],[.35,'#eef2f6'],[.55,'#5d6672'],[.75,'#cfd6de'],[1,'#7b8591']]);

// --- 7-segment counters -------------------------------------------------------------------------------
const SEGMENTS=['abcdef','bc','abged','abgcd','fgbc','afgcd','afgedc','abc','abcdefg','abcdfg'];
function digit(ch,x,y,w,h,on,off){
  const t=Math.max(2.5,w*.16),segs=ch===' '?'':SEGMENTS[+ch]||'',half=h/2;
  const parts={a:[x+t*.6,y,w-t*1.2,t],g:[x+t*.6,y+half-t/2,w-t*1.2,t],d:[x+t*.6,y+h-t,w-t*1.2,t],f:[x,y+t*.6,t,half-t*.9],b:[x+w-t,y+t*.6,t,half-t*.9],e:[x,y+half+t*.3,t,half-t*.9],c:[x+w-t,y+half+t*.3,t,half-t*.9]};
  for(const [k,[sx,sy,sw,sh]] of Object.entries(parts)){rr(sx,sy,sw,sh,t/2,segs.includes(k)?on:off);}
}
// A 7-segment counter on one of the cabinet's plates: a small label on the left, digits right-aligned.
function counter(label,value,[x,y,w,h],count,gentle){
  const dh=h-10,dw=dh*.55,gap=4,s=String(Math.max(0,Math.min(10**count-1,Math.floor(value)))).padStart(count,' ');
  rr(x,y,w,h,4,'#080404','#c9a24e',1.5);
  ctx.save();ctx.translate(x+8,y+h/2);ctx.rotate(-Math.PI/2);goldText(label,0,0,7.5,SERIF,{weight:700});ctx.restore();
  ctx.save();ctx.transform(1,0,-.08,1,(y+h/2)*.08,0);
  glow('#ff5a3c',gentle?3:8,()=>{for(let i=0;i<count;i++)digit(s[i],x+w-6-(count-i)*(dw+gap)+gap,y+5,dw,dh,'#ff5a3c','#2a0c0a');});
  ctx.restore();
}

// --- reel symbols (original drawings) ------------------------------------------------------------------
// sy squashes the symbol vertically, for symbols turning away on the curved reel.
export function symbol(c,name,x,y,size=1,sy=1){
  ctx=c;ctx.save();ctx.translate(x,y);ctx.scale(size,size*sy);ctx.shadowColor='#0004';ctx.shadowOffsetY=2;ctx.shadowBlur=3;
  if(name==='seven'){ctx.font='italic 900 88px Georgia';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=10;ctx.strokeStyle='#5c0d10';ctx.strokeText('7',2,31);ctx.lineWidth=5;ctx.strokeStyle='#ffd774';ctx.strokeText('7',2,31);ctx.fillStyle=grad(0,-34,0,30,[[0,'#ff9a7a'],[.35,'#e8202a'],[.75,'#a50d18'],[1,'#e8402c']]);ctx.fillText('7',2,31);ctx.shadowColor='transparent';ctx.fillStyle='#ffffff66';ctx.beginPath();ctx.ellipse(-8,-24,16,4,-.2,0,7);ctx.fill();}
  else if(name==='bar'){rr(-46,-25,92,50,6,'#111','#d7d7d7',3);rr(-40,-17,80,34,3,grad(0,-17,0,17,[[0,'#fdfdfd'],[.5,'#d0d3d8'],[1,'#fdfdfd']]));ctx.shadowColor='transparent';text('BAR',0,11,30,'#141414','900 Arial');}
  else if(name==='cherry'){ctx.strokeStyle='#2f6b2a';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-18,4);ctx.quadraticCurveTo(-6,-22,14,-34);ctx.moveTo(18,10);ctx.quadraticCurveTo(14,-14,14,-34);ctx.stroke();ctx.fillStyle='#3f9a35';ctx.beginPath();ctx.ellipse(24,-34,13,6,-.5,0,7);ctx.fill();
    circle(-19,14,19,grad(-30,0,-6,32,[[0,'#ff8a72'],[.4,'#e01b2c'],[1,'#7a0a1c']]),'#5a0612',2);circle(18,20,19,grad(6,4,32,38,[[0,'#ff7d6a'],[.45,'#d81428'],[1,'#700818']]),'#5a0612',2);ctx.shadowColor='transparent';circle(-25,7,5,'#ffffffaa');circle(12,13,5,'#ffffffaa');}
  else if(name==='bell'){ctx.fillStyle=grad(-32,-30,32,24,[[0,'#a96a00'],[.3,'#fff2a8'],[.55,'#f4c21c'],[1,'#9a5b00']]);ctx.beginPath();ctx.moveTo(-34,22);ctx.quadraticCurveTo(-20,14,-21,-8);ctx.quadraticCurveTo(-18,-36,0,-37);ctx.quadraticCurveTo(18,-36,21,-8);ctx.quadraticCurveTo(20,14,34,22);ctx.closePath();ctx.fill();ctx.strokeStyle='#7a4500';ctx.lineWidth=2;ctx.stroke();rr(-36,18,72,10,5,grad(0,18,0,28,[[0,'#ffe07a'],[1,'#b77a10']]),'#7a4500',2);circle(0,32,7,'#c58a17','#7a4500',2);ctx.shadowColor='transparent';ctx.fillStyle='#ffffffaa';ctx.beginPath();ctx.ellipse(-9,-14,4,13,.25,0,7);ctx.fill();}
  else if(name==='watermelon'){ctx.fillStyle=grad(-40,-30,40,30,[[0,'#7ccf55'],[.5,'#2f8f2a'],[1,'#13561a']]);ctx.beginPath();ctx.ellipse(0,0,42,32,0,0,7);ctx.fill();ctx.strokeStyle='#0e3d12';ctx.lineWidth=5;for(const dx of [-24,-8,8,24]){ctx.beginPath();ctx.moveTo(dx*.7,-31);ctx.bezierCurveTo(dx+6,-12,dx-6,12,dx*.7,31);ctx.stroke();}ctx.lineWidth=2;ctx.strokeStyle='#0b3510';ctx.beginPath();ctx.ellipse(0,0,42,32,0,0,7);ctx.stroke();ctx.shadowColor='transparent';ctx.fillStyle='#ffffff55';ctx.beginPath();ctx.ellipse(-16,-16,12,5,-.4,0,7);ctx.fill();}
  else{circle(0,0,32,grad(-30,-30,30,30,[[0,'#8fd8ff'],[.5,'#1f7fd6'],[1,'#0b3d86']]),'#e9f6ff',4);ctx.shadowColor='transparent';ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-3,15,Math.PI*.95,Math.PI*2.55);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-23,-6);ctx.lineTo(-9,-8);ctx.lineTo(-16,4);ctx.fill();text('REPLAY',0,24,10,'#fff','900 Arial');}
  ctx.restore();
}

// --- panel parts -------------------------------------------------------------------------------------
// Reels are drawn as lit cylinders: symbols move along the curve, flatten toward the top and bottom edges and fall into shadow,
// the way real reel strips look behind the glass. Dark housings with metal rims separate the three reels.
function reels(v){
  const [wx,wy,ww,wh]=LAYOUT.window,{reelY,reelH,pitch,radius:R}=LAYOUT,mid=reelY+reelH/2;
  ctx.fillStyle=grad(wx,0,wx+ww,0,[[0,'#020306'],[.5,'#0b0f18'],[1,'#020306']]);ctx.fillRect(wx,wy,ww,wh);
  LAYOUT.reels.forEach(([x,w],i)=>{
    // Housing ribs either side of the reel.
    for(const [rx,dir] of [[x-6,-1],[x+w+1,1]]){ctx.fillStyle=grad(rx,0,rx+5,0,dir<0?[[0,'#0b0f18'],[.6,'#5d6880'],[1,'#c9d2e2']]:[[0,'#c9d2e2'],[.4,'#5d6880'],[1,'#0b0f18']]);ctx.fillRect(rx,reelY-1,5,reelH+2);}
    ctx.save();ctx.beginPath();ctx.rect(x,reelY,w,reelH);ctx.clip();
    // Backlit reel paper: brightest at the middle row.
    ctx.fillStyle=grad(0,reelY,0,reelY+reelH,[[0,'#6e6a60'],[.3,'#e9e4d6'],[.5,'#fffdf5'],[.7,'#e9e4d6'],[1,'#6e6a60']]);ctx.fillRect(x,reelY,w,reelH);
    const strip=REELS[i],pos=v.positions[i],base=Math.floor(pos),fraction=pos-base,blur=Math.abs(v.velocities[i])>15&&!v.gentle;
    if(blur)ctx.filter='blur(1.2px)';
    for(let j=-3;j<=3;j++){const t=((j-fraction)*pitch)/R;if(Math.abs(t)>1.45)continue;const idx=((base+j)%strip.length+strip.length)%strip.length,y=mid-R*Math.sin(t),sy=Math.cos(t);
      symbol(ctx,strip[idx],x+w/2,y,.62,sy);
      // Thin print line between symbols on the strip.
      const tl=t+pitch/2/R;if(Math.abs(tl)<1.5){ctx.fillStyle='#0000001a';ctx.fillRect(x,mid-R*Math.sin(tl)-.5,w,1);}}
    ctx.filter='none';
    // Curvature shading, then darker side edges where the strip meets the rims.
    ctx.fillStyle=grad(0,reelY,0,reelY+reelH,[[0,'#000000e6'],[.12,'#00000080'],[.28,'#00000022'],[.42,'#ffffff10'],[.5,'#ffffff00'],[.72,'#00000022'],[.88,'#00000080'],[1,'#000000e6']]);ctx.fillRect(x,reelY,w,reelH);
    ctx.fillStyle=grad(x,0,x+w,0,[[0,'#0000006e'],[.1,'#00000018'],[.25,'#0000'],[.75,'#0000'],[.9,'#00000018'],[1,'#0000006e']]);ctx.fillRect(x,reelY,w,reelH);
    ctx.restore();
  });
  // Pay line lamps: lit red arrows at both ends of the center row while medals are bet.
  const lit=v.bet>0;
  for(const [x,dir] of [[wx+2,1],[wx+ww-2,-1]]){ctx.save();if(lit){ctx.shadowColor='#ff2a3a';ctx.shadowBlur=v.gentle?4:10;}ctx.fillStyle=lit?'#ff4050':'#5a1a20';ctx.beginPath();ctx.moveTo(x,mid-7);ctx.lineTo(x+dir*9,mid);ctx.lineTo(x,mid+7);ctx.closePath();ctx.fill();ctx.restore();}
  if(lit){ctx.strokeStyle='#ff304055';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(wx+12,mid);ctx.lineTo(wx+ww-12,mid);ctx.stroke();}
  // Glass: inner shadow under the frame lip and a soft diagonal reflection.
  ctx.save();ctx.beginPath();ctx.rect(wx,wy,ww,wh);ctx.clip();
  ctx.fillStyle=grad(0,wy,0,wy+14,[[0,'#000c'],[1,'#0000']]);ctx.fillRect(wx,wy,ww,14);ctx.fillStyle=grad(0,wy+wh-10,0,wy+wh,[[0,'#0000'],[1,'#000a']]);ctx.fillRect(wx,wy+wh-10,ww,10);
  ctx.fillStyle=grad(wx,wy,wx+ww*.7,wy+wh,[[0,'#ffffff1e'],[.28,'#ffffff05'],[.29,'#ffffff12'],[.4,'#ffffff00'],[1,'#ffffff00']]);ctx.fillRect(wx,wy,ww,wh);
  ctx.restore();
}

// Lamps light up the round medallions of the cabinet art; their numbers and labels are always shown.
function lamp([x,y,r],label,size,on,color,gentle){
  if(on){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=radial(x,y,1,r*1.7,[[0,color+'ff'],[.5,color+'aa'],[1,color+'00']]);ctx.beginPath();ctx.arc(x,y,r*1.7,0,7);ctx.fill();ctx.restore();}
  else{ctx.fillStyle=radial(x,y,0,r,[[0,'#020818a0'],[1,'#02081830']]);ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
  goldText(label,x,y+(label.length>1?0:size*.04),size,label.length>1?SERIF:DECO,{lit:on,glowColor:color,gentle});
}
function lamps(v){
  const {left,right}=LAYOUT.lamps;
  left.forEach((m,k)=>lamp(m,String(3-k),m[2]*1.35,v.bet>=3-k,'#ffa000',v.gentle));
  [['START',v.canLever,'#3ee07a'],['REPLAY',v.replay,'#47b4ff'],['PAY',v.showResult&&v.win>0,'#ffa000']].forEach(([label,on,color],i)=>lamp(right[i],label,label.length>5?8.5:10,on,color,v.gentle));
}

// Lit / pressed looks on the controls painted on the cabinet.
function controls(v){
  const img=v.cabinet,{lever,bet,stops}=LAYOUT;
  // Lever knob: pulling it sinks the knob and pushes it down, by redrawing that patch of the art lower.
  if(img&&v.leverPull>0){const d=v.leverPull*9,s=lever.r+6;circle(lever.x,lever.y,lever.r+2,'#05070c');ctx.save();ctx.beginPath();ctx.arc(lever.x,lever.y+d,lever.r+1,0,7);ctx.clip();ctx.drawImage(img,lever.x-s,lever.y-s,s*2,s*2,lever.x-s,lever.y-s+d,s*2,s*2);ctx.restore();}
  if(v.canLever&&!v.leverPull)glow('#7fc0ff',v.gentle?4:12,()=>circle(lever.x,lever.y,lever.r+3,null,'#9fd2ff99',2));
  // MAX BET dome on the right of the deck.
  const pb=v.pressed('bet');
  if(v.canBet)glow('#ffb43a',v.gentle?6:16,()=>circle(bet.x,bet.y,bet.r,null,'#ffd27acc',2.5));
  if(pb)circle(bet.x,bet.y+2,bet.r-2,'#0008');
  goldText('MAX BET',bet.x,bet.y+bet.r+8,10,SERIF,{lit:v.canBet,glowColor:'#ffb43a',gentle:v.gentle});
  // Stop buttons: glow while that reel can be stopped; darken and sink while pressed.
  stops.x.forEach((x,i)=>{const ready=v.stopReady[i],p=v.pressed(`stop${i}`),y=stops.y;
    ctx.save();if(ready){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,4,x,y,30);g.addColorStop(0,v.gentle?'#5fa8ff55':'#7fc0ffaa');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,30,0,7);ctx.fill();}else circle(x,y,stops.r,'#05081499');ctx.restore();
    if(p){circle(x,y,stops.r+1,'#000a');circle(x,y+2,stops.r-4,'#1d4f9a88');}});
}

// v: state snapshot from app.js. Draws over the cabinet art, which app.js has already drawn.
export function drawSlot(c,v){
  ctx=c;reels(v);lamps(v);
  counter('CREDIT',v.credit,LAYOUT.plates.credit,4,v.gentle);counter('PAYOUT',v.win,LAYOUT.plates.payout,3,v.gentle);
  controls(v);
}

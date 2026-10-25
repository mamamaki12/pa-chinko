// ASTRAL pachislot reel panel, drawn over the original cabinet art (assets/astral.webp, 720×960).
// The cabinet keeps its look; only the panel around the reel window is made to read like a real pachislot:
// three reels showing three symbols each, bet lamps 1/2/3 in the left medallions, START / REPLAY / PAY lamps in the right ones,
// and 7-segment CREDIT / PAYOUT counters on the plates under the window. The lever, MAX BET dome and stop buttons
// painted on the cabinet are tappable, and get a lit / pressed look here. All drawings are original.
import {REELS} from './engine.js';

// Coordinates follow the parts painted in astral.webp, so hit areas and highlights sit on the art.
export const LAYOUT={
  window:[177,348,370,151],
  reels:[[183,114],[305,114],[427,114]],reelY:350,reelH:147,pitch:49,
  lamps:{left:[[133,373],[133,457],[133,517]],right:[[593,373],[593,460],[593,516]],r:21},
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

let ctx;
function rr(x,y,w,h,r,fill,stroke,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function grad(x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function radial(x,y,r0,r1,stops){const g=ctx.createRadialGradient(x,y,r0,x,y,r1);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
// font is '[style] [weight] family', e.g. 'italic 900 Georgia'; the size goes between them as the CSS font shorthand needs.
function text(t,x,y,size,color,font='Arial',align='center'){const parts=font.split(' '),family=parts.pop();ctx.textAlign=align;ctx.font=`${parts.join(' ')} ${size}px ${family}`;ctx.fillStyle=color;ctx.fillText(t,x,y);}
function circle(x,y,r,fill,stroke,lw=1){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function glow(color,blur,fn){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=blur;fn();ctx.restore();}
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
  ctx.save();ctx.translate(x+7,y+h/2);ctx.rotate(-Math.PI/2);text(label,0,3,7,'#d8c38a','bold Arial');ctx.restore();
  ctx.save();ctx.transform(1,0,-.08,1,(y+h/2)*.08,0);
  glow('#ff5a3c',gentle?3:8,()=>{for(let i=0;i<count;i++)digit(s[i],x+w-6-(count-i)*(dw+gap)+gap,y+5,dw,dh,'#ff5a3c','#2a0c0a');});
  ctx.restore();
}

// --- reel symbols (original drawings) ------------------------------------------------------------------
export function symbol(c,name,x,y,size=1){
  ctx=c;ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.shadowColor='#0004';ctx.shadowOffsetY=2;ctx.shadowBlur=3;
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
function reels(v){
  const [wx,wy,ww,wh]=LAYOUT.window,mid=LAYOUT.reelY+LAYOUT.reelH/2;
  rr(wx,wy,ww,wh,3,'#05070c');
  LAYOUT.reels.forEach(([x,w],i)=>{
    ctx.save();ctx.beginPath();ctx.rect(x,LAYOUT.reelY,w,LAYOUT.reelH);ctx.clip();
    ctx.fillStyle=grad(x,0,x+w,0,[[0,'#d9d4c4'],[.5,'#fbf8ee'],[1,'#d9d4c4']]);ctx.fillRect(x,LAYOUT.reelY,w,LAYOUT.reelH);
    const strip=REELS[i],pos=v.positions[i],base=Math.floor(pos),fraction=pos-base;
    if(Math.abs(v.velocities[i])>15&&!v.gentle)ctx.filter='blur(1px)';
    for(let j=-2;j<=2;j++){const idx=((base+j)%strip.length+strip.length)%strip.length,y=mid-(j-fraction)*LAYOUT.pitch;symbol(ctx,strip[idx],x+w/2,y,.56);ctx.fillStyle='#00000012';ctx.fillRect(x,y+LAYOUT.pitch/2-1,w,1.5);}
    ctx.filter='none';
    // Cylinder shading: dark at the top and bottom, a soft highlight just above the center row.
    ctx.fillStyle=grad(0,LAYOUT.reelY,0,LAYOUT.reelY+LAYOUT.reelH,[[0,'#000000d0'],[.15,'#00000050'],[.3,'#00000010'],[.42,'#ffffff18'],[.5,'#ffffff00'],[.7,'#00000010'],[.85,'#00000050'],[1,'#000000d0']]);ctx.fillRect(x,LAYOUT.reelY,w,LAYOUT.reelH);
    ctx.fillStyle=grad(x,0,x+w,0,[[0,'#0006'],[.12,'#0000'],[.88,'#0000'],[1,'#0006']]);ctx.fillRect(x,LAYOUT.reelY,w,LAYOUT.reelH);
    ctx.restore();
  });
  // Pay line: the center row only, marked by red arrows at both edges of the window.
  ctx.strokeStyle='#ff304070';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(wx+2,mid);ctx.lineTo(wx+ww-2,mid);ctx.stroke();
  for(const x of [wx+1,wx+ww-1]){ctx.fillStyle='#ff3040';ctx.beginPath();ctx.moveTo(x,mid-6);ctx.lineTo(x+(x<wx+9?7:-7),mid);ctx.lineTo(x,mid+6);ctx.fill();}
  // Glass: a diagonal reflection and a thin inner shadow along the frame.
  ctx.save();ctx.beginPath();ctx.rect(wx,wy,ww,wh);ctx.clip();ctx.fillStyle=grad(wx,wy,wx+ww*.8,wy+wh,[[0,'#ffffff22'],[.3,'#ffffff06'],[.31,'#ffffff16'],[.42,'#ffffff00'],[1,'#ffffff00']]);ctx.fillRect(wx,wy,ww,wh);ctx.strokeStyle='#0009';ctx.lineWidth=6;ctx.strokeRect(wx,wy,ww,wh);ctx.restore();
}

// Lamps sit in the round medallions of the cabinet art: lit amber (bet) or colored (status), otherwise left as painted.
function lamp(x,y,label,on,color,gentle,size=15){
  const r=LAYOUT.lamps.r;
  circle(x,y,r,on?radial(x,y-4,2,r+2,[[0,'#fffbe6'],[.4,color],[1,color+'55']]):'#0a143070');
  if(on)glow(color,gentle?6:18,()=>circle(x,y,r,null,'#fff8',2));
  ctx.save();if(!on)ctx.globalAlpha=.75;text(label,x,y+size*.36,size,on?'#3a1600':'#9fb4dc',label.length>1?'900 Arial':'italic 900 Georgia');ctx.restore();
}
function lamps(v){
  const {left,right}=LAYOUT.lamps;
  left.forEach(([x,y],k)=>lamp(x,y,String(3-k),v.bet>=3-k,'#ffb300',v.gentle,24));
  [['START',v.canLever,'#3ee07a'],['REPLAY',v.replay,'#47b4ff'],['PAY',v.showResult&&v.win>0,'#ffb300']].forEach(([label,on,color],i)=>lamp(right[i][0],right[i][1],label,on,color,v.gentle,label.length>5?8:10));
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
  ctx.save();ctx.font='900 9px Arial';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#0b1430';ctx.strokeText('MAX BET',bet.x,bet.y+bet.r+11);ctx.fillStyle=v.canBet?'#ffe2a0':'#b7c4de';ctx.fillText('MAX BET',bet.x,bet.y+bet.r+11);ctx.restore();
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

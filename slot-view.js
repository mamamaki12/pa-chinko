// ASTRAL pachislot reel panel, drawn over the original cabinet art (assets/astral.webp, 720×960).
// The cabinet keeps its look; only the panel around the reel window is made to read like a real pachislot:
// three reels showing three symbols each, bet lamps 1/2/3 in the left medallions, START / REPLAY / PAY lamps in the right ones,
// and 7-segment CREDIT / PAYOUT counters on the plates under the window. The lever, MAX BET dome and stop buttons
// painted on the cabinet are tappable, and get a lit / pressed look here. All drawings are original.
import {REELS} from './engine.js';

// Coordinates follow the parts painted in astral.webp, so hit areas and highlights sit on the art.
export const LAYOUT={
  window:[177,348,370,151],
  reels:[[188,108],[308,108],[428,108]],reelY:349,reelH:149,pitch:46,radius:80,
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
// Printed like the symbols on a real reel strip: bold shapes with a dark outline and a white keyline around them,
// big enough to fill most of the cell (a cell is reel width × LAYOUT.pitch). sy squashes the symbol vertically.
function keyed(draw,outline,lw){ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#ffffff';ctx.lineWidth=lw+5;draw('stroke');ctx.strokeStyle=outline;ctx.lineWidth=lw;draw('stroke');draw('fill');}
export function symbol(c,name,x,y,size=1,sy=1){
  ctx=c;ctx.save();ctx.translate(x,y);ctx.scale(size,size*sy);
  if(name==='seven'){
    // A bold, slanted 7 drawn as a shape (not a font), so it looks the same on every device.
    ctx.transform(1,0,-.2,1,0,0);const seven=new Path2D('M-19-22L21-22L21-14C13-4 7 8 5 22L-9 22C-7 8 0-4 7-12L-11-12L-13-6L-19-6Z');
    ctx.lineJoin='round';for(const [col,lw] of [['#ffffff',11],['#3a0508',7],['#ffd25e',3.4]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.stroke(seven);}
    ctx.fillStyle=grad(0,-22,0,22,[[0,'#ff9a7c'],[.3,'#f0222e'],[.65,'#b10a19'],[1,'#e8402c']]);ctx.fill(seven);
    ctx.save();ctx.clip(seven);ctx.fillStyle='#ffffff4a';ctx.fillRect(-20,-22,42,6);ctx.restore();
  }else if(name==='bar'){
    keyed(m=>{ctx.beginPath();ctx.roundRect(-36,-15,72,30,5);ctx[m]();},'#0a0a0c',3);
    ctx.fillStyle=grad(0,-15,0,15,[[0,'#2a2c33'],[.5,'#0b0c10'],[1,'#22242a']]);ctx.beginPath();ctx.roundRect(-36,-15,72,30,5);ctx.fill();
    ctx.strokeStyle='#f2f2f2';ctx.lineWidth=1.6;ctx.beginPath();ctx.roundRect(-32,-11.5,64,23,3);ctx.stroke();
    ctx.font='900 21px "Arial Black", Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';if('letterSpacing' in ctx)ctx.letterSpacing='2px';
    ctx.fillStyle=grad(0,-9,0,9,[[0,'#ffffff'],[.5,'#e4e6ea'],[1,'#b9bec6']]);ctx.fillText('BAR',1,1.5);
  }else if(name==='cherry'){
    ctx.lineCap='round';ctx.strokeStyle='#ffffff';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-13,0);ctx.quadraticCurveTo(-4,-14,8,-19);ctx.moveTo(12,2);ctx.quadraticCurveTo(10,-10,8,-19);ctx.stroke();
    ctx.strokeStyle='#1f3d14';ctx.lineWidth=4.4;ctx.stroke();ctx.strokeStyle='#5aa83a';ctx.lineWidth=2.2;ctx.stroke();
    keyed(m=>{ctx.beginPath();ctx.ellipse(18,-18,11,5,-.45,0,7);ctx[m]();},'#1f3d14',2);ctx.fillStyle=grad(8,-22,28,-14,[[0,'#8fd85a'],[1,'#2f7d24']]);ctx.beginPath();ctx.ellipse(18,-18,11,5,-.45,0,7);ctx.fill();
    for(const [cx,cy] of [[-14,8],[13,10]]){keyed(m=>{ctx.beginPath();ctx.arc(cx,cy,12,0,7);ctx[m]();},'#4a0410',2.4);
      ctx.fillStyle=radial(cx-4,cy-5,1,15,[[0,'#ff9a86'],[.35,'#ee1c30'],[1,'#7a0616']]);ctx.beginPath();ctx.arc(cx,cy,12,0,7);ctx.fill();ellipse(cx-4.5,cy-4.5,3.6,2.4,'#ffffffcc',null,1,-.6);}
  }else if(name==='bell'){
    const bell=m=>{ctx.beginPath();ctx.moveTo(-25,15);ctx.quadraticCurveTo(-15,10,-15,-4);ctx.quadraticCurveTo(-14,-21,0,-21);ctx.quadraticCurveTo(14,-21,15,-4);ctx.quadraticCurveTo(15,10,25,15);ctx.quadraticCurveTo(0,21,-25,15);ctx.closePath();ctx[m]();};
    keyed(m=>{bell(m);ctx.beginPath();ctx.arc(0,-22,4,0,7);ctx[m]();},'#5a3300',2.6);
    ctx.fillStyle=grad(-24,0,24,0,[[0,'#a86400'],[.28,'#fff3a6'],[.5,'#f8c81e'],[.8,'#c98a00'],[1,'#7a4500']]);bell('fill');
    ctx.fillStyle='#f0b818';ctx.beginPath();ctx.arc(0,-22,4,0,7);ctx.fill();
    ctx.fillStyle=grad(0,12,0,20,[[0,'#ffe27a'],[1,'#a86a00']]);ctx.beginPath();ctx.ellipse(0,16,24,3.6,0,0,7);ctx.fill();
    ellipse(0,20,5,3.4,'#8a5200','#5a3300',1.4);ellipse(-7,-8,3,9,'#ffffffaa',null,1,.25);
  }else if(name==='watermelon'){
    const ball=m=>{ctx.beginPath();ctx.ellipse(0,0,30,19,0,0,7);ctx[m]();};
    keyed(ball,'#0b3510',2.6);ctx.fillStyle=radial(-10,-8,2,34,[[0,'#9be06a'],[.5,'#3c9a2e'],[1,'#145a18']]);ball('fill');
    ctx.save();ball('clip');ctx.strokeStyle='#0d3f12';ctx.lineWidth=4.2;for(const dx of [-20,-7,7,20]){ctx.beginPath();ctx.moveTo(dx*.75,-20);ctx.bezierCurveTo(dx+5,-7,dx-5,7,dx*.75,20);ctx.stroke();}ctx.restore();
    ctx.strokeStyle='#5a8a1c';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-19);ctx.quadraticCurveTo(3,-24,7,-24);ctx.stroke();ellipse(-11,-9,8,3.2,'#ffffff66',null,1,-.35);
  }else{
    // Replay: blue lettering with a looping arrow, like the replay symbol of most real machines.
    ctx.font='italic 900 14px "Arial Black", Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineJoin='round';ctx.strokeStyle='#ffffff';ctx.lineWidth=6.5;ctx.strokeText('REPLAY',8,2);ctx.strokeStyle='#0b2368';ctx.lineWidth=3.2;ctx.strokeText('REPLAY',8,2);
    ctx.fillStyle=grad(0,-7,0,9,[[0,'#8fd2ff'],[.45,'#2a7df0'],[1,'#123fae']]);ctx.fillText('REPLAY',8,2);
    ctx.lineCap='round';for(const [col,lw] of [['#ffffff',7.5],['#0b2368',4.6],['#3a8df5',2.2]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.arc(-36,1,7,Math.PI*.15,Math.PI*1.65);ctx.stroke();}
    ctx.fillStyle='#0b2368';ctx.beginPath();ctx.moveTo(-31.5,-10);ctx.lineTo(-25,-4.5);ctx.lineTo(-33.5,-1.5);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

// --- reels ---------------------------------------------------------------------------------------------
// Each reel strip is painted once into an offscreen canvas (plus a motion-blurred copy for spinning), then wrapped onto
// a cylinder slice by slice every frame, so symbols bend away at the top and bottom of the window like a real drum.
const SPX=3,SLICES=48;let strips=null;
function buildStrips(){
  if(typeof document==='undefined')return null;
  const {pitch}=LAYOUT,N=REELS[0].length,margin=pitch*2,out=[];
  LAYOUT.reels.forEach(([,w],i)=>{
    const sharp=document.createElement('canvas');sharp.width=Math.ceil(w*SPX);sharp.height=Math.ceil((N*pitch+margin*2)*SPX);
    const g=sharp.getContext('2d'),keep=ctx;ctx=g;g.scale(SPX,SPX);
    // Reel paper: warm white with a faint pale-blue print toward the edges and tiny stars, as on a themed strip.
    g.fillStyle=grad(0,0,w,0,[[0,'#dfe8f6'],[.18,'#fbfaf4'],[.82,'#fbfaf4'],[1,'#dfe8f6']]);g.fillRect(0,0,w,N*pitch+margin*2);
    for(let s=0;s<(N*pitch+margin*2)/9;s++){const sx=(s*37.3)%w,sy=s*9+(s*13%7);if(sx>16&&sx<w-16)continue;star(sx,sy,1.6,'#9db6e566');}
    for(let idx=0;idx<N;idx++)for(const wrap of [-1,0,1]){const cy=margin+(N-idx+wrap*N)*pitch;if(cy<-pitch||cy>N*pitch+margin*2+pitch)continue;symbol(g,REELS[i][idx],w/2,cy,.9);}
    ctx=keep;
    const blur=document.createElement('canvas');blur.width=sharp.width;blur.height=sharp.height;const b=blur.getContext('2d'),K=12,len=pitch*.6*SPX;
    for(let k=0;k<K;k++){b.globalAlpha=1/(k+1);b.drawImage(sharp,0,(k/(K-1)-.5)*len);}
    out.push({sharp,blur,w,N,margin});
  });
  return out;
}
function star(x,y,r,fill,points=5,inner=.45){ctx.beginPath();for(let i=0;i<points*2;i++){const a=-Math.PI/2+i*Math.PI/points,rr=i%2?r*inner:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
function ellipse(x,y,rx,ry,fill,stroke,lw=1,rot=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}

function reels(v){
  const [wx,wy,ww,wh]=LAYOUT.window,{reelY,reelH,pitch,radius:R}=LAYOUT,mid=reelY+reelH/2;
  strips??=buildStrips();
  // The black mask of the reel window, with a bevel where it meets each reel opening.
  ctx.fillStyle=grad(0,wy,0,wy+wh,[[0,'#05070c'],[.5,'#10141e'],[1,'#05070c']]);ctx.fillRect(wx,wy,ww,wh);
  LAYOUT.reels.forEach(([x,w],i)=>{
    ctx.save();ctx.beginPath();ctx.rect(x,reelY,w,reelH);ctx.clip();
    const st=strips?.[i],pos=v.positions[i],fast=Math.abs(v.velocities[i])>6;
    if(st){const img=fast?st.blur:st.sharp,{N,margin}=st;
      for(let k=0;k<SLICES;k++){const y0=reelY+k*reelH/SLICES,y1=y0+reelH/SLICES,u0=Math.min(.999,(mid-y0)/R),u1=Math.max(-.999,(mid-y1)/R);
        const a0=pos+Math.asin(u0)*R/pitch,a1=pos+Math.asin(u1)*R/pitch,base=((a0%N)+N)%N,s0=margin+(N-base)*pitch,s1=s0+(a0-a1)*pitch;
        ctx.drawImage(img,0,s0*SPX,st.w*SPX,(s1-s0)*SPX,x,y0,w,y1-y0+.6);}}
    else{ctx.fillStyle='#fbfaf4';ctx.fillRect(x,reelY,w,reelH);}
    // Lighting fixed to the window: lamps behind the strip light each of the three rows, the drum curves into shadow
    // at the top and bottom, and the strip edges sit in the shade of the drum flanges.
    ctx.save();ctx.globalCompositeOperation='multiply';
    ctx.fillStyle=grad(0,reelY,0,reelY+reelH,[[0,'#3a3a46'],[.1,'#8a8a96'],[.24,'#d8d8de'],[.4,'#ffffff'],[.6,'#ffffff'],[.76,'#d8d8de'],[.9,'#8a8a96'],[1,'#3a3a46']]);ctx.fillRect(x,reelY,w,reelH);
    ctx.fillStyle=grad(x,0,x+w,0,[[0,'#9a9aa6'],[.07,'#e6e6ec'],[.2,'#ffffff'],[.8,'#ffffff'],[.93,'#e6e6ec'],[1,'#9a9aa6']]);ctx.fillRect(x,reelY,w,reelH);
    ctx.restore();
    ctx.save();ctx.globalCompositeOperation='lighter';for(const r of [-1,0,1]){ctx.save();ctx.translate(x+w/2,mid+r*pitch);ctx.scale(1,.45);ctx.fillStyle=radial(0,0,2,w*.6,[[0,r?'#fff4dc1c':'#fff4dc2c'],[1,'#fff4dc00']]);ctx.fillRect(-w/2,-w*.6,w,w*1.2);ctx.restore();}ctx.restore();
    ctx.restore();
    // Drum flanges: thin dark rims either side of the strip.
    for(const fx of [x-1.5,x+w+.5]){ctx.fillStyle=grad(0,reelY,0,reelY+reelH,[[0,'#000'],[.5,'#3c4252'],[1,'#000']]);ctx.fillRect(fx,reelY,1.5,reelH);}
  });
  // Bevel of the mask around each opening: dark on top (shadow cast onto the reels), a lit edge underneath.
  LAYOUT.reels.forEach(([x,w])=>{ctx.fillStyle=grad(0,reelY,0,reelY+10,[[0,'#000000d0'],[1,'#00000000']]);ctx.fillRect(x,reelY,w,10);
    ctx.fillStyle=grad(0,reelY+reelH-6,0,reelY+reelH,[[0,'#00000000'],[1,'#000000a0']]);ctx.fillRect(x,reelY+reelH-6,w,6);
    ctx.strokeStyle='#6b7690';ctx.lineWidth=1;ctx.strokeRect(x-2.5,reelY-.5,w+5,reelH+1);ctx.strokeStyle='#00000099';ctx.strokeRect(x-3.5,reelY-1.5,w+7,reelH+3);});
  // Pay line lamps: small red arrows at both ends of the centre row, lit while medals are bet.
  const lit=v.bet>0;
  for(const [x,dir] of [[wx+2,1],[wx+ww-2,-1]]){ctx.save();if(lit){ctx.shadowColor='#ff2a3a';ctx.shadowBlur=v.gentle?4:10;}ctx.fillStyle=lit?'#ff4050':'#4a1218';ctx.beginPath();ctx.moveTo(x,mid-6);ctx.lineTo(x+dir*7,mid);ctx.lineTo(x,mid+6);ctx.closePath();ctx.fill();ctx.restore();}
  // Glass over the whole window: a soft diagonal reflection and a faint highlight along the top edge.
  ctx.save();ctx.beginPath();ctx.rect(wx,wy,ww,wh);ctx.clip();
  ctx.fillStyle=grad(wx,wy,wx+ww*.75,wy+wh,[[0,'#ffffff20'],[.26,'#ffffff06'],[.27,'#ffffff14'],[.36,'#ffffff02'],[.37,'#ffffff00'],[1,'#ffffff00']]);ctx.fillRect(wx,wy,ww,wh);
  ctx.fillStyle=grad(0,wy,0,wy+3,[[0,'#ffffff30'],[1,'#ffffff00']]);ctx.fillRect(wx,wy,ww,3);
  ctx.restore();
}

// Lamps are domed lenses set into the round medallions of the cabinet art, like the LED lamps of a real panel:
// smoky and dim with a faint printed label when off, glowing in their colour with a white label when lit.
function lamp([x,y,r],label,size,on,color,gentle){
  const lr=r*.8;
  if(on){ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=radial(x,y,lr*.5,r*1.9,[[0,color+'cc'],[.45,color+'55'],[1,color+'00']]);ctx.beginPath();ctx.arc(x,y,r*1.9,0,7);ctx.fill();ctx.restore();}
  circle(x,y,lr+1.5,'#0a0d16');
  circle(x,y,lr,on?radial(x,y-lr*.2,1,lr,[[0,'#ffffff'],[.35,color],[1,shade(color)]]):radial(x,y-lr*.3,1,lr,[[0,'#2c3550'],[.7,'#121827'],[1,'#06080f']]));
  ctx.save();ctx.beginPath();ctx.arc(x,y,lr,0,7);ctx.clip();ellipse(x-lr*.15,y-lr*.55,lr*.75,lr*.38,on?'#ffffff70':'#ffffff22');ctx.restore();
  ctx.save();ctx.font=`900 ${size}px ${label.length>1?'"Arial Black", Arial, sans-serif':DECO}`;ctx.textAlign='center';ctx.textBaseline='middle';
  if(on){ctx.lineJoin='round';ctx.lineWidth=Math.max(2,size*.18);ctx.strokeStyle=shade(color);ctx.strokeText(label,x,y+1);ctx.fillStyle='#ffffff';}else ctx.fillStyle='#c8d2ea55';
  ctx.fillText(label,x,y+1);ctx.restore();
}
const shade=c=>'#'+[1,3,5].map(i=>Math.round(parseInt(c.slice(i,i+2),16)*.45).toString(16).padStart(2,'0')).join('');
function lamps(v){
  const {left,right}=LAYOUT.lamps;
  left.forEach((m,k)=>lamp(m,String(3-k),m[2]*1.05,v.bet>=3-k,'#ffa000',v.gentle));
  [['START',v.canLever,'#3ee07a'],['REPLAY',v.replay,'#47b4ff'],['WAIT',v.wait,'#ff5a4a']].forEach(([label,on,color],i)=>lamp(right[i],label,label.length>5?6:7,on,color,v.gentle));
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

// ASTRAL pachislot reel panel, drawn over the original cabinet art (assets/astral.webp, 720×960).
// The cabinet keeps its look; only the panel around the reel window is made to read like a real pachislot:
// three reels showing three symbols each, bet lamps 1/2/3 in the left medallions, START / REPLAY / PAY lamps in the right ones,
// and 7-segment CREDIT / PAYOUT counters on the plates under the window. The lever, MAX BET dome and stop buttons
// painted on the cabinet are tappable, and get a lit / pressed look here. All drawings are original.
import {REELS,LINES} from './engine.js';

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

// Centre of the cell in row (0 top, 1 middle, 2 bottom) of a reel, where the drum's curve puts it on screen.
export function cellCenter(reel,row){const [x,w]=LAYOUT.reels[reel],{reelY,reelH,pitch,radius:R}=LAYOUT;return [x+w/2,reelY+reelH/2+R*Math.sin((row-1)*pitch/R)];}

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
// dressed in the ASTRAL motifs (gold bevels, navy, four-point twinkles), big enough to fill most of the cell (a cell is reel width × LAYOUT.pitch). sy squashes the symbol vertically.
function keyed(draw,outline,lw){ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#ffffff';ctx.lineWidth=lw+5;draw('stroke');ctx.strokeStyle=outline;ctx.lineWidth=lw;draw('stroke');draw('fill');}
// Four-point twinkle, the star motif of the ASTRAL art.
function twinkle(x,y,r,color='#f2b730'){ctx.save();ctx.translate(x,y);ctx.fillStyle=radial(0,0,0,r*1.3,[[0,color+'88'],[1,color+'00']]);ctx.fillRect(-r*1.3,-r*1.3,r*2.6,r*2.6);
  const ray=k=>{ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,rr=i%2?r*.22*k:r*k;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}ctx.closePath();ctx.fill();};
  ctx.fillStyle=color;ray(1);ctx.fillStyle='#ffffff';ray(.55);ctx.restore();}
const GOLD=(y0,y1)=>grad(0,y0,0,y1,[[0,'#fff6c8'],[.3,'#f2c552'],[.55,'#a8701a'],[.8,'#f6d36c'],[1,'#fff0b0']]);
// The BIG 7 is wide like the 7s of real machines, filling the reel; the ASTRAL heroine is printed inside it.
const P7=typeof Path2D==='undefined'?null:new Path2D('M-40-22L42-22L42-8L10 22L-17 22L14-6L-26-6L-29-1L-40-1Z');
let symArt=null;
// Illustrated symbols: assets/slot-symbol-sprites.webp (made by scripts/make-slot-symbols.py from the generated assets/slot-symbols.png),
// 3×2 cells of 400×176 in this order, each drawn into the 100×44 reel cell. The drawn symbols below are the fallback while it loads.
export const SYMBOL_SHEET={path:'assets/slot-symbol-sprites.webp',w:400,h:176,order:['seven','bar','cherry','bell','watermelon','replay']};
let symbolSheet=null;
export function loadSlotSymbols(){if(symbolSheet||typeof Image==='undefined')return;const img=new Image();img.decoding='async';img.onload=()=>{symbolSheet=img;};img.src=SYMBOL_SHEET.path;}
export function symbol(c,name,x,y,size=1,sy=1){
  ctx=c;ctx.save();ctx.translate(x,y);ctx.scale(size,size*sy);
  const cell=SYMBOL_SHEET.order.indexOf(name);
  if(symbolSheet&&cell>=0){const {w,h}=SYMBOL_SHEET;ctx.drawImage(symbolSheet,(cell%3)*w,Math.floor(cell/3)*h,w,h,-50,-22,100,44);ctx.restore();return;}
  if(name==='seven'){
    ctx.save();ctx.transform(1,0,-.22,1,0,0);const seven=P7;
    ctx.lineJoin='round';for(const [col,lw] of [['#ffffff',12],['#14123a',8.5],[GOLD(-25,25),5],['#5a0610',1.2]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.stroke(seven);}
    ctx.save();ctx.clip(seven);
    ctx.fillStyle=grad(0,-21,0,21,[[0,'#ff9a7c'],[.25,'#f52a34'],[.6,'#b80a1c'],[1,'#ff4a36']]);ctx.fillRect(-46,-22,92,44);
    // The heroine's face from the cabinet art, tinted red so the 7 still reads as a red 7.
    if(symArt){ctx.drawImage(symArt,48,128,116,76,-44,-26,96,62);
      ctx.globalCompositeOperation='color';ctx.fillStyle='#ff3030';ctx.fillRect(-46,-22,92,44);
      ctx.globalCompositeOperation='multiply';ctx.fillStyle=grad(0,-22,0,22,[[0,'#ffd0c0'],[.6,'#ff8070'],[1,'#ffa080']]);ctx.fillRect(-46,-22,92,44);ctx.globalCompositeOperation='source-over';}
    ctx.fillStyle=grad(0,-21,0,-12,[[0,'#ffffffaa'],[1,'#ffffff00']]);ctx.fillRect(-46,-21,92,9);
    ctx.fillStyle='#ffffff30';ctx.beginPath();ctx.moveTo(-12,22);ctx.lineTo(18,-6);ctx.lineTo(21,-6);ctx.lineTo(-9,22);ctx.fill();
    ctx.restore();ctx.restore();
    twinkle(38,-20,7);twinkle(-34,14,4.5,'#5fa0ff');
  }else if(name==='bar'){
    // A black pill with red-gold lettering, like the BAR of real machines, framed in gold.
    const plate=m=>{ctx.beginPath();ctx.roundRect(-42,-15,84,30,15);ctx[m]();};
    keyed(plate,'#05050a',3);ctx.fillStyle=grad(0,-15,0,15,[[0,'#3a3a46'],[.45,'#08080c'],[1,'#22222a']]);plate('fill');
    ctx.strokeStyle=GOLD(-12,12);ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-38.5,-11.5,77,23,11.5);ctx.stroke();
    ctx.fillStyle='#ffffff26';ctx.beginPath();ctx.ellipse(0,-7,34,4,0,0,7);ctx.fill();
    ctx.font='900 20px "Arial Black", "Arial Bold", Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';if('letterSpacing' in ctx)ctx.letterSpacing='2px';
    ctx.lineJoin='round';ctx.strokeStyle='#ffffff';ctx.lineWidth=4.4;ctx.strokeText('BAR',1,1.5);ctx.strokeStyle='#4a0008';ctx.lineWidth=2;ctx.strokeText('BAR',1,1.5);
    ctx.fillStyle=grad(0,-9,0,10,[[0,'#ffd27a'],[.35,'#ff3a3a'],[.75,'#b8001a'],[1,'#ff6a4a']]);ctx.fillText('BAR',1,1.5);
  }else if(name==='cherry'){
    // Two glossy cherries on curved stems, with a veined leaf and a small twinkle.
    ctx.lineCap='round';for(const [col,lw] of [['#ffffff',8.5],['#1f3d14',5],['#6bb243',2.4]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(-14,0);ctx.bezierCurveTo(-10,-10,-2,-17,8,-20);ctx.moveTo(12,2);ctx.bezierCurveTo(13,-8,11,-14,8,-20);ctx.stroke();}
    const leaf=m=>{ctx.beginPath();ctx.moveTo(8,-20);ctx.bezierCurveTo(14,-30,28,-28,32,-20);ctx.bezierCurveTo(24,-14,14,-14,8,-20);ctx[m]();};
    keyed(leaf,'#1f3d14',2);ctx.fillStyle=grad(8,-28,32,-14,[[0,'#a6e86a'],[.5,'#4fa232'],[1,'#22661c']]);leaf('fill');
    ctx.strokeStyle='#1f5a18aa';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(10,-20);ctx.quadraticCurveTo(20,-23,30,-20);for(const lx of [15,20,25]){ctx.moveTo(lx,-21.4);ctx.lineTo(lx+3,-25);}ctx.stroke();
    for(const [cx,cy] of [[-15,8],[13,10]]){keyed(m=>{ctx.beginPath();ctx.arc(cx,cy,12.5,0,7);ctx[m]();},'#4a0410',2.4);
      ctx.fillStyle=radial(cx-4,cy-5,1,16,[[0,'#ffb0a0'],[.25,'#ff3040'],[.7,'#b00a20'],[1,'#5a0412']]);ctx.beginPath();ctx.arc(cx,cy,12.5,0,7);ctx.fill();
      ctx.strokeStyle='#ff9a8a88';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(cx,cy,10,Math.PI*.1,Math.PI*.55);ctx.stroke();
      ellipse(cx-4.5,cy-5,4,2.6,'#ffffffdd',null,1,-.6);ellipse(cx-1,cy-8.5,1.2,1,'#ffffffcc');}
    twinkle(-25,-10,5);
  }else if(name==='bell'){
    ctx.scale(1.22,1);
    // A golden bell with an engraved band of dots, an embossed star, a ring on top and a clapper.
    const bell=m=>{ctx.beginPath();ctx.moveTo(-26,15);ctx.quadraticCurveTo(-16,10,-16,-4);ctx.quadraticCurveTo(-15,-21,0,-21);ctx.quadraticCurveTo(15,-21,16,-4);ctx.quadraticCurveTo(16,10,26,15);ctx.quadraticCurveTo(0,21,-26,15);ctx.closePath();ctx[m]();};
    keyed(m=>{bell(m);ctx.beginPath();ctx.arc(0,-23,4.4,0,7);ctx[m]();},'#5a3300',2.6);
    ctx.strokeStyle='#8a5a10';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,-23,3.6,0,7);ctx.stroke();ctx.fillStyle='#fff3c0';ctx.beginPath();ctx.arc(0,-23,2,0,7);ctx.fill();
    ctx.fillStyle=grad(-25,0,25,0,[[0,'#9a5a00'],[.22,'#ffe680'],[.36,'#fffbe0'],[.5,'#f6c41c'],[.78,'#c08000'],[1,'#6a3c00']]);bell('fill');
    ctx.save();bell('clip');
    ctx.fillStyle=grad(0,4,0,10,[[0,'#8a5200'],[.5,'#ffd84a'],[1,'#8a5200']]);ctx.fillRect(-30,4,60,6);
    for(let i=-4;i<=4;i++)ellipse(i*4.2,7,1,1,'#fff6c8');
    ctx.globalAlpha=.55;star(0,-7,7.5,'#fff6c8');ctx.globalAlpha=.6;star(.6,-6.4,6,'#b87800');ctx.globalAlpha=1;star(0,-7,5.6,grad(0,-13,0,-1,[[0,'#fffbe0'],[1,'#f2c030']]));
    ellipse(-8,-9,2.6,9,'#ffffffaa',null,1,.25);ctx.restore();
    ctx.fillStyle=grad(0,12,0,20,[[0,'#fff0a0'],[.5,'#e0a020'],[1,'#8a5200']]);ctx.beginPath();ctx.ellipse(0,16,25,3.8,0,0,7);ctx.fill();ctx.strokeStyle='#5a3300';ctx.lineWidth=1.2;ctx.stroke();
    ellipse(0,20.5,5,3.4,radial(-1.5,19.5,.5,5,[[0,'#ffe27a'],[1,'#8a5200']]),'#5a3300',1.4);
    twinkle(20,-14,4.5);
  }else if(name==='watermelon'){
    // A watermelon slice: striped green rind, a pale band, red flesh with seeds, and a glossy cut edge.
    const cy=-13,R=[40,30],half=(rx,ry)=>m=>{ctx.beginPath();ctx.ellipse(0,cy,rx,ry,0,0,Math.PI);ctx.closePath();ctx[m]();};
    keyed(half(...R),'#0b3510',2.6);ctx.fillStyle=grad(0,cy,0,cy+30,[[0,'#3c9a2e'],[1,'#145a18']]);half(...R)('fill');
    ctx.save();half(...R)('clip');ctx.strokeStyle='#0d3f12';ctx.lineWidth=4;for(let a=.25;a<3;a+=.42){ctx.beginPath();ctx.moveTo(Math.cos(a)*30,cy+Math.sin(a)*20);ctx.lineTo(Math.cos(a)*44,cy+Math.sin(a)*34);ctx.stroke();}ctx.restore();
    ctx.fillStyle=grad(0,cy,0,cy+25,[[0,'#f6ffe6'],[1,'#c9f0a8']]);half(35,25)('fill');
    ctx.fillStyle=radial(0,cy,2,34,[[0,'#ff6a80'],[.6,'#f0283e'],[1,'#c0102a']]);half(31,21)('fill');
    for(const [sx,syy,r] of [[-18,6,.5],[-8,10,.2],[2,12,0],[12,9,-.2],[21,5,-.5],[-12,3,.3],[7,4,-.1]]){ctx.save();ctx.translate(sx,cy+syy);ctx.rotate(r);ctx.fillStyle='#1a0a0a';ctx.beginPath();ctx.ellipse(0,0,1.7,2.8,0,0,7);ctx.fill();ellipse(-.5,-1,.6,.9,'#ffffff88');ctx.restore();}
    ctx.strokeStyle='#ffffffaa';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-30,cy+1.2);ctx.lineTo(30,cy+1.2);ctx.stroke();
    twinkle(-28,cy-3,4.5);
  }else{
    // Replay: an oval sky-blue gem in a silver rim with a white looping arrow, like the replay medallions of real machines.
    const gem=m=>{ctx.beginPath();ctx.ellipse(0,0,30,17,0,0,7);ctx[m]();};
    keyed(gem,'#0b2368',2.4);ctx.fillStyle=grad(0,-17,0,17,[[0,'#f4f8ff'],[.5,'#9aa8c0'],[1,'#eef2fa']]);gem('fill');
    ctx.fillStyle=radial(-6,-6,2,30,[[0,'#d6f0ff'],[.35,'#5fb0ff'],[.8,'#1e5ad8'],[1,'#0f2f8a']]);ctx.beginPath();ctx.ellipse(0,0,26.5,13.8,0,0,7);ctx.fill();
    ctx.save();ctx.beginPath();ctx.ellipse(0,0,26.5,13.8,0,0,7);ctx.clip();ctx.fillStyle='#ffffff40';ctx.beginPath();ctx.ellipse(-4,-9,24,7,-.1,0,7);ctx.fill();
    ctx.strokeStyle='#ffffff30';ctx.lineWidth=1;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*8,-14);ctx.lineTo(i*8+4,14);ctx.stroke();}ctx.restore();
    // A big white looping arrow in the middle of the gem.
    ctx.lineCap='round';for(const [col,lw] of [['#0b2368',6.4],['#ffffff',3.6]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();ctx.arc(0,1,8,Math.PI*.15,Math.PI*1.7);ctx.stroke();}
    ctx.fillStyle='#ffffff';ctx.strokeStyle='#0b2368';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(4.4,-10.6);ctx.lineTo(11.4,-4.6);ctx.lineTo(2.6,-2.4);ctx.closePath();ctx.stroke();ctx.fill();
    twinkle(24,-12,4,'#ffffff');
  }
  ctx.restore();
}

// --- reels ---------------------------------------------------------------------------------------------
// Each reel strip is painted once into an offscreen canvas (plus a motion-blurred copy for spinning), then wrapped onto
// a cylinder slice by slice every frame, so symbols bend away at the top and bottom of the window like a real drum.
const SPX=3,SLICES=48;let strips=null;
function buildStrips(art){
  if(typeof document==='undefined')return null;symArt=art||null;
  const {pitch}=LAYOUT,N=REELS[0].length,margin=pitch*2,out=[];
  LAYOUT.reels.forEach(([,w],i)=>{
    const sharp=document.createElement('canvas');sharp.width=Math.ceil(w*SPX);sharp.height=Math.ceil((N*pitch+margin*2)*SPX);
    const g=sharp.getContext('2d'),keep=ctx;ctx=g;g.scale(SPX,SPX);
    // Reel paper: warm white with a faint pale-blue print toward the edges and tiny stars, as on a themed strip.
    // Sky-blue reel paper (like the coloured strips of real machines) with soft clouds and small stars of the ASTRAL sky.
    const H=N*pitch+margin*2;g.fillStyle=grad(0,0,w,0,[[0,'#7fb2ea'],[.2,'#c6e2ff'],[.5,'#e9f5ff'],[.8,'#c6e2ff'],[1,'#7fb2ea']]);g.fillRect(0,0,w,H);
    for(let s=0;s<H/22;s++){const cx=(s*53.7)%w,cy=s*22+(s*7%11);g.fillStyle=radial(cx,cy,1,22,[[0,'#ffffffaa'],[1,'#ffffff00']]);g.beginPath();g.ellipse(cx,cy,26,9,0,0,7);g.fill();}
    for(let s=0;s<H/8;s++){const sx=(s*37.3)%w,sy=s*8+(s*13%7);star(sx,sy,1.3+(s%3)*.5,s%4?'#ffffffcc':'#ffe9a0');}
    for(let idx=0;idx<N;idx++)for(const wrap of [-1,0,1]){const cy=margin+(N-idx+wrap*N)*pitch;if(cy<-pitch||cy>N*pitch+margin*2+pitch)continue;symbol(g,REELS[i][idx],w/2,cy,1);}
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
  // Built once, and again when the cabinet art (used inside the drawn 7) or the symbol sheet has loaded.
  if(!strips||(!strips.art&&v.cabinet)||strips.sheet!==symbolSheet){strips=buildStrips(v.cabinet);if(strips){strips.art=!!v.cabinet;strips.sheet=symbolSheet;}}
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
  // Pay line lamps: small red arrows at both ends of the 5 lines (the 3 rows, and the 2 diagonals from the corners), lit while medals are bet.
  // After a game the lines that won (v.lines, indexes into LINES) light up across the reels: the cells glow and a gold line joins them.
  const lit=v.bet>0,won=v.showResult?v.lines??[]:[],pulse=v.gentle?1:.65+.35*Math.cos((v.resultLeft??0)*Math.PI*3);
  LINES.forEach((line,k)=>{const win=won.includes(k),a=cellCenter(0,line[0]),b=cellCenter(2,line[2]),ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    const ends=line[0]===line[2]?[[wx+2,a[1],ang],[wx+ww-2,b[1],ang+Math.PI]]:[[wx+3,line[0]?wy+wh-4:wy+4,ang],[wx+ww-3,line[2]?wy+wh-4:wy+4,ang+Math.PI]];
    for(const [x,y,t] of ends){ctx.save();ctx.translate(x,y);ctx.rotate(t);if(lit||win){ctx.shadowColor=win?'#ffd36a':'#ff2a3a';ctx.shadowBlur=v.gentle?4:10;}ctx.fillStyle=win?'#fff1b8':lit?'#ff4050':'#4a1218';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(7,0);ctx.lineTo(0,5);ctx.closePath();ctx.fill();ctx.restore();}});
  if(won.length){ctx.save();ctx.beginPath();ctx.rect(wx,wy,ww,wh);ctx.clip();ctx.globalCompositeOperation='lighter';
    for(const k of won){const pts=LINES[k].map((row,i)=>cellCenter(i,row));
      for(const [x,y] of pts){const g=ctx.createRadialGradient(x,y,4,x,y,46);g.addColorStop(0,`rgba(255,226,140,${.42*pulse})`);g.addColorStop(1,'rgba(255,226,140,0)');ctx.fillStyle=g;ctx.fillRect(x-54,y-30,108,60);}
      const [x0,y0]=pts[0],[x2,y2]=pts[2],dx=(x2-x0)/2,dy=(y2-y0)/2,ext=(wx+8-x0)/dx;
      ctx.lineCap='round';for(const [lw,col] of [[9,`rgba(255,190,60,${.35*pulse})`],[3,`rgba(255,248,214,${.9*pulse})`]]){ctx.lineWidth=lw;ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(x0+dx*ext,y0+dy*ext);for(const [x,y] of pts)ctx.lineTo(x,y);ctx.lineTo(x2-dx*ext,y2-dy*ext);ctx.stroke();}}
    ctx.restore();}
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
  // v.lit(id): lamp states kept by the machine parts (cabinet-parts.js); without it they follow the game state passed in.
  const lit=(id,fallback)=>v.lit?v.lit(id):fallback;
  left.forEach((m,k)=>lamp(m,String(3-k),m[2]*1.05,lit(`bet${3-k}`,v.bet>=3-k),'#ffa000',v.gentle));
  [['START',v.canLever,'#3ee07a'],['REPLAY',v.replay,'#47b4ff'],['WAIT',v.wait,'#ff5a4a']].forEach(([label,on,color],i)=>lamp(right[i],label,label.length>5?6:7,lit(label.toLowerCase(),on),color,v.gentle));
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

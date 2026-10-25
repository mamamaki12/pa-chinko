// ASTRAL pachislot cabinet, drawn entirely on canvas (720×960) after the layout of a real pachislot front:
// top panel with a small LCD, a chrome-framed glass window with three tall reels, bet lamps 1/2/3 on the left,
// 7-segment CREDIT / GAME / PAYOUT counters, and a deck with the lever, MAX BET button and three stop buttons.
// All artwork is original; no real machine's logo, character or reel art is reproduced.
import {REELS} from './engine.js';

const W=720;
// Hit areas share these coordinates, so the drawn parts and the tappable parts never drift apart.
export const LAYOUT={
  lcd:[150,104,420,150],
  frame:[60,272,600,432],
  window:[150,292,446,300],
  reels:[[158,140],[306,140],[454,140]],reelY:298,reelH:288,pitch:96,
  lamps:{x:104,y:[352,442,532]},
  side:{x:624,y:[340,410,480,550]},
  counters:{y:612},
  lever:{x:84,y:812,r:24},
  bet:[124,734,100,30],
  stops:{x:[228,376,524],y:808,r:30},
};

// Returns 'lever' | 'bet' | 'stop0' | 'stop1' | 'stop2' | null for a point in canvas coordinates.
export function hitSlot(x,y){
  const {lever,bet,stops}=LAYOUT;
  if(Math.hypot(x-lever.x,y-(lever.y-6))<54&&y<lever.y+60)return 'lever';
  if(x>bet[0]-10&&x<bet[0]+bet[2]+10&&y>bet[1]-10&&y<bet[1]+bet[3]+10)return 'bet';
  for(let i=0;i<3;i++)if(Math.hypot(x-stops.x[i],y-stops.y)<stops.r+14)return `stop${i}`;
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
function counter(label,value,x,y,count,{color='#ff5a3c',gentle}){
  const dw=22,dh=38,gap=8,w=count*(dw+gap)+14,s=String(Math.max(0,Math.min(10**count-1,Math.floor(value)))).padStart(count,' ');
  rr(x-w/2-3,y-3,w+6,dh+20,7,chrome(0,y-3,0,y+dh+17));
  rr(x-w/2,y,w,dh+14,5,'#0a0605');
  ctx.save();ctx.transform(1,0,-.08,1,(y+dh/2)*.08,0);
  glow(color,gentle?3:9,()=>{for(let i=0;i<count;i++)digit(s[i],x-w/2+9+i*(dw+gap),y+7,dw,dh,color,'#2a0c0a');});
  ctx.restore();
  text(label,x,y+dh+29,10,'#c8d4ee','bold Arial');
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

// --- cabinet parts ------------------------------------------------------------------------------------
function body(gentle,clock){
  // Cabinet shell: dark midnight-blue body with chrome side pillars and soft blue LED strips.
  rr(14,8,692,944,34,grad(0,0,W,0,[[0,'#0d1730'],[.5,'#18264a'],[1,'#0d1730']]));
  rr(14,8,692,944,34,null,'#9eb3d6',2);
  for(const x of [22,662]){rr(x,30,36,900,16,chrome(x,0,x+36,0));const pulse=gentle?.55:.55+.25*Math.sin(clock*1.4+x);glow('#4fb3ff',gentle?6:16,()=>rr(x+13,54,10,852,5,`rgba(120,200,255,${pulse})`));}
  // Top crown with the ASTRAL logo (original lettering).
  ctx.fillStyle=grad(0,14,0,98,[[0,'#24396e'],[1,'#0b1430']]);ctx.beginPath();ctx.moveTo(70,98);ctx.lineTo(110,22);ctx.quadraticCurveTo(360,-6,610,22);ctx.lineTo(650,98);ctx.closePath();ctx.fill();ctx.strokeStyle='#c7d6f0';ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<9;i++){const x=150+i*52.5,lit=gentle?.5:.5+.5*Math.max(0,Math.sin(clock*2-i*.7));glow('#9fd8ff',8,()=>circle(x,36+Math.abs(i-4)*-1.5,3.2,`rgba(220,240,255,${.35+lit*.6})`));}
  ctx.save();ctx.font='italic 900 56px Georgia';ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='#0a1126';ctx.strokeText('ASTRAL',360,86);ctx.lineWidth=3;ctx.strokeStyle='#e7f1ff';ctx.strokeText('ASTRAL',360,86);ctx.fillStyle=grad(0,44,0,86,[[0,'#ffffff'],[.45,'#9fd0ff'],[.55,'#2f6fd8'],[1,'#b5e0ff']]);glow('#6fbaff',gentle?4:14,()=>ctx.fillText('ASTRAL',360,86));ctx.restore();
  star(198,66,9,'#ffe9a8');star(522,66,9,'#ffe9a8');
}
function star(x,y,r,color){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rad=i%2?r*.42:r;ctx.lineTo(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}ctx.closePath();ctx.fillStyle=color;ctx.fill();}

function lcdPanel(v){
  const [x,y,w,h]=LAYOUT.lcd;
  rr(x-12,y-10,w+24,h+20,14,chrome(0,y-10,0,y+h+10));rr(x-4,y-3,w+8,h+6,8,'#050812');
  ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,6);ctx.clip();ctx.fillStyle='#0b1022';ctx.fillRect(x,y,w,h);
  const img=v.lcdImage;if(img){const still=v.gentle,zoom=1.08+(still?0:.05*Math.sin(v.clock*.11)),s=Math.max(w/img.width,h/img.height)*zoom,dw=img.width*s,dh=img.height*s,pan=still?0:Math.sin(v.clock*.07)*.08;ctx.drawImage(img,x+(w-dw)*Math.min(1,Math.max(0,.5+pan)),y+(h-dh)*.3,dw,dh);}
  ctx.fillStyle=grad(0,y,0,y+h,[[0,'#0000'],[.6,'#0000'],[1,'#050a18aa']]);ctx.fillRect(x,y,w,h);
  if(v.win>0&&v.showResult){ctx.fillStyle='#050a18aa';ctx.fillRect(x,y+h/2-34,w,62);glow('#5fb6ff',v.gentle?4:16,()=>{ctx.lineWidth=5;ctx.strokeStyle='#0d1d45';ctx.font='bold 40px Georgia';ctx.textAlign='center';ctx.strokeText(`${v.win} MEDALS`,x+w/2,y+h/2+12);text(`${v.win} MEDALS`,x+w/2,y+h/2+12,40,'#eef6ff','bold Georgia');});}
  else if(v.replay){text('REPLAY',x+w/2,y+h-16,18,'#d8ecff','bold Georgia');}
  ctx.restore();
  // Speaker grilles beside the LCD.
  for(const sx of [100,620]){circle(sx,y+h/2,30,chrome(sx-30,0,sx+30,0));circle(sx,y+h/2,25,'#0a0f1d');for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++)if(i*i+j*j<=10)circle(sx+i*6.5,y+h/2+j*6.5,1.7,'#2c3a5a');}
}

function reelWindow(v){
  const [fx,fy,fw,fh]=LAYOUT.frame,[wx,wy,ww,wh]=LAYOUT.window,mid=LAYOUT.reelY+LAYOUT.reelH/2;
  // Decorative panel and the thick chrome bezel around the glass, as on real machines.
  rr(fx,fy,fw,fh,22,grad(fx,fy,fx+fw,fy+fh,[[0,'#1a3570'],[.5,'#0e1d44'],[1,'#1a3570']]));
  rr(fx,fy,fw,fh,22,null,chrome(fx,fy,fx+fw,fy+fh),5);
  for(let i=0;i<14;i++){const sx=fx+30+((i*97)%(fw-60)),sy=fy+16+((i*53)%(fh-32));if(sx>wx-8&&sx<wx+ww+8&&sy>wy-8&&sy<wy+wh+8)continue;star(sx,sy,3+(i%3),'#bcd6ff88');}
  rr(wx-12,wy-12,ww+24,wh+24,14,chrome(wx,wy-12,wx+ww,wy+wh+12));
  rr(wx-5,wy-5,ww+10,wh+10,9,'#060a14');
  LAYOUT.reels.forEach(([x,w],i)=>{
    ctx.save();ctx.beginPath();ctx.rect(x,LAYOUT.reelY,w,LAYOUT.reelH);ctx.clip();
    ctx.fillStyle=grad(x,0,x+w,0,[[0,'#d9d4c4'],[.5,'#fbf8ee'],[1,'#d9d4c4']]);ctx.fillRect(x,LAYOUT.reelY,w,LAYOUT.reelH);
    const strip=REELS[i],pos=v.positions[i],base=Math.floor(pos),fraction=pos-base,fast=Math.abs(v.velocities[i])>15;
    if(fast&&!v.gentle)ctx.filter='blur(1.5px)';
    for(let j=-2;j<=2;j++){const idx=((base+j)%strip.length+strip.length)%strip.length,y=mid-(j-fraction)*LAYOUT.pitch;symbol(ctx,strip[idx],x+w/2,y,.92);ctx.fillStyle='#00000014';ctx.fillRect(x,y+LAYOUT.pitch/2-1,w,2);}
    ctx.filter='none';
    // Cylinder shading: dark at top and bottom, a soft highlight just above the center line.
    ctx.fillStyle=grad(0,LAYOUT.reelY,0,LAYOUT.reelY+LAYOUT.reelH,[[0,'#000000d8'],[.14,'#0000005a'],[.3,'#00000010'],[.42,'#ffffff1a'],[.5,'#ffffff00'],[.7,'#00000010'],[.86,'#0000005a'],[1,'#000000d8']]);ctx.fillRect(x,LAYOUT.reelY,w,LAYOUT.reelH);
    ctx.fillStyle=grad(x,0,x+w,0,[[0,'#0006'],[.12,'#0000'],[.88,'#0000'],[1,'#0006']]);ctx.fillRect(x,LAYOUT.reelY,w,LAYOUT.reelH);
    ctx.restore();
  });
  // Separators between reels and the pay line (center line only, shown by red marks on the frame).
  for(const [x,w] of LAYOUT.reels.slice(1))rr(x-8,wy-5,8,wh+10,0,grad(x-8,0,x,0,[[0,'#1a1f2b'],[.5,'#4b556a'],[1,'#1a1f2b']]));
  ctx.strokeStyle='#ff304088';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx,mid);ctx.lineTo(wx+ww,mid);ctx.stroke();
  for(const x of [wx-12,wx+ww+12]){ctx.fillStyle='#ff3040';ctx.beginPath();ctx.moveTo(x,mid-9);ctx.lineTo(x+(x<wx?10:-10),mid);ctx.lineTo(x,mid+9);ctx.fill();}
  // Glass reflection over the reels.
  ctx.save();ctx.beginPath();ctx.rect(wx-5,wy-5,ww+10,wh+10);ctx.clip();ctx.fillStyle=grad(wx,wy,wx+ww*.8,wy+wh,[[0,'#ffffff26'],[.28,'#ffffff08'],[.29,'#ffffff1c'],[.4,'#ffffff00'],[1,'#ffffff00']]);ctx.fillRect(wx-5,wy-5,ww+10,wh+10);ctx.restore();
  if(v.showResult&&v.win>0){const a=v.gentle?.25:.5;glow('#6fc0ff',v.gentle?6:18,()=>rr(wx-8,wy-8,ww+16,wh+16,11,null,`rgba(140,210,255,${a})`,3));}
}

function betLamps(v){
  const {x,y}=LAYOUT.lamps;
  y.forEach((ly,k)=>{const n=3-k,lit=v.bet>=n;
    ctx.save();ctx.translate(x,ly);ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;ctx.lineTo(Math.cos(a)*30,Math.sin(a)*30);}ctx.closePath();ctx.fillStyle=chrome(-30,-30,30,30);ctx.fill();
    ctx.beginPath();for(let i=0;i<6;i++){const a=Math.PI/6+i*Math.PI/3;ctx.lineTo(Math.cos(a)*24,Math.sin(a)*24);}ctx.closePath();
    ctx.fillStyle=lit?radial(0,-4,2,26,[[0,'#fff6c8'],[.45,'#ffb300'],[1,'#a34800']]):radial(0,-4,2,26,[[0,'#4a3a2a'],[1,'#1a120c']]);
    if(lit){ctx.shadowColor='#ffb300';ctx.shadowBlur=v.gentle?6:18;}ctx.fill();ctx.shadowBlur=0;
    text(String(n),0,11,30,lit?'#5a1d00':'#6b5844','italic 900 Georgia');ctx.restore();});
  text('BET',x,y[2]+52,11,'#c8d4ee','bold Arial');
}

function sideLamps(v){
  const {x,y}=LAYOUT.side,items=[['START',v.canLever,'#3ee07a'],['REPLAY',v.replay,'#47b4ff'],['PAY',v.showResult&&v.win>0,'#ff6a3c'],['FREE',true,'#ffd34a']];
  items.forEach(([label,on,color],i)=>{rr(x-22,y[i]-22,44,44,8,chrome(x-22,0,x+22,0));rr(x-18,y[i]-18,36,36,6,on?color:'#1a2030');if(on)glow(color,v.gentle?4:12,()=>rr(x-18,y[i]-18,36,36,6,color+'99'));ctx.save();ctx.translate(x,y[i]);ctx.rotate(-Math.PI/2);text(label,0,4,label.length>4?8:10,on?'#0b1220':'#59627a','900 Arial');ctx.restore();});
}

function counters(v){
  const y=LAYOUT.counters.y;
  rr(76,y-12,568,86,12,grad(0,y-14,0,y+68,[[0,'#121c38'],[1,'#070c1c']]),'#3d5a92',1.5);
  counter('CREDIT',v.credit,200,y,4,{gentle:v.gentle});
  counter('GAME',v.rounds,376,y,4,{color:'#49d1ff',gentle:v.gentle});
  counter('PAYOUT',v.win,546,y,3,{gentle:v.gentle});
}

function deck(v){
  const y0=742;
  // Front deck: a sloped metal shelf that carries the controls.
  ctx.fillStyle=grad(0,y0-14,0,y0+106,[[0,'#d9e1ec'],[.08,'#7e8a9c'],[.2,'#2a3550'],[1,'#121a30']]);ctx.beginPath();ctx.moveTo(40,y0-14);ctx.lineTo(680,y0-14);ctx.lineTo(700,y0+106);ctx.lineTo(20,y0+106);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#c7d4ea';ctx.lineWidth=1.5;ctx.stroke();
  // MAX BET button (upper deck, left).
  const [bx,by,bw,bh]=LAYOUT.bet,pb=v.pressed('bet'),betOn=v.canBet;
  rr(bx-4,by-4,bw+8,bh+8,12,chrome(bx,by-4,bx,by+bh+4));
  rr(bx,by+(pb?3:0),bw,bh-(pb?3:0),9,betOn?grad(0,by,0,by+bh,[[0,'#ffe17a'],[.5,'#ff9b1a'],[1,'#c25a00']]):grad(0,by,0,by+bh,[[0,'#6c6252'],[1,'#3a3328']]));
  if(betOn&&!pb)glow('#ffb43a',v.gentle?4:12,()=>rr(bx,by,bw,bh,9,null,'#fff2c0',2));
  if(!pb)rr(bx+3,by+3,bw-6,bh*.38,7,'#ffffff40');
  text('MAX BET',bx+bw/2,by+bh/2+5+(pb?2:0),14,betOn?'#4a1c00':'#9a8f7a','900 Arial');
  // Lever: chrome housing with a stick and a knob. Pulling it swings the knob down toward the player.
  const {x:lx,y:ly,r:lr}=LAYOUT.lever,pull=v.leverPull;
  const px=lx+16,py=ly-44,tipX=lx-8-pull*6,tipY=ly-10+pull*34;
  circle(px,py,24,chrome(px-24,py-24,px+24,py+24));circle(px,py,14,'#0b1020');
  ctx.lineCap='round';ctx.strokeStyle='#0008';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(px+2,py+4);ctx.lineTo(tipX+2,tipY+6);ctx.stroke();
  ctx.strokeStyle=grad(px,py,tipX+10,tipY,[[0,'#6b7584'],[.5,'#f4f7fb'],[1,'#5b6573']]);ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(tipX,tipY);ctx.stroke();
  circle(tipX+2,tipY+5,lr,'#0007');
  circle(tipX,tipY,lr,radial(tipX-8,tipY-9,2,lr*1.2,v.canLever?[[0,'#ffd0d0'],[.3,'#e8202a'],[1,'#5a0008']]:[[0,'#d8b0b0'],[.3,'#8a3a3e'],[1,'#3a1014']]),'#2a0004',2);
  if(v.canLever&&!v.gentle)glow('#ff5060',10,()=>circle(tipX,tipY,lr,null,'#ff8a9455',2));
  // Stop buttons under each reel. Lit blue while that reel can be stopped; after stopping they go dark red.
  const {x:sxs,y:sy,r}=LAYOUT.stops;
  sxs.forEach((sx,i)=>{const ready=v.stopReady[i],p=v.pressed(`stop${i}`),d=p?4:0;
    rr(sx-r-12,sy-r-12,(r+12)*2,(r+12)*2,16,chrome(sx-r,sy-r-12,sx+r,sy+r+12));
    rr(sx-r-7,sy-r-7,(r+7)*2,(r+7)*2,12,'#0b1020');
    circle(sx,sy+5,r,'#000a');
    circle(sx,sy+d,r,ready?radial(sx-9,sy-10+d,2,r*1.3,[[0,'#e8f7ff'],[.35,'#38a8ff'],[1,'#063a8a']]):v.spinning?radial(sx-9,sy-10+d,2,r*1.3,[[0,'#ff9a8a'],[.4,'#b81a26'],[1,'#3a0408']]):radial(sx-9,sy-10+d,2,r*1.3,[[0,'#8a96aa'],[.4,'#3a4458'],[1,'#121826']]),'#9fb0cc',2);
    if(ready&&!p)glow('#38a8ff',v.gentle?6:16,()=>circle(sx,sy,r,null,'#bfe6ff',2));
    if(!p)ctx.fillStyle='#ffffff33',ctx.beginPath(),ctx.ellipse(sx-6,sy-14,15,7,-.3,0,7),ctx.fill();
    text(String(i+1),sx,sy+d+7,20,ready?'#fff':'#c7cede','900 Arial');});
}

function lowerPanel(v){
  const y=860;
  rr(48,y,624,84,14,grad(0,y,0,y+84,[[0,'#1d2f62'],[1,'#0a1430']]),chrome(48,y,672,y+84),3);
  ctx.save();ctx.beginPath();ctx.roundRect(52,y+4,616,76,11);ctx.clip();
  if(v.lcdImage){ctx.globalAlpha=.45;const img=v.lcdImage,s=616/img.width;ctx.drawImage(img,52,y+4-img.height*s*.55,616,img.height*s);ctx.globalAlpha=1;}
  ctx.fillStyle=grad(0,y,0,y+84,[[0,'#0a143066'],[1,'#0a1430dd']]);ctx.fillRect(52,y+4,616,76);ctx.restore();
  for(const sx of [100,620])for(let i=0;i<4;i++)rr(sx-28,y+20+i*13,56,5,2,'#05080f');
  text('ASTRAL',360,y+40,26,'#dbeaff','italic 900 Georgia');
  text('FREE PLAY · NO CASH VALUE',360,y+64,11,'#b6c6e6','bold Arial');
}

// v: state snapshot from app.js. Everything the drawing needs comes in through it.
export function drawSlot(c,v){
  ctx=c;
  body(v.gentle,v.clock);lcdPanel(v);reelWindow(v);betLamps(v);sideLamps(v);counters(v);deck(v);lowerPanel(v);
  if(v.showResult&&v.win>0){const a=(v.gentle?.1:.25)*Math.min(1,v.resultLeft);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(360,460,140,360,460,480);g.addColorStop(0,'#0000');g.addColorStop(1,`rgba(79,157,255,${a})`);ctx.fillStyle=g;ctx.fillRect(0,0,720,960);ctx.restore();}
}

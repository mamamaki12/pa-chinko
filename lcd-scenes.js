// LCD background scenes, like the many background stages of a real machine. Every STAGE is its own picture of the sky kingdom
// (the world of the LCD illustration): its own composition, motifs and motion, drawn on the canvas, some with painted pieces cut
// from the illustration (the castle, the islands, the goddess). A scene is a stage at a time of day (sky colours, sun or moon, stars)
// with a weather (falling or rising particles) and an event in the sky, so SCENES holds stages × their times × a few extras.
// Each machine shuffles its own deck (AURORA leans to warm, pink skies and ASTRAL to night and starry ones) and the same scenes
// are reused in every state: they cycle while idle, change at the start of a draw, a reach switches to a darker, more dramatic
// scene and a bonus to a festive one. Scenes never hint at a result: they change on what is already on screen.
// Gentle mode draws fewer particles and no light sweep between scenes; prefers-reduced-motion shows still scenes.

// sky: colours from the top to the horizon. glow: the light of the sky (used by rays and the halo). dark: 0 day … 1 night;
// stars: strength of the star field; theme: the machine whose deck it belongs to; mul: colours the painted pieces are multiplied by.
export const TIMES=[
  {id:'day',name:'昼',theme:'both',dark:0,sky:['#2f6fd8','#7fb6f0','#dceeff'],glow:'#fff4e0',sun:[.78,.16],mul:null},
  {id:'dawn',name:'朝焼け',theme:'aurora',dark:.1,sky:['#5a62c0','#e89cb0','#ffd8a8'],glow:'#ffb48c',sun:[.5,.62],mul:['#ffe2d2','#d6e0ff']},
  {id:'sunset',name:'夕焼け',theme:'aurora',dark:.3,sky:['#3c2a78','#ff7a52','#ffc46a'],glow:'#ffa040',sun:[.4,.6],mul:['#ff9c70','#9a5c9e']},
  {id:'twilight',name:'黄昏',theme:'both',dark:.5,sky:['#1e1a58','#6e4ca0','#ff92b4'],glow:'#ff80b0',sun:[.6,.66],stars:.4,mul:['#7a66c4','#ffa0bc']},
  {id:'night',name:'夜',theme:'astral',dark:1,sky:['#04071e','#101a4a','#263670'],glow:'#5070ff',sun:[.8,.18],stars:1,mul:['#34449a','#5468b8']},
  {id:'moon',name:'月夜',theme:'astral',dark:.9,sky:['#0a1240','#223e86','#6c92d0'],glow:'#c0d8ff',sun:[.74,.2],stars:.7,mul:['#5878c4','#34488c']},
  {id:'rose',name:'桜色',theme:'aurora',dark:0,sky:['#f080c0','#ffb8da','#fff0f8'],glow:'#ff90c8',sun:[.3,.2],mul:['#ffcae2','#ffe2f0']},
  {id:'gold',name:'黄金',theme:'aurora',dark:.1,sky:['#c47a20','#ffc650','#fff0b8'],glow:'#ffd060',sun:[.5,.3],mul:['#ffe2a4','#ffbe74']},
  {id:'nebula',name:'星雲',theme:'astral',dark:1,sky:['#140838','#4c2488','#b058b8'],glow:'#c060ff',sun:[.2,.2],stars:1,mul:['#5a3a98','#2c2068']},
  {id:'polar',name:'極夜',theme:'astral',dark:1,sky:['#04142a','#0c3650','#237080'],glow:'#40ffc0',sun:[.7,.22],stars:.8,mul:['#24506e','#2e5482']},
  {id:'frost',name:'白銀',theme:'astral',dark:0,sky:['#8aaee0','#cfe0fa','#ffffff'],glow:'#ffffff',sun:[.5,.14],mul:['#deecff','#bacef6']},
  {id:'jade',name:'翡翠',theme:'both',dark:.1,sky:['#146460','#58baa8','#d4f8ec'],glow:'#80ffd0',sun:[.72,.2],mul:['#bcf6de','#74bcb4']},
];
// Particles. fall: speed range in px per second (negative rises); drift: sideways speed; sway: wobble; spin: turns per second;
// flip: the particle tumbles (petals, leaves); still: it stays in place and twinkles; wander: it floats around (fireflies).
export const WEATHERS=[
  {id:'calm',name:'静か',n:0},
  {id:'petal',name:'花びら',n:22,fall:[24,52],drift:[10,25],sway:12,spin:1.2,size:[10,14],flip:true},
  {id:'snow',name:'雪',n:30,fall:[14,30],drift:[-6,6],sway:6,size:[4,7]},
  {id:'motes',name:'光の粒',n:26,fall:[-34,-10],drift:[-4,4],sway:14,size:[6,10],light:true,twinkle:true},
  {id:'firefly',name:'蛍',n:16,wander:true,size:[8,12],light:true,twinkle:true},
  {id:'feather',name:'羽根',n:10,fall:[12,22],drift:[8,16],sway:24,spin:.4,size:[16,22]},
  {id:'sparkle',name:'きらめき',n:20,still:true,size:[9,16],light:true,twinkle:true},
  {id:'bubble',name:'泡',n:16,fall:[-24,-10],drift:[-3,3],sway:10,size:[8,16]},
  {id:'rain',name:'光の雨',n:20,fall:[180,260],drift:[40,60],size:[16,24],light:true,streak:true},
  {id:'crystal',name:'結晶',n:16,fall:[16,30],drift:[-5,5],sway:8,spin:.7,size:[8,12],light:true},
  {id:'leaf',name:'紅葉',n:16,fall:[22,40],drift:[14,28],sway:16,spin:1.3,size:[11,15],flip:true},
  {id:'ember',name:'火の粉',n:24,fall:[-50,-20],drift:[-8,8],sway:10,size:[4,8],light:true,twinkle:true},
];
// dark: the sky must be at least this dark; light: at most this dark. party: used in bonus scenes; drama: used in reach scenes.
export const SKIES=[
  {id:'clear',name:'晴れ'},
  {id:'rays',name:'光の筋',party:true},
  {id:'meteor',name:'流れ星',drama:true},
  {id:'aurora',name:'オーロラ',dark:.5,drama:true},
  {id:'moon',name:'満月',dark:.3,light:.7},
  {id:'rainbow',name:'虹',light:.1},
  {id:'lanterns',name:'灯籠',dark:.3,party:true},
  {id:'birds',name:'鳥の群れ',light:.5},
  {id:'fireworks',name:'花火',dark:.3,party:true},
  {id:'galaxy',name:'天の川',dark:.9,drama:true},
  {id:'halo',name:'光輪',party:true,drama:true},
];
export function skyFits(sky,time){return time.dark>=(sky.dark??0)&&time.dark<=(sky.light??1);}

const clamp=(v,a=0,z=1)=>v<a?a:v>z?z:v,ease=v=>v*v*(3-2*v),TAU=Math.PI*2;
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const lerp=([a,z],k)=>a+(z-a)*k;
const hx=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
const hex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
const mix=(a,b,k)=>{const A=hx(a),B=hx(b);return hex(...A.map((v,i)=>v+(B[i]-v)*k));};
const al=(c,a)=>c.slice(0,7)+Math.round(clamp(a)*255).toString(16).padStart(2,'0');
// Silhouette colours of each time, far to near, and a shade function for coloured things (darker and bluer at night).
for(const T of TIMES){const d=T.dark;T.sil=[mix(T.sky[2],'#0a0c24',.3+.3*d),mix(T.sky[1],'#0a0c24',.5+.3*d),mix(T.sky[0],'#06081c',.6+.3*d)];T.tone=(c,k=1)=>mix(mix(c,T.sky[1],.12),'#070a20',d*.6*k);}

// --- Drawing helpers (browser side). Everything is a function of the time t, so nothing has to be stepped. ---
let DPR=1;const sprites=new Map();
function canvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*DPR));c.height=Math.max(1,Math.ceil(h*DPR));return c;}
function sprite(key,w,h,paint){let c=sprites.get(key);if(!c){c=canvas(w,h);const g=c.getContext('2d');g.scale(DPR,DPR);paint(g,w,h);sprites.set(key,c);}return c;}
function radial(g,x,y,r,stops){const gr=g.createRadialGradient(x,y,0,x,y,r);stops.forEach(([p,c])=>gr.addColorStop(p,c));return gr;}
function linear(g,x1,y1,x2,y2,stops){const gr=g.createLinearGradient(x1,y1,x2,y2);stops.forEach(([p,c])=>gr.addColorStop(p,c));return gr;}
function glowSprite(key,color){return sprite(key,32,32,g=>{g.fillStyle=radial(g,16,16,16,[[0,'#ffffff'],[.2,color],[1,color+'00']]);g.fillRect(0,0,32,32);});}
const CLOUD=(key='cloud',c='#ffffff')=>sprite(key,180,70,g=>{for(const [cx,cy,r] of [[40,44,24],[70,34,30],[105,30,34],[138,42,26],[90,50,30],[60,52,22],[122,52,22]]){g.fillStyle=radial(g,cx,cy,r,[[0,c+'cc'],[.6,c+'55'],[1,c+'00']]);g.fillRect(cx-r,cy-r,r*2,r*2);}});
const PUFF=()=>sprite('puff',64,64,g=>{g.fillStyle=radial(g,32,32,32,[[0,'#ffffffb0'],[.5,'#ffffff50'],[1,'#ffffff00']]);g.fillRect(0,0,64,64);});
function glow(g,x,y,r,color,a=1){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glowSprite('g'+color,color),x-r,y-r,r*2,r*2);g.restore();}
// The sky of a time: a gradient down to the horizon (hy) with the sun or the moon at P.sun (or at pos), unless orb is false.
function skyFill(g,W,H,P,hy=.75){g.fillStyle=linear(g,0,0,0,H*hy,[[0,P.sky[0]],[.55,P.sky[1]],[1,P.sky[2]]]);g.fillRect(0,0,W,H);if(P.stars)stars(g,W,H*hy*1.2,0,P.stars);}
function orb(g,W,H,P,pos=P.sun,r=Math.min(W,H)*.07){const [px,py]=pos,x=px*W,y=py*H;g.save();g.globalCompositeOperation='lighter';
  if(P.dark>=.8){g.fillStyle=radial(g,x,y,r*4,[[0,al(P.glow,.45)],[.35,al(P.glow,.12)],[1,al(P.glow,0)]]);g.fillRect(x-r*4,y-r*4,r*8,r*8);g.globalCompositeOperation='source-over';
    g.fillStyle=radial(g,x-r*.3,y-r*.3,r*1.3,[[0,'#fffdf2'],[1,'#e2d8b8']]);g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#c8ba9440';for(const [dx,dy,cr] of [[-.3,.1,.22],[.25,-.2,.16],[.1,.35,.12]]){g.beginPath();g.arc(x+dx*r,y+dy*r,cr*r,0,7);g.fill();}}
  else{const s=1-P.dark*.8;g.fillStyle=radial(g,x,y,r*5,[[0,al(P.glow,.4*s)],[.3,al(P.glow,.12*s)],[1,al(P.glow,0)]]);g.fillRect(x-r*5,y-r*5,r*10,r*10);g.fillStyle=radial(g,x,y,r*1.1,[[0,'#ffffff'],[.6,al('#fffbe8',.9*s)],[1,al(P.glow,0)]]);g.fillRect(x-r*1.2,y-r*1.2,r*2.4,r*2.4);}g.restore();}
// A silhouette ridge (hills, mountains, rooftops) from the line y - amp*noise down to the bottom. ox scrolls it; jag makes peaks.
function ridge(g,W,H,y,amp,seed,color,{ox=0,f=1,jag=0,step=5}={}){g.fillStyle=color;g.beginPath();g.moveTo(-30,H+30);
  for(let x=-30;x<=W+30;x+=step){const q=(x+ox)/W*f;let n=Math.sin(q*6.1+seed)*.5+Math.sin(q*13.7+seed*2.1)*.3+Math.sin(q*29.3+seed*.6)*.2;if(jag)n=n*(1-jag)+jag*(1-2*Math.abs(Math.sin(q*9.1+seed)));g.lineTo(x,y-amp*(.5+.5*n));}
  g.lineTo(W+30,H+30);g.closePath();g.fill();}
// A soft horizontal band of colour (mist, fog, haze) from y0 (clear) to y1 (full).
function mist(g,W,y0,y1,color,a){g.fillStyle=linear(g,0,y0,0,y1,[[0,al(color,0)],[1,al(color,a)]]);g.fillRect(0,Math.min(y0,y1),W,Math.abs(y1-y0)+1);}
// Clouds of one band scrolling sideways: n clouds of size k at height y, moving at speed px/s.
function clouds(g,W,y,k,t,speed,alpha,seed,n=4,wobble=5){const c=CLOUD(),cw=180*k,span=W+cw;g.save();for(let i=0;i<n;i++){const px=span-((t*speed*(.8+.4*hash(seed+i))+hash(seed+i*7)*span)%span)-cw*.5,py=y+hash(seed+i*3)*wobble*4+Math.sin(t*.3+i)*wobble;g.globalAlpha=alpha*(.7+.3*hash(seed+i*5));g.drawImage(c,px-cw/2,py-35*k,cw,70*k);}g.restore();}
// Water from y down: a reflection of the sky and light streaks drifting over it.
function water(g,W,H,y,P,t,{glitter=.5,top=P.sky[2],bottom=mix(P.sky[0],'#061024',.5)}={}){g.fillStyle=linear(g,0,y,0,H,[[0,top],[1,bottom]]);g.fillRect(0,y,W,H-y+1);
  g.save();g.globalCompositeOperation='lighter';for(let i=0;i<26;i++){const r=hash(i+70),d=r*r,ly=y+d*(H-y),len=(10+40*d)*(.6+.8*hash(i+71)),lx=((hash(i+72)*W+t*(6+10*d)*(hash(i+73)>.5?1:-1))%W+W)%W-len/2;
    g.fillStyle=al('#ffffff',glitter*(.08+.1*d)*(.6+.4*Math.sin(t*1.6+i)));g.fillRect(lx,ly,len,1.2+d*1.5);}g.restore();}
// A painted piece of the illustration: region [sx,sy,sw,sh] drawn ow×oh wide, graded by the time and faded out at the edges.
function piece(img,P,key,[sx,sy,sw,sh],ow,oh,feather=.35,shape='ellipse'){return sprite(`piece${key}|${P.id}|${ow}x${oh}`,ow,oh,g=>{g.drawImage(img,sx,sy,sw,sh,0,0,ow,oh);
  if(P.mul){g.globalCompositeOperation='multiply';g.fillStyle=linear(g,0,0,0,oh,[[0,P.mul[0]],[1,P.mul[1]]]);g.fillRect(0,0,ow,oh);}
  g.globalCompositeOperation='destination-in';if(shape==='ellipse'){g.save();g.translate(ow/2,oh/2);g.scale(ow/2,oh/2);g.fillStyle=radial(g,0,0,1,[[0,'#000'],[1-feather,'#000'],[1,'#0000']]);g.fillRect(-1,-1,2,2);g.restore();}
  else{const f=feather;g.fillStyle=linear(g,0,0,ow,0,[[0,'#0000'],[f,'#000'],[1-f,'#000'],[1,'#0000']]);g.fillRect(0,0,ow,oh);g.globalCompositeOperation='destination-in';g.fillStyle=linear(g,0,0,0,oh,[[0,'#0000'],[f,'#000'],[1-f,'#000'],[1,'#0000']]);g.fillRect(0,0,ow,oh);}});}
const CUTS={castle:[100,0,380,240],muse:[600,0,424,330],isleA:[0,180,220,160],isleB:[20,330,150,150],isleC:[385,250,175,220],isleD:[455,55,90,80],isleE:[560,75,95,70],crystal:[30,300,120,110],blue:[355,285,95,90]};
function cut(g,img,P,name,x,y,w,h,feather,shape){if(!img)return;const [,,sw,sh]=CUTS[name],oh=h??w*sh/sw;g.drawImage(piece(img,P,name,CUTS[name],Math.round(w),Math.round(oh),feather,shape),x,y);}
// A floating island drawn as a silhouette: a flat top with trees and a rocky underside, waterfalls from its edge.
function island(g,x,y,w,P,k=1,t=0,fall=true){const rock=P.sil[Math.min(2,Math.round(k*2))],top=P.tone('#4e8a4a',k);g.fillStyle=rock;g.beginPath();g.moveTo(x-w/2,y);g.quadraticCurveTo(x-w*.35,y+w*.5,x+w*.05,y+w*.62);g.quadraticCurveTo(x+w*.3,y+w*.3,x+w/2,y);g.closePath();g.fill();
  g.fillStyle=top;g.beginPath();g.ellipse(x,y,w/2,w*.07,0,0,7);g.fill();for(let i=0;i<4;i++){const tx=x-w*.4+hash(i+x)*w*.8,th=w*(.08+.08*hash(i+3+x));g.beginPath();g.moveTo(tx-th*.4,y);g.lineTo(tx,y-th);g.lineTo(tx+th*.4,y);g.fill();}
  if(fall){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<2;i++){const fx=x-w*.25+i*w*.4,len=w*(.9+.3*i);g.fillStyle=linear(g,0,y,0,y+len,[[0,'#ffffff90'],[.6,'#d8f0ff40'],[1,'#d8f0ff00']]);g.fillRect(fx-1.2*k,y,2.4*k,len);for(let j=0;j<3;j++){const q=((t*.5+j/3+i*.3)%1);g.fillStyle=al('#ffffff',.5*(1-q));g.fillRect(fx-2*k,y+q*len,4*k,3*k);}}g.restore();}}
// A star field for a W×H box (made once per size) with a few stars twinkling over it.
function stars(g,W,H,t,amount){const field=sprite(`stars${W}x${H}`,W,H,(c)=>{for(let i=0;i<120;i++){const r=.4+hash(i+400)*1.1;c.fillStyle=`rgba(230,238,255,${.3+.6*hash(i+500)})`;c.beginPath();c.arc(hash(i+200)*W,hash(i+300)*H*.75,r,0,7);c.fill();}});
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=amount*.9;g.drawImage(field,0,0,W,H);const tw=glowSprite('star','#cfe0ff');
  for(let i=0;i<10;i++){const a=Math.max(0,Math.sin(t*(1.2+hash(i+9)*1.5)+i*2));g.globalAlpha=amount*a;const s=6+hash(i+5)*6;g.drawImage(tw,hash(i+600)*W-s/2,hash(i+700)*H*.6-s/2,s,s);}g.restore();}
// A tree: trunk and a canopy of soft blobs (round) or a cone (pine). Draws into the plate.
function tree(g,x,y,h,trunk,leaf,kind='round'){g.fillStyle=trunk;g.fillRect(x-h*.04,y-h*.45,h*.08,h*.45);g.fillStyle=leaf;if(kind==='pine'){g.beginPath();g.moveTo(x-h*.28,y-h*.3);g.lineTo(x,y-h);g.lineTo(x+h*.28,y-h*.3);g.closePath();g.fill();}
  else for(const [dx,dy,r] of [[0,-.7,.3],[-.22,-.55,.22],[.22,-.55,.22],[0,-.45,.25]]){g.beginPath();g.arc(x+dx*h,y+dy*h,r*h,0,7);g.fill();}}
// A bird (two wing strokes) at x,y with wing phase f.
function bird(g,x,y,s,f,color){g.strokeStyle=color;g.lineWidth=Math.max(1,s*.18);g.lineCap='round';g.beginPath();g.moveTo(x-s,y-f*s*.6);g.quadraticCurveTo(x-s*.5,y-s*.3,x,y);g.quadraticCurveTo(x+s*.5,y-s*.3,x+s,y-f*s*.6);g.stroke();}

// --- The stages. plate: what does not move (cached per size and time). live: what moves, drawn over the plate every frame. ---
// W,H: the size of the picture; P: the time; t: seconds; img: the LCD illustration (may still be loading).
const ALL=TIMES.map(t=>t.id),DAYS=['day','dawn','sunset','rose','gold','frost','jade'],NIGHTS=['twilight','night','moon','nebula','polar'],WARM=['day','dawn','sunset','twilight','rose','gold','jade'],COLD=['day','twilight','night','moon','nebula','polar','frost'];
const SOFT=['calm','petal','motes','feather','sparkle'],NIGHTW=['calm','motes','firefly','sparkle'],OPEN=['clear','rays','meteor','aurora','moon','rainbow','birds','halo'],FEST=['clear','rays','lanterns','fireworks','halo'];
export const STAGES=[
  // 1. The illustration itself, with a slow camera over it.
  {id:'castle',name:'天空城',times:ALL,weathers:SOFT,skies:OPEN,shot:[.3,.42,1.12,1.4,.12]},
  {id:'muse',name:'女神',times:ALL,weathers:['calm','petal','motes','sparkle','feather'],skies:['clear','rays','meteor','halo'],shot:[.86,.48,1.6,1.3,-.08]},
  // 2. New views of the castle, made from painted pieces.
  {id:'farcastle',name:'雲海の彼方の天空城',times:ALL,weathers:SOFT,skies:OPEN,
    plate:(g,W,H,P,img)=>{skyFill(g,W,H,P,.8);orb(g,W,H,P,[P.sun[0],Math.min(P.sun[1],.3)]);cut(g,img,P,'castle',W*.22,H*.18,W*.56,null,.3);mist(g,W,H*.35,H*.62,P.sky[2],.8);},
    live:(g,W,H,t,P)=>{clouds(g,W,H*.68,1.3,t,9,.9,1,5,3);clouds(g,W,H*.8,2,t,16,1,2,4,3);clouds(g,W,H*.95,2.6,t,24,1,3,3,2);for(let i=0;i<5;i++)bird(g,((t*18+i*90)%(W+60))-30,H*.3+i*9+Math.sin(t*2+i)*3,5,Math.sin(t*9+i),P.sil[1]);}},
  {id:'mirror',name:'鏡の湖の天空城',times:['day','dawn','sunset','twilight','moon','rose','frost'],weathers:['calm','petal','motes','sparkle'],skies:['clear','moon','rainbow','meteor','birds'],
    plate:(g,W,H,P,img)=>{skyFill(g,W,H,P,.55);cut(g,img,P,'castle',W*.2,H*.02,W*.6,null,.3);water(g,W,H,H*.56,P,0,{glitter:0});
      if(img){g.save();g.globalAlpha=.55;g.translate(0,H*1.12);g.scale(1,-1);cut(g,img,P,'castle',W*.2,H*.02,W*.6,null,.3);g.restore();}mist(g,W,H*.5,H*.62,P.sky[2],.5);},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const d=hash(i+9),ly=H*.58+d*H*.4,len=20+60*d,lx=((hash(i+5)*W+t*(8+12*d))%(W+len))-len;g.fillStyle=al('#ffffff',.18*(.5+.5*Math.sin(t*1.3+i)));g.fillRect(lx,ly,len,1.5+2*d);}g.restore();
      for(let i=0;i<3;i++){const r=((t*.25+i/3)%1)*W*.3;g.strokeStyle=al('#ffffff',.25*(1-r/(W*.3)));g.lineWidth=1;g.beginPath();g.ellipse(W*(.3+.4*hash(i)),H*(.7+.2*hash(i+1)),r,r*.25,0,0,7);g.stroke();}}},
  {id:'archipelago',name:'浮島の群れ',times:ALL,weathers:SOFT,skies:OPEN,
    plate:(g,W,H,P,img)=>{skyFill(g,W,H,P,.9);orb(g,W,H,P);cut(g,img,P,'isleD',W*.62,H*.12,W*.2,null,.3);cut(g,img,P,'isleE',W*.05,H*.2,W*.2,null,.3);mist(g,W,H*.55,H,P.sky[2],.6);},
    live:(g,W,H,t,P,img)=>{const bob=(i)=>Math.sin(t*.5+i*2)*4;g.save();g.translate(0,bob(1));cut(g,img,P,'isleA',W*.0,H*.42,W*.5,null,.3);g.restore();g.save();g.translate(0,bob(2));cut(g,img,P,'isleC',W*.58,H*.3,W*.36,null,.28);g.restore();
      g.save();g.translate(0,bob(3));cut(g,img,P,'isleB',W*.36,H*.62,W*.26,null,.3);g.restore();clouds(g,W,H*.9,2,t,10,.9,4,3,2);}},
  {id:'crystalisle',name:'水晶の浮島',times:['day','twilight','night','moon','nebula','polar','frost','jade'],weathers:['calm','motes','sparkle','crystal','snow'],skies:['clear','meteor','aurora','galaxy','moon','halo'],
    plate:(g,W,H,P,img)=>{skyFill(g,W,H,P,.9);orb(g,W,H,P,[.2,.18]);cut(g,img,P,'blue',W*.7,H*.4,W*.2,null,.3);mist(g,W,H*.5,H,P.sky[2],.55);},
    live:(g,W,H,t,P,img)=>{const s=1+.03*Math.sin(t*.7);g.save();g.translate(W*.42,H*.62+Math.sin(t*.6)*5);g.scale(s,s);cut(g,img,P,'crystal',-W*.22,-H*.3,W*.44,null,.32);g.restore();
      const pulse=.4+.3*Math.sin(t*1.5);glow(g,W*.42,H*.5,W*.22,'#9a7cff',pulse*.9);for(let i=0;i<6;i++){const a=t*.6+i*TAU/6;glow(g,W*.42+Math.cos(a)*W*.2,H*.52+Math.sin(a)*H*.16,6,'#d8c0ff',.8);}clouds(g,W,H*.92,1.8,t,8,.9,5,3,2);}},
  {id:'goddess',name:'女神の見守る空',times:['dawn','twilight','night','moon','rose','nebula'],weathers:['calm','petal','motes','sparkle','feather'],skies:['clear','rays','meteor','galaxy','halo'],
    plate:(g,W,H,P,img)=>{skyFill(g,W,H,P,.9);if(img){g.save();g.globalAlpha=.42;cut(g,img,P,'muse',W*.3,-H*.1,W*.8,null,.45);g.restore();}orb(g,W,H,P,[.18,.22],Math.min(W,H)*.05);},
    live:(g,W,H,t,P,img)=>{for(let i=0;i<3;i++){const y=H*(.8+.1*i)+Math.sin(t*.4+i)*3;const s=.9+.2*i;const c=CLOUD();g.globalAlpha=.8;for(let k=0;k<3;k++)g.drawImage(c,((k*W*.45+t*(6+4*i))%(W+200))-150,y-35*s,200*s,70*s);}g.globalAlpha=1;
      g.save();g.translate(0,Math.sin(t*.8)*3);cut(g,img,P,'isleD',W*.08,H*.5,W*.28,null,.3);g.restore();}},
  // 3. The sky kingdom, drawn.
  {id:'cloudsea',name:'雲海を飛ぶ',times:ALL,weathers:['calm','motes','feather','sparkle'],skies:OPEN,
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.6);orb(g,W,H,P,[.5,.42],Math.min(W,H)*.09);mist(g,W,H*.3,H*.55,P.sky[2],.9);g.fillStyle=P.sky[2];g.fillRect(0,H*.55,W,H);},
    live:(g,W,H,t,P)=>{const c=CLOUD();for(let i=0;i<14;i++){const q=((t*.09+hash(i+3))%1),z=q*q,y=H*.46+z*H*.7,k=.5+z*3.2,x=W*.5+(hash(i+4)-.5)*W*(.3+z*2.2),cw=180*k;g.globalAlpha=Math.min(1,.4+z*1.2);g.fillStyle=al(P.sil[0],.25*z);g.drawImage(c,x-cw/2,y-35*k,cw,70*k);}
      g.globalAlpha=1;for(let i=0;i<3;i++){const q=(t*.05+i/3)%1,z=q*q;island(g,W*(.2+.6*hash(i)),H*.44+z*H*.3,20+z*120,P,z,t);}}},
  {id:'skybridge',name:'空の回廊',times:ALL,weathers:SOFT,skies:OPEN,
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.7);orb(g,W,H,P,[.5,.4],Math.min(W,H)*.08);mist(g,W,H*.3,H*.6,P.sky[2],.7);g.fillStyle=P.sil[0];g.beginPath();g.moveTo(W*.46,H*.44);g.lineTo(W*.54,H*.44);g.lineTo(W*.9,H*1.1);g.lineTo(W*.1,H*1.1);g.closePath();g.fill();
      g.fillStyle=P.tone('#d8c8a8');g.beginPath();g.moveTo(W*.48,H*.45);g.lineTo(W*.52,H*.45);g.lineTo(W*.8,H*1.1);g.lineTo(W*.2,H*1.1);g.closePath();g.fill();g.fillStyle=al('#000000',.15);for(let i=0;i<10;i++){const z=i/10,q=z*z,y=H*.45+q*H*.65;g.fillRect(W*.5-W*.3*q-2,y,W*.6*q+4,1.5+q*2);}},
    live:(g,W,H,t,P)=>{for(let i=0;i<9;i++){const q=((t*.12+i/9)%1),z=q*q,y=H*.45+z*H*.65;for(const s of [-1,1]){const x=W*.5+s*(W*.03+W*.31*z),h=6+60*z;g.fillStyle=P.tone('#c8b890');g.fillRect(x-1-z*2,y-h,2+z*4,h);g.fillStyle=P.tone('#8c7858');g.beginPath();g.arc(x,y-h,2+z*5,0,7);g.fill();if(P.dark>.3)glow(g,x,y-h,6+z*16,'#ffd080',.6+.4*z);}}
      clouds(g,W,H*.75,1.6,t,12,.7,6,3,2);}},
  {id:'whale',name:'空の鯨',times:ALL,weathers:['calm','motes','sparkle','feather'],skies:['clear','rays','meteor','moon','galaxy','halo','rainbow'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.8);orb(g,W,H,P);mist(g,W,H*.6,H,P.sky[2],.6);},
    live:(g,W,H,t,P)=>{clouds(g,W,H*.85,2,t,8,.9,7,4,3);const per=12,q=(t%per)/per,x=-W*.25+q*W*1.5,y=H*.4+Math.sin(t*.5)*H*.05,s=W*.4,c=P.sil[2];g.save();g.translate(x,y);g.fillStyle=c;
      g.beginPath();g.moveTo(-s*.5,0);g.quadraticCurveTo(-s*.3,-s*.18,s*.1,-s*.14);g.quadraticCurveTo(s*.4,-s*.1,s*.5,0);g.quadraticCurveTo(s*.4,s*.12,s*.1,s*.13);g.quadraticCurveTo(-s*.3,s*.14,-s*.5,0);g.fill();
      const f=Math.sin(t*1.6)*s*.08;g.beginPath();g.moveTo(-s*.46,0);g.lineTo(-s*.68,-s*.14+f);g.lineTo(-s*.6,0+f*.5);g.lineTo(-s*.68,s*.14+f);g.closePath();g.fill();g.beginPath();g.moveTo(s*.05,s*.1);g.quadraticCurveTo(s*.1,s*.3,-s*.15,s*.28);g.quadraticCurveTo(0,s*.2,s*.05,s*.1);g.fill();
      g.fillStyle=al('#ffffff',.35);g.beginPath();g.ellipse(-s*.1,s*.06,s*.3,s*.05,0,0,7);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(s*.32,-s*.02,s*.012,0,7);g.fill();g.restore();
      for(let i=0;i<12;i++){const k=(t*.4+i/12)%1;glow(g,x-s*.5-k*s*.5,y+Math.sin(i*2+t)*s*.12,4+6*(1-k),'#c8e0ff',(1-k)*.8);}}},
  {id:'balloons',name:'気球の丘',times:['day','dawn','sunset','twilight','rose','gold','jade'],weathers:['calm','petal','motes','feather'],skies:['clear','rays','rainbow','birds','halo'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.85);orb(g,W,H,P);ridge(g,W,H,H*.78,H*.12,1.3,P.sil[0]);ridge(g,W,H,H*.86,H*.1,4.1,P.tone('#5e9a52'));ridge(g,W,H,H*.95,H*.08,7.7,P.tone('#3e7a3a'));for(let i=0;i<7;i++)tree(g,W*(.05+.15*i)+hash(i)*20,H*(.9+.05*hash(i+2)),14+hash(i+4)*10,P.sil[2],P.tone('#2e6a34'));},
    live:(g,W,H,t,P)=>{const cols=['#ff6a6a','#ffc23c','#64c8ff','#ff8ad0','#8ae08a','#c8a0ff'];for(let i=0;i<6;i++){const k=hash(i+20),q=((t*.03*(.6+k)+hash(i+21))%1),y=H*.9-q*H*1.2,x=W*(.1+.8*hash(i+22))+Math.sin(t*.4+i)*8,r=10+14*hash(i+23);g.fillStyle=P.tone(cols[i]);g.beginPath();g.arc(x,y,r,Math.PI*.8,Math.PI*2.2);g.quadraticCurveTo(x+r*.3,y+r*1.1,x,y+r*1.4);g.quadraticCurveTo(x-r*.3,y+r*1.1,x-r*.95,y+r*.4);g.fill();
        g.fillStyle=al('#ffffff',.3);g.beginPath();g.ellipse(x-r*.3,y-r*.2,r*.25,r*.5,.3,0,7);g.fill();g.strokeStyle=P.sil[2];g.lineWidth=1;g.beginPath();g.moveTo(x-r*.3,y+r*1.2);g.lineTo(x-r*.2,y+r*1.75);g.moveTo(x+r*.3,y+r*1.2);g.lineTo(x+r*.2,y+r*1.75);g.stroke();g.fillStyle=P.tone('#7a5a3a');g.fillRect(x-r*.22,y+r*1.7,r*.44,r*.3);}}},
  {id:'dragon',name:'竜の空',times:['sunset','twilight','night','moon','nebula','gold','polar'],drama:true,weathers:['calm','motes','ember','sparkle'],skies:['clear','meteor','moon','galaxy','aurora','rays'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.9);orb(g,W,H,P,[.3,.3],Math.min(W,H)*.1);ridge(g,W,H,H*.8,H*.3,2.2,P.sil[0],{jag:.6,f:1.4});ridge(g,W,H,H*.9,H*.3,5.4,P.sil[1],{jag:.6,f:1.2});ridge(g,W,H,H*1.02,H*.25,9.1,P.sil[2],{jag:.5});mist(g,W,H*.6,H*.9,P.sky[2],.3);},
    live:(g,W,H,t,P)=>{const q=t*.22,x=W*.5+Math.sin(q)*W*.36,y=H*.38+Math.sin(q*2)*H*.12,dir=Math.cos(q)>=0?1:-1,s=W*.09,f=Math.sin(t*4);g.save();g.translate(x,y);g.scale(dir,1);g.fillStyle=P.sil[2];
      g.beginPath();g.moveTo(-s*1.6,s*.1);g.quadraticCurveTo(-s*.8,-s*.15,0,0);g.quadraticCurveTo(s*.6,s*.05,s*.9,-s*.2);g.lineTo(s*1.1,-s*.1);g.lineTo(s*.95,s*.12);g.quadraticCurveTo(s*.5,s*.3,0,s*.22);g.quadraticCurveTo(-s*.8,s*.3,-s*1.6,s*.1);g.fill();
      for(const side of [-1,1]){g.beginPath();g.moveTo(-s*.1,0);g.quadraticCurveTo(s*.3*side-s*.2,-s*(1.2*f+.4)*side,s*1.3*side,-s*(1.6*f)*side);g.quadraticCurveTo(s*.4*side,-s*(.5*f)*side-s*.1,s*.2,s*.1);g.fill();}
      g.fillStyle=P.glow;g.beginPath();g.arc(s*.95,-s*.08,s*.05,0,7);g.fill();g.restore();glow(g,x+dir*s*.95,y-s*.08,s*.5,P.glow,.5);}},
  {id:'gate',name:'光の大門',times:ALL,party:true,weathers:['calm','motes','sparkle','feather'],skies:['clear','rays','halo','meteor'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.9);g.fillStyle=P.sil[1];g.fillRect(0,H*.82,W,H);g.fillStyle=P.tone('#e8d8b0');const cx=W*.5,gy=H*.82,gw=W*.22,gh=H*.6;for(const s of [-1,1]){g.fillRect(cx+s*gw-W*.05,gy-gh,W*.1,gh);g.fillRect(cx+s*gw-W*.07,gy-gh-H*.04,W*.14,H*.05);}
      g.beginPath();g.moveTo(cx-gw-W*.05,gy-gh+H*.02);g.quadraticCurveTo(cx,gy-gh-H*.55,cx+gw+W*.05,gy-gh+H*.02);g.lineTo(cx+gw-W*.05,gy-gh+H*.02);g.quadraticCurveTo(cx,gy-gh-H*.3,cx-gw+W*.05,gy-gh+H*.02);g.closePath();g.fill();
      g.fillStyle=P.tone('#d8b860');for(let i=0;i<5;i++){const y=gy-gh*(.2+.15*i);g.fillRect(cx-gw-W*.03,y,W*.06,3);g.fillRect(cx+gw-W*.03,y,W*.06,3);}g.fillStyle=linear(g,0,gy,0,gy+H*.2,[[0,al(P.glow,.5)],[1,al(P.glow,0)]]);g.fillRect(cx-gw,gy,gw*2,H*.2);},
    live:(g,W,H,t,P)=>{const cx=W*.5,gy=H*.82,gw=W*.22;g.save();g.beginPath();g.rect(cx-gw+W*.05,gy-H*.7,gw*2-W*.1,H*.7);g.clip();g.fillStyle=radial(g,cx,gy-H*.25,W*.3,[[0,'#ffffff'],[.3,al(P.glow,.9)],[1,al(P.glow,0)]]);g.fillRect(0,0,W,H);
      g.globalCompositeOperation='lighter';g.translate(cx,gy-H*.25);g.rotate(t*.15);for(let i=0;i<12;i++){g.rotate(TAU/12);g.fillStyle=linear(g,0,0,0,-W,[[0,al('#ffffff',.3)],[1,al('#ffffff',0)]]);g.beginPath();g.moveTo(0,0);g.lineTo(-10,-W);g.lineTo(10,-W);g.fill();}g.restore();
      g.save();g.translate(cx,gy-H*.25);g.rotate(-t*.1);g.strokeStyle=al(P.glow,.8);g.lineWidth=1.5;g.beginPath();g.arc(0,0,W*.16,0,7);g.stroke();for(let i=0;i<16;i++){const a=i/16*TAU,r=W*.16;g.beginPath();g.moveTo(Math.cos(a)*r,Math.sin(a)*r);g.lineTo(Math.cos(a)*(r+6),Math.sin(a)*(r+6));g.stroke();}g.restore();
      for(let i=0;i<10;i++){const k=(t*.25+i/10)%1;glow(g,cx+(hash(i)-.5)*gw*1.6,gy-k*H*.9,4+8*(1-k),P.glow,(1-k)*.8);}}},
  {id:'magic',name:'魔法陣',times:['twilight','night','moon','nebula','polar','gold','rose'],party:true,weathers:['calm','motes','sparkle'],skies:['clear','meteor','galaxy','halo'],
    plate:(g,W,H,P)=>{g.fillStyle=radial(g,W*.5,H*.5,W*.7,[[0,P.sky[1]],[1,mix(P.sky[0],'#000000',.5)]]);g.fillRect(0,0,W,H);},
    live:(g,W,H,t,P)=>{const cx=W*.5,cy=H*.5,R=Math.min(W,H)*.42;g.save();g.translate(cx,cy);g.scale(1,.55);const ring=(r,sp,n,w,col)=>{g.save();g.rotate(t*sp);g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.arc(0,0,r,0,7);g.stroke();for(let i=0;i<n;i++){const a=i/n*TAU;g.beginPath();g.moveTo(Math.cos(a)*r,Math.sin(a)*r);g.lineTo(Math.cos(a)*(r-8),Math.sin(a)*(r-8));g.stroke();if(i%3===0){g.beginPath();g.arc(Math.cos(a)*(r+10),Math.sin(a)*(r+10),3,0,7);g.stroke();}}g.restore();};
      ring(R,.3,24,2,al(P.glow,.9));ring(R*.78,-.45,12,1.5,al('#ffffff',.6));ring(R*.55,.6,36,1,al(P.glow,.7));g.save();g.rotate(-t*.2);g.strokeStyle=al('#ffffff',.5);g.lineWidth=1.5;g.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/3;g.lineTo(Math.cos(a)*R*.55,Math.sin(a)*R*.55);}g.stroke();g.beginPath();for(let i=0;i<=6;i++){const a=i*TAU/3+Math.PI/3;g.lineTo(Math.cos(a)*R*.55,Math.sin(a)*R*.55);}g.stroke();g.restore();g.restore();
      glow(g,cx,cy,R*.5,P.glow,.35+.15*Math.sin(t*2));for(let i=0;i<8;i++){const a=t*.5+i*TAU/8,r=R*(.8+.1*Math.sin(t+i));glow(g,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.55-Math.abs(Math.sin(t*1.5+i))*H*.2,5,'#ffffff',.9);}}},
  {id:'spires',name:'塔の街',times:ALL,weathers:SOFT,skies:OPEN,
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.85);orb(g,W,H,P);for(let L=0;L<3;L++){const col=P.sil[L],base=H*(.72+.12*L);g.fillStyle=col;for(let i=0;i<9;i++){const x=W*(i+hash(i+L*9)*.8)/9,w=(6+hash(i+L*3)*10)*(1+L*.5),h=(H*.15+hash(i+L*7)*H*.25)*(1+L*.3);g.fillRect(x-w/2,base-h,w,h+H);g.beginPath();g.moveTo(x-w*.7,base-h);g.lineTo(x,base-h-w*1.6);g.lineTo(x+w*.7,base-h);g.fill();
        if(P.dark>.3){g.fillStyle=al('#ffe0a0',.8);for(let k=0;k<5;k++)if(hash(i*9+k+L)>.5)g.fillRect(x-w*.25+hash(k+i)*w*.4,base-h+5+k*(h/6),2,2.5);g.fillStyle=col;}}if(L<2)mist(g,W,H*.3,H,P.sky[2],.22);}mist(g,W,H*.6,H,P.sky[2],.3);},
    live:(g,W,H,t,P)=>{clouds(g,W,H*.5,1,t,7,.5,8,3,3);for(let i=0;i<8;i++){const q=((t*.35+hash(i+30)*5)%7)/7;const x=W*(i+.5)/8,y=H*.5+hash(i+31)*H*.3;g.fillStyle=P.tone(['#e8c050','#d84060','#f0f0ff'][i%3]);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+5,y-2+Math.sin(t*6+i)*2,x+10,y+1+Math.sin(t*6+i+1)*2);g.lineTo(x,y+4);g.fill();}
      for(let i=0;i<4;i++)bird(g,((t*14+i*110)%(W+40))-20,H*.25+i*14+Math.sin(t*1.5+i)*4,4,Math.sin(t*8+i),P.sil[1]);}},
  {id:'clock',name:'時計塔',times:['day','sunset','twilight','night','moon','gold','frost'],weathers:['calm','motes','sparkle','feather','snow'],skies:['clear','moon','meteor','birds','rays'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.9);orb(g,W,H,P,[.2,.2]);ridge(g,W,H,H*.8,H*.12,2.1,P.sil[0]);mist(g,W,H*.6,H*.9,P.sky[2],.4);const cx=W*.6,cy=H*.46,R=Math.min(W,H)*.2;g.fillStyle=P.sil[2];g.fillRect(cx-R*1.35,cy-R*1.4,R*2.7,H);g.fillStyle=P.sil[1];g.fillRect(cx-R*1.5,cy-R*1.55,R*3,R*.2);g.beginPath();g.moveTo(cx-R*1.6,cy-R*1.5);g.lineTo(cx,cy-R*2.6);g.lineTo(cx+R*1.6,cy-R*1.5);g.fill();
      g.fillStyle=P.tone('#f4e8c8');g.beginPath();g.arc(cx,cy,R,0,7);g.fill();g.strokeStyle=P.tone('#b89a50');g.lineWidth=3;g.stroke();g.fillStyle=P.sil[2];for(let i=0;i<12;i++){const a=i*TAU/12;g.save();g.translate(cx+Math.cos(a)*R*.85,cy+Math.sin(a)*R*.85);g.rotate(a);g.fillRect(-R*.05,-1.2,R*.1,2.4);g.restore();}
      for(let k=0;k<4;k++){g.fillStyle=al('#ffe0a0',P.dark>.3?.8:.25);g.fillRect(cx-R*1.1+k*R*.7,cy+R*1.4,R*.15,R*.3);}ridge(g,W,H,H*.98,H*.1,5.3,P.sil[2]);},
    live:(g,W,H,t,P)=>{const cx=W*.6,cy=H*.46,R=Math.min(W,H)*.2;const hand=(len,a,w)=>{g.strokeStyle=P.sil[2];g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(cx-Math.cos(a)*len*.15,cy-Math.sin(a)*len*.15);g.lineTo(cx+Math.cos(a)*len,cy+Math.sin(a)*len);g.stroke();};
      hand(R*.55,t*.02-Math.PI/2,3.5);hand(R*.78,t*.24-Math.PI/2,2.5);hand(R*.8,t*TAU/60-Math.PI/2,1.2);g.fillStyle=P.tone('#b89a50');g.beginPath();g.arc(cx,cy,R*.07,0,7);g.fill();
      for(const [gx,gy,gr,sp] of [[W*.18,H*.62,R*.5,.4],[W*.07,H*.76,R*.34,-.6],[W*.3,H*.78,R*.4,-.5]]){g.save();g.translate(gx,gy);g.rotate(t*sp);g.strokeStyle=al(P.sil[1],.8);g.lineWidth=gr*.3;g.beginPath();g.arc(0,0,gr*.8,0,7);g.stroke();for(let i=0;i<8;i++){g.rotate(TAU/8);g.fillStyle=al(P.sil[1],.8);g.fillRect(gr*.8,-gr*.12,gr*.3,gr*.24);}g.restore();}
      clouds(g,W,H*.3,.9,t,6,.4,9,2,3);for(let i=0;i<3;i++)bird(g,((t*12+i*120)%(W+40))-20,H*.2+i*12+Math.sin(t+i)*3,4,Math.sin(t*8+i),P.sil[1]);}},
  {id:'garden',name:'空中庭園',times:['day','dawn','rose','gold','jade','twilight','frost'],weathers:['calm','petal','motes','sparkle','feather'],skies:['clear','rays','rainbow','birds','halo'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.7);orb(g,W,H,P);mist(g,W,H*.35,H*.6,P.sky[2],.6);for(let L=0;L<3;L++){const y=H*(.62+.13*L),col=P.tone(['#7ab878','#5a9a5c','#3e7a44'][L],.8),x0=W*(.5-.25-.15*L),x1=W*(.5+.25+.15*L);g.fillStyle=P.tone('#d8c8a0');g.fillRect(x0-6,y,x1-x0+12,6);g.fillStyle=col;g.fillRect(x0,y+6,x1-x0,H);
        for(let i=0;i<5+L*2;i++)tree(g,x0+(i+.5)*(x1-x0)/(5+L*2),y+2,12+8*hash(i+L*5),P.sil[2],P.tone(['#9ad088','#78b870','#5aa060'][L]),hash(i+L)>.6?'pine':'round');g.fillStyle=al('#ff80c0',.8);for(let i=0;i<30;i++)g.fillRect(x0+hash(i+L*40)*(x1-x0),y+8+hash(i+L*41)*H*.08,2,2);}
      g.fillStyle=P.tone('#e8f0ff');g.beginPath();g.ellipse(W*.5,H*.66,W*.08,H*.025,0,0,7);g.fill();},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const q=(t*.9+i/14)%1,x=W*.5+Math.sin(i*2.1)*(q*W*.05),y=H*.66-Math.sin(q*Math.PI)*H*.22+q*q*H*.05;g.fillStyle=al('#ffffff',.7*(1-q));g.beginPath();g.arc(x,y,1.5,0,7);g.fill();}g.restore();
      for(let i=0;i<5;i++){const x=W*(.1+.8*hash(i+50))+Math.sin(t*.7+i)*W*.08,y=H*(.5+.3*hash(i+51))+Math.sin(t*1.3+i*2)*H*.05,f=Math.abs(Math.sin(t*7+i)),c=P.tone(['#ffd040','#ff80c0','#80d0ff'][i%3]);g.fillStyle=c;for(const s of [-1,1]){g.beginPath();g.ellipse(x+s*4*f,y,4*f+.5,3,s*.5,0,7);g.fill();}}}},
  {id:'stairs',name:'天への階段',times:['twilight','night','moon','nebula','dawn','gold'],weathers:['calm','motes','sparkle','feather'],skies:['clear','meteor','galaxy','halo','moon'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.9);const cx=W*.5,top=H*.18;g.fillStyle=radial(g,cx,top,W*.3,[[0,al('#ffffff',.9)],[.2,al(P.glow,.7)],[1,al(P.glow,0)]]);g.fillRect(0,0,W,H);
      g.fillStyle=al('#ffffff',.9);g.fillRect(cx-W*.03,top-H*.02,W*.06,H*.12);for(let i=0;i<20;i++){const q=i/20,k=Math.pow(q,1.5),y=top+H*.1+k*H*.9,w=W*.06+k*W*.95,h=2+k*16,q2=Math.pow((i+1)/20,1.5),y2=top+H*.1+q2*H*.9,w2=W*.06+q2*W*.95;g.fillStyle=mix(P.tone('#c8b89a'),P.sil[2],.2+q*.6);g.beginPath();g.moveTo(cx-w/2,y);g.lineTo(cx+w/2,y);g.lineTo(cx+w2/2,y2);g.lineTo(cx-w2/2,y2);g.fill();g.fillStyle=mix(P.tone('#f0e8d8'),P.sil[1],q*.5);g.beginPath();g.moveTo(cx-w/2,y);g.lineTo(cx+w/2,y);g.lineTo(cx+w2/2,y+h);g.lineTo(cx-w2/2,y+h);g.fill();}mist(g,W,H*.4,H*1.05,P.sky[1],.35);},
    live:(g,W,H,t,P)=>{const cx=W*.5;for(let i=0;i<9;i++){const q=(t*.07+hash(i+60))%1,x=cx+(hash(i+61)-.5)*W*.9*(1-q*.5),y=H*1.05-q*H,s=4+6*(1-q);glow(g,x,y,s*2.2,'#ffc070',.7*(1-q*.5));g.fillStyle=P.tone('#ffd890');g.fillRect(x-s*.3,y-s*.4,s*.6,s*.8);}
      clouds(g,W,H*.85,1.6,t,6,.7,10,3,2);}},
  {id:'windmill',name:'風車の丘',times:['day','dawn','sunset','gold','jade','rose','twilight'],weathers:['calm','petal','motes','leaf','feather'],skies:['clear','rays','rainbow','birds']
    ,plate:(g,W,H,P)=>{skyFill(g,W,H,P,.85);orb(g,W,H,P);ridge(g,W,H,H*.7,H*.1,3.3,P.sil[0]);ridge(g,W,H,H*.8,H*.12,6.6,P.tone('#8cb860'));ridge(g,W,H,H*.92,H*.12,9.9,P.tone('#6a9a48'));
      for(const [x,y,s] of [[W*.3,H*.74,1],[W*.72,H*.8,1.4]]){g.fillStyle=P.tone('#e8dcc0');g.beginPath();g.moveTo(x-9*s,y+6*s);g.lineTo(x-5*s,y-30*s);g.lineTo(x+5*s,y-30*s);g.lineTo(x+9*s,y+6*s);g.fill();g.fillStyle=P.tone('#8a5a3a');g.beginPath();g.moveTo(x-7*s,y-29*s);g.lineTo(x,y-38*s);g.lineTo(x+7*s,y-29*s);g.fill();}},
    live:(g,W,H,t,P)=>{for(const [x,y,s,sp] of [[W*.3,H*.74-32,1,.9],[W*.72,H*.8-45,1.4,.7]]){g.save();g.translate(x,y);g.rotate(t*sp);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle=P.tone('#f0e8d0');g.fillRect(-2*s,0,4*s,28*s);g.fillStyle=al('#ffffff',.5);g.fillRect(-7*s,6*s,14*s,20*s);g.fillStyle=P.tone('#f0e8d0');g.fillRect(-7*s,6*s,14*s,20*s);}g.restore();}
      g.strokeStyle=al(P.tone('#e8d890'),.6);g.lineWidth=1;for(let i=0;i<40;i++){const x=hash(i+80)*W,y=H*.86+hash(i+81)*H*.14,l=6+hash(i+82)*8,sw=Math.sin(t*2.2+x*.05)*3;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+sw,y-l*.6,x+sw*2,y-l);g.stroke();}}},
  {id:'throne',name:'女神の間',times:['day','gold','rose','twilight','night','nebula','frost'],party:true,weathers:['calm','motes','sparkle','feather','petal'],skies:['clear','rays','halo'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,mix(P.sky[0],'#000000',.4)],[1,P.sky[1]]]);g.fillRect(0,0,W,H);g.fillStyle=P.tone('#e8e0d0');g.fillRect(0,H*.78,W,H);g.fillStyle=al(P.sky[0],.4);g.fillRect(0,H*.78,W,H);
      for(let i=0;i<4;i++){const q=i/4,z=.3+q*.7;for(const s of [-1,1]){const x=W*.5+s*(W*.12+W*.4*q),w=W*.03*z,h=H*.7*z;g.fillStyle=mix(P.tone('#f4ecdc'),P.sil[2],.5-q*.3);g.fillRect(x-w/2,H*.78-h,w,h);g.fillRect(x-w,H*.78-h-6*z,w*2,6*z);g.fillRect(x-w,H*.78-6*z,w*2,6*z);}}
      g.fillStyle=P.tone('#d8c890');g.fillRect(W*.42,H*.72,W*.16,H*.06);g.fillRect(W*.38,H*.76,W*.24,H*.03);},
    live:(g,W,H,t,P)=>{const cx=W*.5,cy=H*.5+Math.sin(t*.8)*5;g.save();g.translate(cx,cy);g.rotate(Math.sin(t*.5)*.15);g.fillStyle=linear(g,0,-H*.14,0,H*.14,[[0,'#ffffff'],[.4,'#b8a0ff'],[1,'#6050e0']]);g.beginPath();g.moveTo(0,-H*.15);g.lineTo(W*.045,0);g.lineTo(0,H*.15);g.lineTo(-W*.045,0);g.closePath();g.fill();g.fillStyle=al('#ffffff',.6);g.beginPath();g.moveTo(0,-H*.15);g.lineTo(W*.015,0);g.lineTo(0,H*.15);g.lineTo(-W*.015,0);g.fill();g.restore();
      glow(g,cx,cy,W*.2,'#b090ff',.4+.15*Math.sin(t*2));g.save();g.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const x=W*(.2+.15*k),a=.12+.08*Math.sin(t*.7+k);g.fillStyle=linear(g,x,0,x+W*.1,H*.78,[[0,al(P.glow,a)],[1,al(P.glow,0)]]);g.beginPath();g.moveTo(x-W*.02,0);g.lineTo(x+W*.02,0);g.lineTo(x+W*.14,H*.78);g.lineTo(x+W*.06,H*.78);g.fill();}g.restore();
      for(let i=0;i<8;i++){const a=t*.7+i*TAU/8;glow(g,cx+Math.cos(a)*W*.12,cy+Math.sin(a)*H*.05-Math.cos(a*1.5)*H*.1,5,'#ffffff',.9);}}},
  // 4. Nature.
  {id:'sakura',name:'桜の並木',times:['day','dawn','rose','gold','twilight','night'],weathers:['petal','calm','motes','sparkle'],skies:['clear','rays','moon','lanterns','birds'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.7);orb(g,W,H,P,[.5,.3]);g.fillStyle=P.tone('#c8b890');g.beginPath();g.moveTo(W*.47,H*.6);g.lineTo(W*.53,H*.6);g.lineTo(W*.85,H*1.1);g.lineTo(W*.15,H*1.1);g.fill();g.fillStyle=P.tone('#6a9a50');g.beginPath();g.moveTo(0,H*.62);g.lineTo(W*.47,H*.6);g.lineTo(W*.15,H*1.1);g.lineTo(0,H*1.1);g.fill();g.beginPath();g.moveTo(W,H*.62);g.lineTo(W*.53,H*.6);g.lineTo(W*.85,H*1.1);g.lineTo(W,H*1.1);g.fill();
      for(let i=6;i>=0;i--){const q=i/6,z=1-q*.85;for(const s of [-1,1]){const x=W*.5+s*(W*.06+W*.5*z),y=H*.6+z*z*H*.45,h=H*.5*z;g.fillStyle=P.sil[2];g.fillRect(x-3*z-1,y-h*.5,6*z+2,h*.5);const bl=P.tone(['#ffc0dc','#ffaacc','#ff98c4'][i%3]);g.fillStyle=bl;for(const [dx,dy,r] of [[0,-.65,.32],[-.3,-.5,.26],[.3,-.5,.26],[-.15,-.85,.22],[.15,-.85,.22]]){g.beginPath();g.arc(x+dx*h,y+dy*h,r*h,0,7);g.fill();}}}
      mist(g,W,H*.4,H*.65,P.sky[2],.35);},
    live:(g,W,H,t,P)=>{if(P.dark>.3)for(let i=0;i<6;i++){const q=i/6,z=1-q*.85;for(const s of [-1,1]){const x=W*.5+s*(W*.06+W*.5*z)+s*10*z,y=H*.6+z*z*H*.45-H*.28*z;glow(g,x,y,10*z+4,'#ffb060',.6+.2*Math.sin(t*4+i));}}
      g.save();g.globalCompositeOperation='lighter';g.fillStyle=al('#ffffff',.15+.05*Math.sin(t));g.fillRect(0,0,W,H*.6);g.restore();}},
  {id:'forest',name:'光の森',times:['day','gold','jade','twilight','night','polar','frost'],weathers:['firefly','motes','calm','leaf','sparkle'],skies:['clear','rays'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,mix(P.sky[1],'#0a2a1a',.6)],[.6,P.tone('#3a7a4a')],[1,P.tone('#1c4028')]]);g.fillRect(0,0,W,H);
      for(let L=0;L<3;L++){const n=7+L*2,col=mix(P.sil[L],P.tone('#26381c'),.65);for(let i=0;i<n;i++){const x=W*((i+hash(i+L*13)*.9)/n),w=(4+hash(i+L*17)*6)*(1+L*.9),top=-H*.1;g.fillStyle=col;g.fillRect(x-w/2,top,w,H*1.2);g.fillStyle=al('#000000',.25);g.fillRect(x+w*.2,top,w*.3,H*1.2);for(let b=0;b<2;b++){const by=H*(.1+.2*b+hash(b+i)*.1),d=hash(b*3+i)>.5?1:-1;g.strokeStyle=col;g.lineWidth=w*.35;g.beginPath();g.moveTo(x,by);g.quadraticCurveTo(x+d*w*2,by-w*1.5,x+d*w*4,by-w*3.5);g.stroke();}}if(L<2)mist(g,W,H*.2,H,P.sky[2],.14);g.fillStyle=mix(P.sil[L],P.tone('#1a3a24'),.5);for(let i=0;i<10;i++){const x=hash(i+L*21)*W,y=-H*.05+hash(i+L*23)*H*.12,r=W*(.06+.08*hash(i+L*25));g.beginPath();g.arc(x,y,r,0,7);g.fill();}}
      g.fillStyle=P.tone('#2e6a3a');for(let i=0;i<40;i++){const x=hash(i+90)*W,y=H*(.85+hash(i+91)*.15),r=4+hash(i+92)*8;g.beginPath();g.arc(x,y,r,0,7);g.fill();}},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let k=0;k<4;k++){const x=W*(.15+.22*k)+Math.sin(t*.3+k)*W*.05,a=(.1+.08*Math.sin(t*.6+k*2))*(P.dark>.5?.6:1);g.fillStyle=linear(g,x,0,x+W*.12,H,[[0,al(P.glow,a)],[1,al(P.glow,0)]]);g.beginPath();g.moveTo(x-W*.03,-10);g.lineTo(x+W*.03,-10);g.lineTo(x+W*.2,H);g.lineTo(x+W*.1,H);g.fill();}g.restore();
      for(let i=0;i<6;i++){const q=(t*.08+hash(i+95))%1,x=((hash(i+96)*W+t*5)%W),y=H*.3+q*H*.6,c=CLOUD();g.globalAlpha=.08*Math.sin(q*Math.PI);g.drawImage(c,x-90,y-35,180,70);}g.globalAlpha=1;}},
  {id:'worldtree',name:'世界樹',times:['day','dawn','twilight','night','moon','nebula','jade','gold'],weathers:['motes','sparkle','leaf','firefly','calm'],skies:['clear','rays','meteor','galaxy','moon','halo'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.9);orb(g,W,H,P,[.2,.2]);ridge(g,W,H,H*.85,H*.08,2.5,P.sil[0]);ridge(g,W,H,H*.95,H*.08,5.5,P.sil[1]);const cx=W*.55,by=H*1.02;g.fillStyle=P.sil[2];g.beginPath();g.moveTo(cx-W*.16,by);g.quadraticCurveTo(cx-W*.05,H*.7,cx-W*.035,H*.4);g.lineTo(cx+W*.035,H*.4);g.quadraticCurveTo(cx+W*.05,H*.7,cx+W*.16,by);g.fill();
      for(const [a,len,wd] of [[-.9,.42,.5],[-.5,.3,.4],[-1.3,.26,.35],[.9,.4,.5],[.5,.3,.4],[1.3,.25,.35],[0,.3,.3]]){g.save();g.translate(cx,H*.42);g.rotate(a-Math.PI/2);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(W*len*.5,W*.03,W*len,W*.01);g.lineTo(W*len,-W*.01);g.quadraticCurveTo(W*len*.5,-W*.03*wd-W*.02,0,-W*.04*wd-W*.02);g.fill();g.restore();}
      for(let i=0;i<34;i++){const a=hash(i+100)*TAU,r=W*(.06+.3*hash(i+101)),x=cx+Math.cos(a)*r,y=H*.38+Math.sin(a)*r*.55-H*.02,s=8+hash(i+102)*14;g.fillStyle=radial(g,x,y,s,[[0,al(mix(P.glow,'#80ffc0',.5),.3)],[1,al(mix(P.glow,'#80ffc0',.5),0)]]);g.fillRect(x-s,y-s,s*2,s*2);}},
    live:(g,W,H,t,P)=>{const cx=W*.55;for(let i=0;i<26;i++){const a=hash(i+110)*TAU,r=W*(.08+.3*hash(i+111)),x=cx+Math.cos(a)*r,y=H*.38+Math.sin(a)*r*.55-H*.02,p=.5+.5*Math.sin(t*(1+hash(i+112))+i);glow(g,x,y,4+5*p,mix(P.glow,'#a0ffd0',.5),.5+.5*p);}
      for(let i=0;i<5;i++){const a=t*.3+i*TAU/5,r=W*.2;glow(g,cx+Math.cos(a)*r,H*.4+Math.sin(a)*r*.4,6,'#ffffff',.7);}}},
  {id:'flowers',name:'花の丘',times:['day','dawn','rose','gold','jade','sunset','twilight'],weathers:['petal','motes','calm','sparkle','feather'],skies:['clear','rays','rainbow','birds','halo'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.6);orb(g,W,H,P);ridge(g,W,H,H*.55,H*.08,1.1,P.sil[0]);ridge(g,W,H,H*.62,H*.1,8.2,P.tone('#8ccc70'));ridge(g,W,H,H*.74,H*.14,3.3,P.tone('#6ab858'));ridge(g,W,H,H*.9,H*.14,5.5,P.tone('#4e9a48'));tree(g,W*.78,H*.63,H*.26,P.sil[2],P.tone('#3e8a44'));tree(g,W*.86,H*.66,H*.18,P.sil[2],P.tone('#4e9a50'));
      for(let i=0;i<120;i++){const x=hash(i+120)*W,y=H*(.66+hash(i+121)*.34),c=['#ff80b0','#ffe060','#ffffff','#ff9050','#c090ff'][i%5];g.fillStyle=al(P.tone(c),.95);const s=1.5+2*(y/H);g.beginPath();g.arc(x,y,s,0,7);g.fill();}},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';g.fillStyle=al('#ffffff',.12);for(let i=0;i<40;i++){const x=hash(i+130)*W,y=H*(.68+hash(i+131)*.32),sw=Math.sin(t*2+x*.03)*3;g.fillRect(x+sw,y-2,1.5,4);}g.restore();
      for(let i=0;i<5;i++){const x=W*(.1+.8*hash(i+140))+Math.sin(t*.6+i)*W*.1,y=H*(.45+.3*hash(i+141))+Math.sin(t*1.1+i*2)*H*.05,f=Math.abs(Math.sin(t*8+i)),c=P.tone(['#fff0a0','#ffffff','#ffb0e0'][i%3]);g.fillStyle=c;for(const s of [-1,1]){g.beginPath();g.ellipse(x+s*4*f,y,4*f+.5,3,s*.5,0,7);g.fill();}}}},
  {id:'falls',name:'大瀑布',times:['day','dawn','jade','frost','twilight','moon','gold'],weathers:['motes','calm','sparkle','feather','rain'],skies:['clear','rainbow','rays','birds','moon'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.5);orb(g,W,H,P,[.22,.18]);ridge(g,W,H,H*.4,H*.1,2.8,P.sil[0],{jag:.5});g.fillStyle=P.sil[1];g.fillRect(0,H*.42,W,H);for(const s of [0,1]){g.fillStyle=P.sil[2];g.beginPath();g.moveTo(s?W:0,H*.3);g.lineTo(s?W*.7:W*.3,H*.42);g.lineTo(s?W*.66:W*.34,H*1.05);g.lineTo(s?W:0,H*1.05);g.fill();}
      g.fillStyle=P.tone('#3e8a44');for(let i=0;i<12;i++){const x=hash(i+150)>.5?W*.15*hash(i+151):W-W*.15*hash(i+151),y=H*(.42+hash(i+152)*.5);g.beginPath();g.arc(x,y,6+hash(i+153)*10,0,7);g.fill();}},
    live:(g,W,H,t,P)=>{const x0=W*.32,x1=W*.68,top=H*.41;g.fillStyle=linear(g,x0,0,x1,0,[[0,al('#d8f0ff',.5)],[.5,al('#ffffff',.85)],[1,al('#d8f0ff',.5)]]);g.fillRect(x0,top,x1-x0,H);g.save();g.globalCompositeOperation='lighter';
      for(let i=0;i<22;i++){const x=x0+hash(i+160)*(x1-x0),len=H*(.12+.2*hash(i+161)),q=((t*(1.1+hash(i+162)*.4)+hash(i+163))%1),y=top+q*(H-top+len)-len;g.fillStyle=linear(g,0,y,0,y+len,[[0,al('#ffffff',0)],[.7,al('#ffffff',.6)],[1,al('#ffffff',0)]]);g.fillRect(x,y,2+hash(i+164)*2,len);}g.restore();
      const c=PUFF();g.save();g.globalAlpha=.7;for(let i=0;i<9;i++){const q=(t*.4+i/9)%1,s=40+60*q,x=x0-20+hash(i+170)*(x1-x0+40),y=H*.95-q*H*.3;g.globalAlpha=.6*(1-q);g.drawImage(c,x-s/2,y-s/2,s,s);}g.restore();}},
  {id:'lake',name:'鏡の湖',times:['day','dawn','sunset','twilight','night','moon','frost','jade'],weathers:['calm','motes','snow','firefly','sparkle'],skies:['clear','moon','meteor','galaxy','aurora','birds'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.55);orb(g,W,H,P,[.7,.2]);ridge(g,W,H,H*.52,H*.3,3.1,P.sil[0],{jag:.7});ridge(g,W,H,H*.55,H*.2,6.2,P.sil[1],{jag:.6,f:1.3});for(let i=0;i<8;i++)tree(g,W*(.02+.06*i),H*.56,12+hash(i)*8,P.sil[2],P.sil[2],'pine');for(let i=0;i<6;i++)tree(g,W*(.7+.06*i),H*.56,12+hash(i+3)*8,P.sil[2],P.sil[2],'pine');
      water(g,W,H,H*.56,P,0,{glitter:0});g.save();g.globalAlpha=.5;g.translate(0,H*1.12);g.scale(1,-1);ridge(g,W,H,H*.52,H*.3,3.1,P.sil[0],{jag:.7});ridge(g,W,H,H*.55,H*.2,6.2,P.sil[1],{jag:.6,f:1.3});g.restore();mist(g,W,H*.5,H*.6,P.sky[2],.5);
      if(P.dark<.8)return;g.fillStyle=linear(g,0,H*.56,0,H,[[0,al('#fffdf2',.5)],[1,al('#fffdf2',0)]]);g.fillRect(W*.66,H*.56,W*.08,H*.44);},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<24;i++){const d=hash(i+180),ly=H*.57+d*d*H*.43,len=12+50*d,lx=((hash(i+181)*W+t*(4+10*d)*(hash(i+182)>.5?1:-1))%(W+len)+W+len)%(W+len)-len;g.fillStyle=al('#ffffff',.2*(.5+.5*Math.sin(t*1.4+i)));g.fillRect(lx,ly,len,1+2*d);}g.restore();
      for(let i=0;i<3;i++){const q=((t*.2+i/3)%1),r=q*W*.25,x=W*(.2+.6*hash(i+190)),y=H*(.65+.3*hash(i+191));g.strokeStyle=al('#ffffff',.3*(1-q));g.lineWidth=1;g.beginPath();g.ellipse(x,y,r,r*.22,0,0,7);g.stroke();}}},
  {id:'icecastle',name:'氷の城',times:['frost','day','moon','night','polar','twilight'],weathers:['snow','crystal','calm','sparkle','motes'],skies:['clear','aurora','moon','meteor','galaxy'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.8);orb(g,W,H,P,[.2,.2]);ridge(g,W,H,H*.6,H*.35,4.4,mix(P.sil[0],'#ffffff',.3),{jag:.8});ridge(g,W,H,H*.7,H*.3,7.1,mix(P.sil[1],'#ffffff',.2),{jag:.7,f:1.4});
      const cx=W*.5,by=H*.72;g.fillStyle=mix(P.tone('#cfe6ff'),'#ffffff',.3);for(const [dx,w,h] of [[0,.14,.5],[-.14,.08,.36],[.14,.08,.36],[-.24,.05,.25],[.24,.05,.25]]){const x=cx+dx*W;g.fillRect(x-w*W/2,by-h*H,w*W,h*H);g.beginPath();g.moveTo(x-w*W/2-3,by-h*H);g.lineTo(x,by-h*H-w*W*1.3);g.lineTo(x+w*W/2+3,by-h*H);g.fill();}
      g.fillStyle=al(P.sky[0],.35);for(let i=0;i<12;i++){g.fillRect(cx-W*.3+i*W*.05,by-H*.3+hash(i)*H*.2,W*.012,H*.05);}ridge(g,W,H,H*.8,H*.1,2.2,mix(P.sky[2],'#ffffff',.5));ridge(g,W,H,H*.92,H*.08,9.9,mix(P.sky[2],'#ffffff',.7));},
    live:(g,W,H,t,P)=>{const cx=W*.5;for(let i=0;i<12;i++){const x=cx-W*.3+i*W*.05+W*.006,y=H*.72-H*.3+hash(i)*H*.2+H*.025;glow(g,x,y,5,P.dark>.3?'#ffe0a0':'#ffffff',.5+.4*Math.sin(t*2+i));}
      g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const q=(t*.15+i/10)%1,x=((hash(i+200)*W+t*20)%W),y=H*.75+hash(i+201)*H*.2;g.fillStyle=al('#ffffff',.25*Math.sin(q*Math.PI));g.fillRect(x,y,30+40*hash(i+202),1.5);}g.restore();}},
  {id:'desert',name:'砂の遺跡',times:['day','sunset','gold','twilight','night','moon','dawn'],weathers:['calm','motes','sparkle','ember'],skies:['clear','moon','meteor','galaxy','rays','birds'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.9);orb(g,W,H,P,[.3,.3],Math.min(W,H)*.1);const dune=(y,amp,seed,c)=>{ridge(g,W,H,y,amp,seed,c,{f:.6});};dune(H*.62,H*.12,1.7,P.tone('#e8c080'));
      g.fillStyle=P.tone('#c8a060');g.beginPath();g.moveTo(W*.58,H*.64);g.lineTo(W*.72,H*.34);g.lineTo(W*.9,H*.66);g.fill();g.fillStyle=P.tone('#9a7a40');g.beginPath();g.moveTo(W*.72,H*.34);g.lineTo(W*.9,H*.66);g.lineTo(W*.78,H*.66);g.fill();g.fillStyle=P.tone('#d8b070');g.fillRect(W*.2,H*.4,W*.03,H*.25);g.beginPath();g.moveTo(W*.2,H*.4);g.lineTo(W*.215,H*.36);g.lineTo(W*.23,H*.4);g.fill();
      dune(H*.76,H*.16,5.2,P.tone('#f0cc90'));dune(H*.95,H*.12,8.8,P.tone('#e0b878'));g.fillStyle=al('#000000',.12);for(let i=0;i<30;i++){g.beginPath();g.ellipse(hash(i+210)*W,H*(.7+.3*hash(i+211)),20+hash(i+212)*40,2,0,0,7);g.fill();}},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<16;i++){const q=(t*.2+hash(i+220))%1,x=q*(W+100)-50,y=H*(.66+hash(i+221)*.32)+Math.sin(t*2+i)*4,len=20+hash(i+222)*50;g.fillStyle=al('#fff0c0',.22*Math.sin(q*Math.PI));g.fillRect(x,y,len,1.2);}g.restore();
      g.save();g.globalAlpha=.08+.04*Math.sin(t*.5);g.fillStyle=P.glow;g.fillRect(0,H*.3,W,H*.1);g.restore();for(let i=0;i<2;i++){const a=t*.4+i*Math.PI,x=W*.5+Math.cos(a)*W*.25,y=H*.3+Math.sin(a*2)*H*.05;bird(g,x,y,6,Math.sin(t*5+i),P.sil[2]);}}},
  {id:'volcano',name:'火の山',times:['sunset','twilight','night','nebula','gold'],drama:true,weathers:['ember','calm','motes'],skies:['clear','meteor','galaxy','moon'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,mix(P.sky[0],'#200808',.5)],[.6,mix(P.sky[1],'#602010',.5)],[1,'#2a0c08']]);g.fillRect(0,0,W,H);ridge(g,W,H,H*.6,H*.25,4.2,mix(P.sil[0],'#3a1810',.5),{jag:.7});
      g.fillStyle=mix(P.sil[2],'#200a08',.6);g.beginPath();g.moveTo(-10,H*1.05);g.lineTo(W*.38,H*.3);g.lineTo(W*.48,H*.3);g.lineTo(W*.9,H*1.05);g.fill();g.fillStyle='#0e0604';g.fillRect(0,H*.9,W,H);},
    live:(g,W,H,t,P)=>{const cx=W*.43,cy=H*.3;glow(g,cx,cy,W*.25,'#ff6020',.55+.15*Math.sin(t*3));g.save();g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const x0=cx-W*.04+i*W*.02,x1=x0+(i-2)*W*.12,p=.6+.4*Math.sin(t*2+i);g.strokeStyle=al('#ff9030',p);g.lineWidth=2+i%2;g.beginPath();g.moveTo(x0,cy);g.quadraticCurveTo(x0+(x1-x0)*.3,H*.6,x1,H*.92);g.stroke();}
      for(let i=0;i<14;i++){const q=(t*.25+hash(i+230))%1,x=cx+(hash(i+231)-.5)*W*.1+(hash(i+232)-.5)*q*W*.3,y=cy-q*H*.5,s=4+16*q;g.globalAlpha=(1-q)*.8;g.drawImage(PUFF(),x-s,y-s,s*2,s*2);}g.restore();g.fillStyle=al('#ff4010',.08+.04*Math.sin(t*5));g.fillRect(0,H*.9,W,H);}},
  {id:'storm',name:'嵐の空',times:['twilight','night','polar','moon','sunset'],drama:true,weathers:['rain','calm','motes'],skies:['clear','meteor'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,mix(P.sky[0],'#101420',.5)],[.7,mix(P.sky[1],'#283040',.5)],[1,mix(P.sky[2],'#303848',.6)]]);g.fillRect(0,0,W,H);ridge(g,W,H,H*.82,H*.14,2.9,P.sil[1],{jag:.3});ridge(g,W,H,H*.92,H*.1,7.7,P.sil[2]);for(let i=0;i<10;i++)tree(g,hash(i+240)*W,H*(.9+hash(i+241)*.08),10+hash(i+242)*12,P.sil[2],P.sil[2],'pine');},
    live:(g,W,H,t,P)=>{const c=CLOUD('storm','#2a3048');g.save();for(let i=0;i<9;i++){const k=1.6+hash(i+250)*1.2,cw=180*k,x=W+cw-((t*(10+8*hash(i+251))+hash(i+252)*(W+cw))%(W+cw*2)),y=H*(.05+.3*hash(i+253));g.globalAlpha=.9;g.drawImage(c,x-cw/2,y-35*k,cw,70*k);}g.restore();
      const per=3.3,p=t%per,n=Math.floor(t/per);if(p<.35){const a=p<.08?1:p<.15?.3:p<.22?.8:Math.max(0,1-(p-.22)/.13),x=W*(.2+.6*hash(n+260));g.fillStyle=al('#e8f0ff',.18*a);g.fillRect(0,0,W,H);g.strokeStyle=al('#ffffff',a);g.lineWidth=2;g.lineCap='round';g.beginPath();let lx=x,ly=0;g.moveTo(lx,ly);for(let s=1;s<=8;s++){lx+=(hash(n*9+s)-.5)*W*.12;ly=H*.08*s*(.8+.2*hash(n*7+s));g.lineTo(lx,ly);}g.stroke();glow(g,x,H*.2,W*.3,'#c0d0ff',a*.6);}}},
  {id:'ocean',name:'大海原',times:['day','dawn','sunset','gold','twilight','moon','jade'],weathers:['calm','motes','feather','sparkle','bubble'],skies:['clear','rays','rainbow','birds','moon','meteor'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.5);orb(g,W,H,P,[.5,.42],Math.min(W,H)*.09);mist(g,W,H*.3,H*.5,P.sky[2],.4);water(g,W,H,H*.5,P,0,{glitter:0,top:mix(P.sky[2],'#2a7ab0',.4),bottom:mix(P.sky[0],'#0a2a4a',.5)});},
    live:(g,W,H,t,P)=>{for(let i=0;i<12;i++){const q=(i/12+t*.05)%1,z=q*q,y=H*.5+z*H*.55,amp=1+z*4;g.strokeStyle=al(mix(P.sky[2],'#ffffff',.5),.15+.5*z);g.lineWidth=1+z*2;g.beginPath();for(let x=-10;x<=W+10;x+=8)g.lineTo(x,y+Math.sin(x*.03*(1+z)+t*1.5+i)*amp);g.stroke();}
      g.save();g.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const d=hash(i+270),y=H*.5+d*d*H*.3,x=W*.5+(hash(i+271)-.5)*W*(.1+.5*d),a=.3*Math.max(0,Math.sin(t*(2+d)+i));g.fillStyle=al('#ffffff',a);g.fillRect(x,y,3+6*d,1);}g.restore();
      const bx=W*.28+Math.sin(t*.1)*W*.03,by=H*.6+Math.sin(t*.9)*3,s=W*.07;g.save();g.translate(bx,by);g.rotate(Math.sin(t*.9)*.05);g.fillStyle=P.sil[2];g.beginPath();g.moveTo(-s,0);g.lineTo(s*.9,0);g.lineTo(s*.7,s*.3);g.lineTo(-s*.8,s*.3);g.fill();g.fillRect(-s*.1,-s*1.4,s*.08,s*1.4);g.fillStyle=P.tone('#f4ece0');g.beginPath();g.moveTo(-s*.05,-s*1.35);g.lineTo(s*.65,-s*.25);g.lineTo(-s*.05,-s*.1);g.fill();g.beginPath();g.moveTo(-s*.12,-s*1.2);g.lineTo(-s*.7,-s*.15);g.lineTo(-s*.12,-s*.1);g.fill();g.restore();}},
  {id:'canyon',name:'峡谷',times:['day','sunset','gold','twilight','night','dawn'],weathers:['calm','motes','feather','sparkle'],skies:['clear','rays','birds','moon','meteor','rainbow'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.7);orb(g,W,H,P,[.5,.22]);mist(g,W,H*.3,H*.7,P.sky[2],.5);for(let L=0;L<3;L++){const q=L/2,col=mix(P.tone(['#c88a5a','#a86a44','#7a4a30'][L]),P.sil[L],.3);for(const s of [-1,1]){g.fillStyle=col;g.beginPath();const x=W*.5+s*(W*.1+W*.12*L);g.moveTo(s>0?W+10:-10,H*(.2-q*.25));g.lineTo(x+s*W*.06,H*(.25-q*.2));for(let y=H*.25;y<=H*1.05;y+=H*.08)g.lineTo(x+s*(Math.sin(y*.05+L)*W*.03+W*.02*((y/H)>.7?1:0)),y);g.lineTo(s>0?W+10:-10,H*1.05);g.fill();}}
      g.fillStyle=P.tone('#5aa0c0');g.beginPath();g.moveTo(W*.46,H*.6);g.lineTo(W*.54,H*.6);g.lineTo(W*.62,H*1.05);g.lineTo(W*.38,H*1.05);g.fill();},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const q=(t*.5+i/10)%1,y=H*.6+q*H*.45,w=W*.08+q*W*.24;g.fillStyle=al('#ffffff',.3*Math.sin(q*Math.PI));g.fillRect(W*.5-w/2+Math.sin(i+t)*w*.3,y,w*.3,1.5);}g.restore();
      for(let i=0;i<2;i++){const a=t*.3+i*2,r=W*(.12+.06*i),x=W*.5+Math.cos(a)*r,y=H*.3+Math.sin(a)*r*.3;bird(g,x,y,7,Math.sin(t*2+i)*.5,P.sil[2]);}
      for(let i=0;i<4;i++){const q=(t*.06+i/4)%1,x=((hash(i+280)*W+t*4)%W),c=CLOUD();g.globalAlpha=.12*Math.sin(q*Math.PI);g.drawImage(c,x-90,H*.5+q*H*.3-35,180,70);}g.globalAlpha=1;}},
  {id:'bamboo',name:'竹林',times:['day','jade','gold','twilight','night','moon','frost'],weathers:['calm','motes','firefly','leaf','snow','sparkle'],skies:['clear','rays'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,P.tone('#6aa870')],[1,P.tone('#2a5a34')]]);g.fillRect(0,0,W,H);g.fillStyle=P.tone('#3c7a46');g.fillRect(0,H*.9,W,H);},
    live:(g,W,H,t,P)=>{for(let L=0;L<3;L++){const n=6+L*3,sp=3+L*6,col=P.tone(['#8cc48c','#5a9a62','#2e6a3c'][L]),dark=P.tone(['#5a9a62','#3c7a48','#1c4a2a'][L]),w=(3+L*3);for(let i=0;i<n;i++){const span=W+40,x=((i*span/n+hash(i+L*31)*20+t*sp)%span)-20,sway=Math.sin(t*.8+i+L)*2;g.fillStyle=col;g.beginPath();g.moveTo(x-w/2,H);g.lineTo(x-w/2+sway,-10);g.lineTo(x+w/2+sway,-10);g.lineTo(x+w/2,H);g.fill();g.fillStyle=dark;for(let k=0;k<6;k++){const y=H*(k/6+hash(i+L)*.1);g.fillRect(x-w/2+sway*(1-y/H),y,w,1.5+L*.5);}
        if(L>0)for(let k=0;k<4;k++){const y=H*(.1+k*.22+hash(i*3+k)*.1),d=hash(i+k*5)>.5?1:-1;g.fillStyle=col;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+d*w*3,y-w*2,x+d*w*5,y-w*1.5+Math.sin(t*2+k)*2);g.lineTo(x+d*w*4,y-w*.5);g.fill();}}}
      g.save();g.globalCompositeOperation='lighter';for(let k=0;k<3;k++){const x=W*(.2+.3*k)+Math.sin(t*.4+k)*W*.04,a=.1+.06*Math.sin(t*.7+k);g.fillStyle=linear(g,x,0,x+W*.1,H,[[0,al(P.glow,a)],[1,al(P.glow,0)]]);g.beginPath();g.moveTo(x-W*.02,-10);g.lineTo(x+W*.02,-10);g.lineTo(x+W*.16,H);g.lineTo(x+W*.08,H);g.fill();}g.restore();}},
  {id:'cave',name:'水晶の洞窟',times:['night','nebula','polar','moon','twilight','jade'],drama:true,weathers:['motes','sparkle','crystal','calm','bubble'],skies:['clear'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,'#06081a'],[.5,mix(P.sky[1],'#10142c',.7)],[1,'#0a0c20']]);g.fillRect(0,0,W,H);g.fillStyle='#0c0e22';for(let i=0;i<14;i++){const x=hash(i+290)*W,w=8+hash(i+291)*20,h=H*(.08+hash(i+292)*.3);g.beginPath();g.moveTo(x-w,-5);g.lineTo(x,h);g.lineTo(x+w,-5);g.fill();}
      ridge(g,W,H,H*.85,H*.15,3.3,'#0e1026',{jag:.8,f:2});ridge(g,W,H,H*.95,H*.1,6.6,'#090b1c',{jag:.6,f:1.5});g.fillStyle=mix(P.sky[1],'#101a40',.5);g.beginPath();g.ellipse(W*.5,H*.95,W*.3,H*.06,0,0,7);g.fill();},
    live:(g,W,H,t,P)=>{const cs=[['#a080ff',W*.2,H*.8,30,0],['#60d0ff',W*.5,H*.84,40,1],['#ff80d0',W*.78,H*.78,26,2],['#80ffd0',W*.35,H*.9,18,3],['#ffe080',W*.64,H*.92,22,4],['#c0a0ff',W*.9,H*.88,20,5]];for(const [c,x,y,s,i] of cs){const p=.6+.4*Math.sin(t*(1+i*.3)+i*2);glow(g,x,y-s*.6,s*1.6,c,p*.6);g.fillStyle=linear(g,x-s*.3,y,x+s*.3,y-s,[[0,c],[1,'#ffffff']]);
        for(const [dx,h,w] of [[0,1,.3],[-.35,.6,.2],[.35,.7,.22]]){g.beginPath();g.moveTo(x+dx*s-w*s,y);g.lineTo(x+dx*s-w*s*.3+dx*s*.3,y-h*s);g.lineTo(x+dx*s+w*s*.3+dx*s*.3,y-h*s);g.lineTo(x+dx*s+w*s,y);g.fill();}g.fillStyle=al('#ffffff',.5*p);g.beginPath();g.moveTo(x-s*.1,y);g.lineTo(x,y-s);g.lineTo(x+s*.05,y);g.fill();}
      for(let i=0;i<4;i++){const q=(t*.5+hash(i+300))%1,x=W*(.1+.8*hash(i+301)),y=H*.1+hash(i+302)*H*.3+q*q*H*.5;g.fillStyle=al('#a0c0ff',.8*(1-q*.5));g.fillRect(x,y,1.5,4+q*6);}g.save();g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const q=(t*.3+i/3)%1,r=q*W*.2;g.strokeStyle=al('#a0c0ff',.3*(1-q));g.lineWidth=1;g.beginPath();g.ellipse(W*(.3+.2*i),H*.95,r,r*.2,0,0,7);g.stroke();}g.restore();}},
  {id:'undersea',name:'海底の神殿',times:['day','jade','twilight','night','polar','frost'],weathers:['bubble','motes','calm','sparkle'],skies:['clear'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,mix(P.sky[2],'#40b0d0',.6)],[.5,mix(P.sky[1],'#1060a0',.6)],[1,mix(P.sky[0],'#061840',.7)]]);g.fillRect(0,0,W,H);ridge(g,W,H,H*.85,H*.1,4.4,mix(P.sky[0],'#0a2850',.6),{jag:.3});
      for(let i=0;i<5;i++){const q=i/4,x=W*(.08+.21*i),w=W*.03*(1+q*.3),h=H*(.28+.12*hash(i+310)),y=H*.86;g.fillStyle=mix(P.tone('#b8c8d0'),'#0c3060',.5);g.fillRect(x-w/2,y-h,w,h);g.fillRect(x-w,y-h-5,w*2,5);if(i!==2){g.fillRect(x-w,y-4,w*2,4);}}
      g.fillStyle=mix(P.tone('#b8c8d0'),'#0c3060',.5);g.fillRect(W*.05,H*.5,W*.9,5);g.fillStyle=P.tone('#2a8a60');for(let i=0;i<16;i++){const x=hash(i+320)*W,y=H*(.86+hash(i+321)*.1);for(let k=0;k<4;k++){g.fillRect(x+k*3,y-8-hash(i+k)*14,2,10+hash(i+k)*14);}}},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const x=W*(i/10)+Math.sin(t*.5+i)*W*.03,a=.08+.06*Math.sin(t*1.2+i*1.3);g.fillStyle=linear(g,x,0,x+W*.06,H*.9,[[0,al('#c0f0ff',a*2)],[1,al('#c0f0ff',0)]]);g.beginPath();g.moveTo(x-W*.015,-10);g.lineTo(x+W*.015,-10);g.lineTo(x+W*.1,H*.9);g.lineTo(x+W*.04,H*.9);g.fill();}
      for(let i=0;i<14;i++){const x=hash(i+330)*W,y=H*(.55+hash(i+331)*.4),w=10+hash(i+332)*20,a=.12*Math.max(0,Math.sin(t*1.5+i*2));g.strokeStyle=al('#e0ffff',a);g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+w/2,y-3,x+w,y);g.stroke();}g.restore();
      const per=14,q=(t%per)/per,dir=Math.floor(t/per)%2?-1:1;for(let i=0;i<12;i++){const fx=(dir>0?-40+q*(W+80):W+40-q*(W+80))-dir*i*14+Math.sin(t*2+i)*4,fy=H*.35+(i%4)*10+Math.sin(t*1.2+i)*6,s=5;g.fillStyle=mix(P.sky[2],'#ffffff',.3);g.beginPath();g.ellipse(fx,fy,s,s*.45,0,0,7);g.fill();g.beginPath();g.moveTo(fx-dir*s,fy);g.lineTo(fx-dir*s*1.8,fy-s*.5);g.lineTo(fx-dir*s*1.8,fy+s*.5);g.fill();}}},
  {id:'jelly',name:'くらげの海',times:['night','moon','nebula','polar','twilight'],weathers:['bubble','motes','calm','sparkle'],skies:['clear'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,mix(P.sky[1],'#082040',.6)],[1,'#040a1e']]);g.fillRect(0,0,W,H);g.fillStyle=radial(g,W*.5,-H*.2,H*.9,[[0,al(P.glow,.25)],[1,al(P.glow,0)]]);g.fillRect(0,0,W,H);},
    live:(g,W,H,t,P)=>{for(let i=0;i<7;i++){const k=hash(i+340),q=((t*.03*(.6+k)+hash(i+341))%1),x=W*(.1+.8*hash(i+342))+Math.sin(t*.5+i)*W*.04,y=H*1.1-q*H*1.3,r=10+16*hash(i+343),c=['#80d0ff','#ff90d0','#c0a0ff','#80ffd8'][i%4],pulse=1+.08*Math.sin(t*2+i);glow(g,x,y,r*2.2,c,.45);
        g.fillStyle=al(c,.55);g.beginPath();g.ellipse(x,y,r*pulse,r*.75/pulse,0,Math.PI,0);g.fill();g.fillStyle=al('#ffffff',.3);g.beginPath();g.ellipse(x-r*.3,y-r*.3,r*.3,r*.2,0,0,7);g.fill();g.strokeStyle=al(c,.6);g.lineWidth=1.2;for(let k=0;k<5;k++){const tx=x-r*.7+k*r*.35;g.beginPath();g.moveTo(tx,y);for(let s=1;s<=5;s++)g.lineTo(tx+Math.sin(t*2+s+k+i)*r*.15*s/5,y+s*r*.45);g.stroke();}}}},
  // 5. Space.
  {id:'space',name:'星の海',times:['night','nebula','polar','moon'],weathers:['sparkle','motes','calm','crystal'],skies:['clear','meteor','galaxy','halo'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,W,H,[[0,mix(P.sky[0],'#000000',.4)],[1,P.sky[0]]]);g.fillRect(0,0,W,H);for(const [x,y,r,c] of [[.2,.3,.35,P.glow],[.75,.7,.4,P.sky[1]],[.6,.2,.25,'#ff80c0']]){g.fillStyle=radial(g,x*W,y*H,r*W,[[0,al(c,.28)],[1,al(c,0)]]);g.fillRect(0,0,W,H);}
      const pl=(x,y,r,c1,c2,ring)=>{g.fillStyle=radial(g,x-r*.4,y-r*.4,r*1.5,[[0,c1],[1,c2]]);g.beginPath();g.arc(x,y,r,0,7);g.fill();if(ring){g.save();g.translate(x,y);g.rotate(-.4);g.strokeStyle=al('#ffffff',.5);g.lineWidth=r*.18;g.beginPath();g.ellipse(0,0,r*1.9,r*.5,0,0,7);g.stroke();g.restore();}};pl(W*.8,H*.25,W*.07,'#ffd8a0','#a05020',true);pl(W*.15,H*.75,W*.045,'#b0e0ff','#2040a0',false);},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<70;i++){const q=((t*.04*(.3+hash(i+350))+hash(i+351))%1),ang=hash(i+352)*TAU,r=q*q*Math.max(W,H)*.8,x=W*.5+Math.cos(ang)*r,y=H*.5+Math.sin(ang)*r,s=.5+q*2.5;g.fillStyle=al('#ffffff',.3+.7*q);g.fillRect(x,y,s,s);}g.restore();
      for(let i=0;i<3;i++){const a=t*.3+i*TAU/3;glow(g,W*.8+Math.cos(a)*W*.16,H*.25+Math.sin(a)*H*.05,3,'#ffffff',.8);}}},
  {id:'planet',name:'惑星の地平',times:['night','nebula','polar','moon','twilight'],weathers:['sparkle','motes','calm','crystal'],skies:['clear','meteor','galaxy','aurora'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,1);const px=W*.68,py=H*.42,r=W*.2;g.fillStyle=radial(g,px,py,r*2,[[0,al(P.glow,.3)],[1,al(P.glow,0)]]);g.fillRect(0,0,W,H);g.fillStyle=radial(g,px-r*.4,py-r*.4,r*1.6,[[0,'#f0e0ff'],[.5,mix(P.glow,'#8060c0',.5)],[1,'#201040']]);g.beginPath();g.arc(px,py,r,0,7);g.fill();
      g.save();g.beginPath();g.arc(px,py,r,0,7);g.clip();g.fillStyle=al('#ffffff',.12);for(let i=0;i<4;i++)g.fillRect(px-r,py-r*.5+i*r*.3,r*2,r*.08);g.restore();g.save();g.translate(px,py);g.rotate(-.3);g.strokeStyle=al('#ffffff',.55);g.lineWidth=r*.12;g.beginPath();g.ellipse(0,0,r*1.8,r*.4,0,.1,Math.PI-.1);g.stroke();g.restore();
      ridge(g,W,H,H*.8,H*.1,2.3,mix(P.sil[0],'#8890a0',.4),{jag:.3});ridge(g,W,H,H*.9,H*.08,7.3,mix(P.sil[1],'#606878',.4));g.fillStyle=al('#000000',.25);for(let i=0;i<8;i++){const x=hash(i+360)*W,y=H*(.88+hash(i+361)*.12),cr=6+hash(i+362)*14;g.beginPath();g.ellipse(x,y,cr,cr*.3,0,0,7);g.fill();g.fillStyle=al('#ffffff',.12);g.beginPath();g.ellipse(x,y-1.5,cr,cr*.3,0,Math.PI,0);g.fill();g.fillStyle=al('#000000',.25);}},
    live:(g,W,H,t,P)=>{const px=W*.68,py=H*.42,r=W*.2;g.save();g.translate(px,py);g.rotate(-.3);g.strokeStyle=al('#ffffff',.55);g.lineWidth=r*.12;g.beginPath();g.ellipse(0,0,r*1.8,r*.4,0,Math.PI+.1,TAU-.1);g.stroke();g.restore();for(let i=0;i<2;i++){const a=t*.4+i*Math.PI;glow(g,px+Math.cos(a)*r*1.8,py+Math.sin(a)*r*.4-Math.cos(a)*r*.5*.3,4,'#ffffff',.9);}
      g.save();g.globalCompositeOperation='lighter';for(let i=0;i<20;i++){const q=(t*.15+hash(i+370))%1,x=q*W,y=H*(.82+hash(i+371)*.15);g.fillStyle=al('#c0c8ff',.15*Math.sin(q*Math.PI));g.fillRect(x,y,20,1);}g.restore();}},
  {id:'meteors',name:'流星群の丘',times:['night','moon','nebula','polar','twilight'],drama:true,weathers:['calm','sparkle','motes','firefly'],skies:['clear','galaxy','aurora','moon'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,1);ridge(g,W,H,H*.8,H*.1,1.9,P.sil[1]);ridge(g,W,H,H*.9,H*.1,4.9,P.sil[2]);for(let i=0;i<9;i++)tree(g,hash(i+380)*W,H*(.84+hash(i+381)*.1),10+hash(i+382)*16,P.sil[2],P.sil[2],'pine');g.fillStyle=P.sil[2];g.fillRect(W*.7,H*.6,W*.03,H*.25);g.beginPath();g.arc(W*.715,H*.6,W*.03,0,7);g.fill();},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let j=0;j<7;j++){const per=1.6+hash(j+390),T=t+j*.7,sk=T%per;if(sk>.6)continue;const q=sk/.6,n=Math.floor(T/per)+j*11,sx=W*(.1+.8*hash(n))+q*(120+60*hash(n+1)),sy=H*.05+H*.4*hash(n+3)+q*(70+40*hash(n+2)),a=Math.sin(Math.PI*q),len=60+40*hash(n+4);
        g.strokeStyle=linear(g,sx-len,sy-len*.55,sx,sy,[[0,'#fff0'],[1,al('#ffffff',a)]]);g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(sx-len,sy-len*.55);g.lineTo(sx,sy);g.stroke();g.globalAlpha=a;g.drawImage(glowSprite('star','#cfe0ff'),sx-7,sy-7,14,14);g.globalAlpha=1;}g.restore();
      glow(g,W*.715,H*.6,W*.05,'#ffd080',.5+.2*Math.sin(t*3));}},
  {id:'moonroad',name:'月の道',times:['night','moon','polar','twilight'],weathers:['calm','motes','sparkle','feather'],skies:['clear','meteor','galaxy'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.6);orb(g,W,H,P,[.5,.3],Math.min(W,H)*.19);water(g,W,H,H*.6,P,0,{glitter:0});g.fillStyle=linear(g,0,H*.6,0,H,[[0,al('#fff8e0',.6)],[1,al('#fff8e0',.05)]]);g.beginPath();g.moveTo(W*.44,H*.6);g.lineTo(W*.56,H*.6);g.lineTo(W*.75,H);g.lineTo(W*.25,H);g.fill();mist(g,W,H*.52,H*.62,P.sky[2],.5);},
    live:(g,W,H,t,P)=>{g.save();g.globalCompositeOperation='lighter';for(let i=0;i<40;i++){const d=hash(i+400),y=H*.61+d*d*H*.39,w=W*.12+d*W*.5,x=W*.5+(hash(i+401)-.5)*w+Math.sin(t*1.5+i)*4,a=.35*Math.max(0,Math.sin(t*(1.5+d)+i*2));g.fillStyle=al('#fff4d0',a);g.fillRect(x,y,4+10*d,1+1.5*d);}g.restore();
      const per=40,q=(t%per)/per,bx=-30+q*(W+60),by=H*.62+Math.sin(t)*1.5,s=W*.03;g.fillStyle=P.sil[2];g.beginPath();g.moveTo(bx-s,by);g.lineTo(bx+s,by);g.lineTo(bx+s*.7,by+s*.4);g.lineTo(bx-s*.7,by+s*.4);g.fill();g.beginPath();g.moveTo(bx,by);g.lineTo(bx+s*.6,by-s*1.3);g.lineTo(bx,by-s*1.5);g.fill();}},
  {id:'railway',name:'星の鉄道',times:['night','moon','nebula','polar','twilight'],weathers:['calm','sparkle','motes','snow'],skies:['clear','galaxy','meteor','aurora'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,1);ridge(g,W,H,H*.85,H*.15,2.4,P.sil[1],{jag:.5});ridge(g,W,H,H*.95,H*.1,5.1,P.sil[2]);g.fillStyle=P.sil[2];g.beginPath();g.moveTo(-10,H*.62);g.quadraticCurveTo(W*.5,H*.3,W+10,H*.62);g.lineTo(W+10,H*.68);g.quadraticCurveTo(W*.5,H*.36,-10,H*.68);g.fill();
      for(let i=0;i<9;i++){const x=W*(i+.5)/9,y=H*.65-Math.sin((i+.5)/9*Math.PI)*H*.16;g.fillRect(x-2,y,4,H);}},
    live:(g,W,H,t,P)=>{const per=16,q=(t%per)/per;for(let i=0;i<7;i++){const k=q*1.3-i*.055;if(k<0||k>1)continue;const x=k*W,y=H*.64-Math.sin(k*Math.PI)*H*.16-5,w=W*.055,h=7;g.fillStyle=P.sil[2];g.fillRect(x-w/2,y-h,w,h);if(i===0){g.fillRect(x+w*.3,y-h-4,w*.2,4);const sm=PUFF();for(let s=0;s<5;s++){const sq=(t*.8+s/5)%1;g.globalAlpha=.4*(1-sq);g.drawImage(sm,x+w*.3-sq*20-6,y-h-6-sq*18,12+sq*14,12+sq*14);}g.globalAlpha=1;}
        else{g.fillStyle='#ffe8a0';for(let wnd=0;wnd<3;wnd++)g.fillRect(x-w*.35+wnd*w*.3,y-h+2,w*.18,3);glow(g,x,y-h/2,w*.6,'#ffd080',.35);}}
      g.save();g.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const k=(t*.1+i/8)%1,x=k*W,y=H*.64-Math.sin(k*Math.PI)*H*.16;g.fillStyle=al('#c0d8ff',.5);g.fillRect(x,y-1,6,1.5);}g.restore();}},
  // 6. Towns and festivals.
  {id:'torii',name:'千本鳥居',times:['day','dawn','sunset','gold','twilight','night','moon'],weathers:['calm','petal','leaf','motes','firefly'],skies:['clear','rays','lanterns','moon'],
    plate:(g,W,H,P)=>{g.fillStyle=linear(g,0,0,0,H,[[0,P.tone('#2a4a30')],[1,P.tone('#1a3020')]]);g.fillRect(0,0,W,H);g.fillStyle=radial(g,W*.5,H*.42,W*.25,[[0,al(P.sky[2],.95)],[1,al(P.sky[2],0)]]);g.fillRect(0,0,W,H);g.fillStyle=P.tone('#a89880');g.beginPath();g.moveTo(W*.46,H*.5);g.lineTo(W*.54,H*.5);g.lineTo(W*.8,H*1.1);g.lineTo(W*.2,H*1.1);g.fill();},
    live:(g,W,H,t,P)=>{for(let i=13;i>=0;i--){const q=((t*.09+i/14)%1),z=q*q,y=H*.5+z*H*.6,hw=W*.04+W*.42*z,h=H*.12+H*.75*z,c=mix(P.tone('#e84020'),P.sil[2],(1-q)*.5),pw=2+8*z;g.fillStyle=c;for(const s of [-1,1]){g.fillRect(W*.5+s*hw-pw/2,y-h,pw,h);g.fillStyle=al('#000000',.25);g.fillRect(W*.5+s*hw+pw*.1,y-h,pw*.4,h);g.fillStyle=c;}g.fillRect(W*.5-hw-pw,y-h,hw*2+pw*2,pw*1.2);g.fillStyle=mix(P.sil[2],'#000000',.3);g.fillRect(W*.5-hw-pw*1.5,y-h-pw*1.6,hw*2+pw*3,pw*1.3);g.fillStyle=c;g.fillRect(W*.5-hw,y-h*.8,hw*2,pw*.9);
        if(P.dark>.3&&i%2===0)glow(g,W*.5+hw*.8,y-h*.5,6+10*z,'#ffb050',.5*q);}
      g.save();g.globalAlpha=.25;const c=CLOUD();for(let i=0;i<3;i++)g.drawImage(c,((hash(i+410)*W+t*8)%(W+200))-180,H*.75+i*H*.08,220,80);g.restore();}},
  {id:'city',name:'夜の街',times:['twilight','night','moon','nebula','polar','sunset'],weathers:['calm','rain','motes','snow','sparkle'],skies:['clear','moon','fireworks','meteor'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.8);orb(g,W,H,P,[.8,.16]);for(let L=0;L<3;L++){const col=mix(P.sil[L],'#101428',.4),base=H*(.68+.12*L);g.fillStyle=col;for(let i=0;i<14;i++){const x=W*(i+hash(i+L*14)*.7)/14,w=(8+hash(i+L*5)*14)*(1+L*.4),h=(H*.08+hash(i+L*8)*H*.3)*(1+L*.2);g.fillRect(x-w/2,base-h,w,h+H);if(hash(i+L)>.6){g.fillRect(x-1,base-h-10*(1+L),2,10*(1+L));}
        for(let r=0;r<Math.floor(h/7);r++)for(let cc=0;cc<Math.floor(w/5);cc++)if(hash(i*31+r*7+cc+L*99)>.55){g.fillStyle=al(['#ffe0a0','#a0d0ff','#ffffff'][(r+cc)%3],.7);g.fillRect(x-w/2+2+cc*5,base-h+3+r*7,2.5,3);}g.fillStyle=col;}}g.fillStyle='#0a0c18';g.fillRect(0,H*.93,W,H);},
    live:(g,W,H,t,P)=>{for(let i=0;i<10;i++){const q=(t*.12*(1+hash(i+420)*.5)+hash(i+421))%1,dir=i%2?1:-1,x=dir>0?q*W:W-q*W,y=H*.935+(i%2)*4;g.fillStyle=dir>0?'#ffe8c0':'#ff5040';g.fillRect(x,y,4,1.5);glow(g,x+2,y,5,dir>0?'#ffe0a0':'#ff4030',.5);}
      for(let i=0;i<6;i++){const x=hash(i+430)*W,y=H*(.45+hash(i+431)*.25),on=Math.sin(t*(2+hash(i+432)*3)+i)>0;if(on)glow(g,x,y,5,['#ff4060','#40c0ff','#ffd040'][i%3],.9);}
      g.save();g.globalCompositeOperation='lighter';g.fillStyle=al(P.glow,.06+.03*Math.sin(t));g.fillRect(0,H*.55,W,H*.25);g.restore();}},
  {id:'festival',name:'夏祭り',times:['sunset','twilight','night','moon','gold'],party:true,weathers:['calm','motes','sparkle','firefly','petal'],skies:FEST,
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.9);ridge(g,W,H,H*.7,H*.15,3.7,P.sil[0]);for(let i=0;i<6;i++){const x=W*(i+.5)/6,w=W*.13,y=H*.85;g.fillStyle=P.tone(['#c03030','#3050b0','#c03030','#208040','#c03030','#3050b0'][i]);g.fillRect(x-w/2,y-H*.22,w,H*.06);g.fillStyle=P.sil[2];g.fillRect(x-w/2,y-H*.16,w,H*.16);g.fillStyle=al('#ffe0a0',.9);g.fillRect(x-w*.35,y-H*.13,w*.7,H*.07);}
      g.fillStyle=P.tone('#8a7a60');g.fillRect(0,H*.85,W,H);g.fillStyle=P.sil[2];for(let i=0;i<14;i++){const x=hash(i+440)*W,y=H*(.86+hash(i+441)*.12),s=6+hash(i+442)*8;g.beginPath();g.arc(x,y-s*1.6,s*.5,0,7);g.fill();g.fillRect(x-s*.5,y-s*1.2,s,s*1.3);}},
    live:(g,W,H,t,P)=>{for(let r=0;r<3;r++){const y0=H*(.3+.12*r),sag=H*.08;g.strokeStyle=al('#303040',.8);g.lineWidth=1;g.beginPath();for(let x=0;x<=W;x+=10)g.lineTo(x,y0+Math.sin(x/W*Math.PI)*sag);g.stroke();for(let i=0;i<9;i++){const x=W*(i+.5)/9,y=y0+Math.sin(x/W*Math.PI)*sag+Math.sin(t*1.5+i+r)*2,c=['#ff5050','#ffffff','#ffd040'][(i+r)%3];glow(g,x,y+6,10,c,.6);g.fillStyle=P.tone(c,.3);g.beginPath();g.ellipse(x,y+6,5,6.5,0,0,7);g.fill();g.fillStyle=al('#000000',.3);g.fillRect(x-2,y-1,4,1.5);g.fillRect(x-2,y+11.5,4,1.5);}}
      for(let i=0;i<6;i++){const x=W*(i+.5)/6;glow(g,x,H*.75,W*.08,'#ffd080',.35+.1*Math.sin(t*3+i));}}},
  {id:'lighthouse',name:'灯台の岬',times:['night','moon','twilight','polar','sunset','dawn'],weathers:['calm','rain','motes','feather','sparkle'],skies:['clear','moon','meteor','galaxy','birds'],
    plate:(g,W,H,P)=>{skyFill(g,W,H,P,.6);orb(g,W,H,P,[.25,.2]);water(g,W,H,H*.6,P,0,{glitter:0,top:mix(P.sky[2],'#2a6a9a',.5),bottom:mix(P.sky[0],'#0a2040',.5)});mist(g,W,H*.5,H*.62,P.sky[2],.5);ridge(g,W,H,H*.75,H*.2,6.1,P.sil[2],{jag:.5,f:.5});g.fillStyle=P.sil[2];g.fillRect(0,H*.8,W,H);const lx=W*.72,ly=H*.62;g.fillStyle=P.tone('#f0e8e0');g.beginPath();g.moveTo(lx-W*.03,ly);g.lineTo(lx-W*.02,ly-H*.3);g.lineTo(lx+W*.02,ly-H*.3);g.lineTo(lx+W*.03,ly);g.fill();
      g.fillStyle=P.tone('#c03030');g.fillRect(lx-W*.027,ly-H*.12,W*.054,H*.05);g.fillStyle=P.sil[2];g.fillRect(lx-W*.025,ly-H*.36,W*.05,H*.06);g.beginPath();g.moveTo(lx-W*.03,ly-H*.36);g.lineTo(lx,ly-H*.41);g.lineTo(lx+W*.03,ly-H*.36);g.fill();},
    live:(g,W,H,t,P)=>{const lx=W*.72,ly=H*.62-H*.33,a=t*.9;g.save();g.globalCompositeOperation='lighter';for(const d of [0,Math.PI]){const an=a+d,len=W*.9,sp=.12;g.fillStyle=linear(g,lx,ly,lx+Math.cos(an)*len,ly+Math.sin(an)*len*.25,[[0,al('#fff0c0',.5)],[1,al('#fff0c0',0)]]);g.beginPath();g.moveTo(lx,ly);g.lineTo(lx+Math.cos(an-sp)*len,ly+Math.sin(an-sp)*len*.25);g.lineTo(lx+Math.cos(an+sp)*len,ly+Math.sin(an+sp)*len*.25);g.fill();}g.restore();glow(g,lx,ly,12,'#fff0c0',.9);
      for(let i=0;i<8;i++){const q=(i/8+t*.08)%1,y=H*.61+q*q*H*.18,w=W*(.1+.25*q),x=hash(i+450)*W*.6;g.strokeStyle=al('#ffffff',.15+.3*q);g.lineWidth=1+q;g.beginPath();for(let k=0;k<=w;k+=6)g.lineTo(x+k,y+Math.sin(k*.08+t*2+i)*(1+2*q));g.stroke();}
      g.save();g.globalAlpha=.5;const pf=PUFF();for(let i=0;i<4;i++){const q=(t*.5+i/4)%1,s=20+30*q;g.globalAlpha=.4*(1-q);g.drawImage(pf,W*.15+i*W*.12-s/2,H*.78-q*H*.1-s/2,s,s);}g.restore();}},
];
for(const s of STAGES)s.theme??='both';

export function stageList(){return STAGES.map(s=>({id:s.id,name:s.name}));}
export const VARIANTS=1;
// A small seeded random generator, so the catalogue is the same on every device and in every version.
function seeded(seed){let a=seed>>>0;return n=>{a=a+0x6d2b79f5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n);};}
function shuffle(list,rand){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
// Every stage at each of its times, with VARIANTS different pairs of weather and sky event, shuffled so the numbers mix the stages.
function catalogue(){const rand=seeded(20261027),all=[];
  for(const stage of STAGES)for(const time of TIMES.filter(t=>stage.times.includes(t.id))){const ws=WEATHERS.filter(w=>stage.weathers.includes(w.id)),ks=SKIES.filter(s=>stage.skies.includes(s.id)&&skyFits(s,time)),pairs=[];
    for(const w of ws)for(const k of ks)pairs.push([w,k]);const picked=[];for(const [w,k] of shuffle(pairs,rand)){if(picked.length>=VARIANTS)break;if(picked.some(([pw,pk])=>pw===w||pk===k))continue;picked.push([w,k]);}
    for(const [weather,sky] of picked)all.push({stage,time,weather,sky});}
  return shuffle(all,rand).map((c,i)=>({...c,no:i+1,name:`${c.time.name}の${c.stage.name}`+(c.weather.n?`・${c.weather.name}`:'')+(c.sky.id!=='clear'?`と${c.sky.name}`:''),
    machines:['aurora','astral'].filter(m=>(c.time.theme==='both'||c.time.theme===m)&&(c.stage.theme==='both'||c.stage.theme===m)),party:!!(c.sky.party||c.stage.party),drama:!!(c.stage.drama||c.sky.drama&&c.time.dark>=.3)}));}
export const SCENES=catalogue();
export const SCENE_COUNT=SCENES.length;

// --- Which scene is on screen. b is a backdrop made by createBackdrop; t is the background clock (it runs faster while spinning). ---
export const SHOT_LEN=7,FADE=1.1,MIN_SHOW=4;
// Scenes each pool picks from: normal (idle and draws), reach (dark, dramatic skies), bonus (festive skies).
export const POOLS={normal:()=>true,reach:s=>s.drama,bonus:s=>s.party};
export function deckFor(machine){return SCENES.filter(s=>s.machines.includes(machine));}
// Shuffled so that two scenes of the same stage are not next to each other (where another scene can take the place).
function spread(deck){const a=deck.slice();for(let i=1;i<a.length;i++){if(a[i].stage!==a[i-1].stage)continue;const j=a.findIndex((s,k)=>k>i&&s.stage!==a[i-1].stage&&(k+1>=a.length||a[k+1].stage!==s.stage));if(j>0)[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createBackdrop(machine,rand=n=>Math.floor(Math.random()*n)){const deck=shuffle(deckFor(machine),rand),decks={};
  for(const pool of Object.keys(POOLS))decks[pool]=spread(deck.filter(POOLS[pool]));return {machine,decks,next:{normal:0,reach:0,bonus:0},pool:'normal',scene:null,at:0,len:SHOT_LEN,fade:0,prev:null,prevAt:0,prevLen:SHOT_LEN,draw:null};}
// Next scene of a pool, going through the whole shuffled deck before any scene comes back. Two stages in a row are avoided too.
function take(b,pool){const deck=b.decks[pool];let s=deck[b.next[pool]++%deck.length];if(s.stage===b.scene?.stage&&deck.length>1)s=deck[b.next[pool]++%deck.length];return s;}
// phase: 'idle' | 'draw' | 'reach' | 'bonus'. draw: anything that changes at the start of each draw (a new draw shows a new scene).
// timed:false (prefers-reduced-motion) changes scenes only on those events, with a cut instead of a cross-fade. pin: a scene number to keep.
export function stepBackdrop(b,t,{phase='idle',draw=null,timed=true,pin=null}={}){if(b.stage&&(phase!=='draw'&&phase!=='reach'||draw!==b.draw))b.stage=null;const pool=b.stage??(phase==='bonus'||phase==='reach'?phase:'normal');let fade=null;
  if(pin){if(b.scene?.no!==pin){b.scene=SCENES[pin-1]??SCENES[0];b.at=t;b.fade=0;b.prev=null;}return b;}
  if(!b.scene)fade=0;else if(pool!==b.pool)fade=pool==='normal'?FADE:.5;else if(draw!==b.draw&&draw!=null&&t-b.at>=MIN_SHOW)fade=.6;else if(timed&&t-b.at>=b.len)fade=FADE;
  b.draw=draw;if(fade===null)return b;
  b.prev=b.scene;b.prevAt=b.at;b.prevLen=b.len;b.pool=pool;b.scene=take(b,pool);b.at=t;b.len=pool==='normal'?SHOT_LEN:SHOT_LEN*1.6;b.fade=timed?fade:0;return b;}
// ステージチェンジ予告: cuts to a scene of the pool (reach or bonus) and keeps that pool until the draw ends.
export function stageChange(b,t,pool){b.stage=pool;b.prev=b.scene;b.prevAt=b.at;b.prevLen=b.len;b.pool=pool;b.scene=take(b,pool);b.at=t;b.len=SHOT_LEN*1.6;b.fade=.3;return b;}
// What to draw at time t: the scene and how far its camera move is (u), and the previous scene while the new one fades in (mix < 1).
export function backdropView(b,t){const mix=b.fade>0?ease(clamp((t-b.at)/b.fade)):1;
  return {scene:b.scene,u:clamp((t-b.at)/b.len,0,1.3),prev:mix<1?b.prev:null,prevU:clamp((t-b.prevAt)/b.prevLen,0,1.3),mix};}

// --- Browser side: the picture of a scene. ---
// One sprite per weather, drawn 32 px wide and scaled to each particle's size.
const PAINT={
  petal:g=>{g.fillStyle=linear(g,4,8,28,24,[[0,'#fff3fa'],[.5,'#ffb6da'],[1,'#e86aa8']]);g.beginPath();g.ellipse(16,16,14,8,0,0,7);g.fill();g.fillStyle='#ffffff88';g.beginPath();g.ellipse(12,13,6,2.6,-.3,0,7);g.fill();},
  snow:g=>{g.fillStyle=radial(g,16,16,16,[[0,'#ffffff'],[.45,'#ffffffcc'],[1,'#ffffff00']]);g.fillRect(0,0,32,32);},
  motes:g=>{g.fillStyle=radial(g,16,16,16,[[0,'#ffffff'],[.25,'#ffd6f0'],[1,'#ffb6e000']]);g.fillRect(0,0,32,32);},
  firefly:g=>{g.fillStyle=radial(g,16,16,16,[[0,'#ffffe0'],[.2,'#d8ff70'],[1,'#a0ff4000']]);g.fillRect(0,0,32,32);},
  feather:g=>{g.save();g.translate(16,16);g.rotate(-.5);g.fillStyle=linear(g,-14,0,14,0,[[0,'#ffffff'],[1,'#dfe8ff']]);g.beginPath();g.moveTo(-15,0);g.quadraticCurveTo(-2,-8,15,-1);g.quadraticCurveTo(-2,7,-15,0);g.fill();g.strokeStyle='#b8c4e0';g.lineWidth=1;g.beginPath();g.moveTo(-15,0);g.lineTo(15,-1);g.stroke();g.restore();},
  sparkle:g=>{g.fillStyle=radial(g,16,16,16,[[0,'#ffffffcc'],[1,'#fff0']]);g.fillRect(0,0,32,32);g.fillStyle='#ffffff';g.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?2.2:15;g.lineTo(16+Math.cos(a)*r,16+Math.sin(a)*r);}g.fill();},
  bubble:g=>{g.strokeStyle='#e8f6ffcc';g.lineWidth=1.6;g.fillStyle=radial(g,16,16,14,[[0,'#bfe6ff10'],[.85,'#bfe6ff30'],[1,'#ffffff60']]);g.beginPath();g.arc(16,16,13,0,7);g.fill();g.stroke();g.fillStyle='#ffffffcc';g.beginPath();g.ellipse(11,10,4,2.4,-.6,0,7);g.fill();},
  rain:g=>{g.fillStyle=linear(g,0,16,32,16,[[0,'#fff0'],[.8,'#d8ecffaa'],[1,'#ffffff']]);g.fillRect(0,14.5,32,3);},
  crystal:g=>{g.fillStyle=linear(g,8,4,24,28,[[0,'#ffffff'],[.4,'#a8e4ff'],[1,'#5a7cff']]);g.beginPath();g.moveTo(16,2);g.lineTo(25,16);g.lineTo(16,30);g.lineTo(7,16);g.closePath();g.fill();g.fillStyle='#ffffff99';g.beginPath();g.moveTo(16,2);g.lineTo(19,16);g.lineTo(16,30);g.lineTo(13,16);g.fill();},
  leaf:g=>{g.fillStyle=linear(g,4,8,28,24,[[0,'#ffd36a'],[.5,'#ff8a3c'],[1,'#d8402a']]);g.beginPath();g.moveTo(3,16);g.quadraticCurveTo(16,2,29,16);g.quadraticCurveTo(16,30,3,16);g.fill();g.strokeStyle='#a8301c';g.lineWidth=1;g.beginPath();g.moveTo(3,16);g.lineTo(29,16);g.stroke();},
  ember:g=>{g.fillStyle=radial(g,16,16,16,[[0,'#ffffd0'],[.2,'#ffa040'],[1,'#ff400000']]);g.fillRect(0,0,32,32);},
};
// Particles of one weather in a w×h box. count scales the number (state and gentle mode).
function weather(g,wx,w,h,t,count){if(!wx.n)return;const img=sprite(wx.id,32,32,PAINT[wx.id]),n=Math.round(wx.n*count),m=30;g.save();if(wx.light)g.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const r1=hash(i+1),r2=hash(i+31),r3=hash(i+71),s=lerp(wx.size,r3);let px,py,rot=0,sy=1,a=.85;
    if(wx.still){px=r1*w;py=r2*h*.85;const tw=.5+.5*Math.sin(t*(1.5+r3*2)+i*2.3);a=tw;rot=t*.3+i;}
    else if(wx.wander){px=w*(r1+.08*Math.sin(t*(.3+r3*.4)+i*3));py=h*(.25+.7*r2+.06*Math.sin(t*(.4+r1*.3)+i));a=.35+.65*Math.max(0,Math.sin(t*(1+r2)+i*1.7));}
    else{const v=lerp(wx.fall,r1),cycle=(h+2*m)/Math.abs(v),ph=(t+r2*cycle)%cycle,d=v>0?ph*v:h+2*m+ph*v;py=d-m;
      px=((r3*w*1.7+ph*lerp(wx.drift,r2)+Math.sin(t*1.4+i)*(wx.sway??0))%(w+2*m)+w+2*m)%(w+2*m)-m;
      if(wx.spin)rot=t*wx.spin*Math.PI*(r1>.5?1:-1)+i;if(wx.flip)sy=Math.max(.15,Math.abs(Math.cos(t*2.4+i*1.7)));
      if(wx.streak)rot=Math.atan2(v,lerp(wx.drift,r2));if(wx.twinkle)a=.45+.4*Math.sin(t*2+i*2.1);if(wx.light&&!wx.twinkle)a=.75;}
    g.globalAlpha=clamp(a);g.save();g.translate(px,py);g.rotate(rot);g.scale(1,sy);g.drawImage(img,-s/2,-s/2,s,s);g.restore();}
  g.restore();}
const SPARKS=['#ffd36a','#ff7cc4','#9fe8ff','#b9a4ff','#ffffff','#7fffb0'];
// The event in the sky. glow: the time's light colour.
function sky(g,id,w,h,t,glow,dark){g.save();g.globalCompositeOperation='lighter';
  if(id==='rays'){g.translate(w*.5,-30);g.rotate(Math.sin(t*.2)*.35);for(let k=-2;k<=2;k++){g.fillStyle=linear(g,0,0,0,h*1.2,[[0,glow+'44'],[1,glow+'00']]);g.beginPath();g.moveTo(0,0);g.lineTo(k*70-22,h*1.3);g.lineTo(k*70+22,h*1.3);g.closePath();g.fill();}}
  else if(id==='meteor'){for(let j=0;j<2;j++){const T=t+j*1.7,sk=T%3.4;if(sk>.9)continue;const q=sk/.9,n=Math.floor(T/3.4)+j*7,sx=w*(.15+.6*hash(n))+q*160,sy=12+h*.1*hash(n+3)+q*70,a=Math.sin(Math.PI*q);
    g.strokeStyle=linear(g,sx-90,sy-40,sx,sy,[[0,'#fff0'],[1,`rgba(255,250,255,${a})`]]);g.lineWidth=2.2;g.lineCap='round';g.beginPath();g.moveTo(sx-90,sy-40);g.lineTo(sx,sy);g.stroke();g.globalAlpha=a;const s=glowSprite('star','#cfe0ff');g.drawImage(s,sx-8,sy-8,16,16);g.globalAlpha=1;}}
  else if(id==='aurora'){for(let k=0;k<3;k++){const base=h*(.12+.1*k),hue=k===1?'150,120,255':'90,255,180';g.fillStyle=linear(g,0,base-10,0,base+60,[[0,`rgba(${hue},0)`],[.3,`rgba(${hue},.32)`],[1,`rgba(${hue},0)`]]);g.beginPath();
    for(let x=0;x<=w+8;x+=8)g.lineTo(x,base+Math.sin(x*.012+t*.45+k*2)*14+Math.sin(x*.031-t*.3+k)*6);for(let x=w+8;x>=0;x-=8)g.lineTo(x,base+70+Math.sin(x*.01+t*.35+k)*18);g.closePath();g.fill();}}
  else if(id==='moon'){const mx=w*(.8-.04*Math.sin(t*.05)),my=h*.2,r=Math.min(w,h)*.1;g.fillStyle=radial(g,mx,my,r*4,[[0,'rgba(255,248,220,.5)'],[.3,'rgba(220,230,255,.18)'],[1,'rgba(200,220,255,0)']]);g.fillRect(mx-r*4,my-r*4,r*8,r*8);
    g.globalCompositeOperation='source-over';g.fillStyle=radial(g,mx-r*.3,my-r*.3,r*1.3,[[0,'#fffdf2'],[1,'#e8dcb8']]);g.beginPath();g.arc(mx,my,r,0,7);g.fill();g.fillStyle='#d6c8a033';for(const [dx,dy,cr] of [[-.3,.1,.22],[.25,-.2,.16],[.1,.35,.12]]){g.beginPath();g.arc(mx+dx*r,my+dy*r,cr*r,0,7);g.fill();}}
  else if(id==='rainbow'){const a=.14+.06*Math.sin(t*.3),cx=w*.55,cy=h*1.15,R=w*.62;['#ff4040','#ff9a30','#ffe040','#50e060','#40a8ff','#5a5cff','#b050ff'].forEach((c,i)=>{g.strokeStyle=c;g.globalAlpha=a;g.lineWidth=5;g.beginPath();g.arc(cx,cy,R-i*5,Math.PI*1.05,Math.PI*1.95);g.stroke();});}
  else if(id==='lanterns'){const s=glowSprite('lantern','#ffb050');for(let i=0;i<10;i++){const v=8+hash(i+40)*8,cycle=(h+40)/v,ph=(t+hash(i+41)*cycle)%cycle,py=h+20-ph*v,px=w*hash(i+42)+Math.sin(t*.6+i)*6,sz=8+hash(i+43)*6,fl=.75+.25*Math.sin(t*5+i*3);
    g.globalAlpha=fl;g.drawImage(s,px-sz*1.5,py-sz*1.5,sz*3,sz*3);g.globalCompositeOperation='source-over';g.fillStyle=linear(g,0,py-sz*.6,0,py+sz*.6,[[0,'#ffe0a0'],[1,'#ff8a30']]);g.beginPath();g.roundRect(px-sz*.35,py-sz*.5,sz*.7,sz,sz*.15);g.fill();g.globalCompositeOperation='lighter';}}
  else if(id==='birds'){g.globalCompositeOperation='source-over';const per=9,k=Math.floor(t/per),q=(t%per)/per,dir=hash(k)>.5?1:-1,y0=h*(.12+.25*hash(k+1));g.strokeStyle=dark>.2?'#1a1830cc':'#2a3048bb';g.lineWidth=1.6;g.lineCap='round';
    for(let i=0;i<7;i++){const row=Math.ceil(i/2),side=i%2?1:-1,bx=(dir>0?-60+q*(w+120):w+60-q*(w+120))-dir*row*16,by=y0+side*row*9+Math.sin(t*1.5+i)*2,f=Math.sin(t*9+i*1.3)*4;g.beginPath();g.moveTo(bx-6,by-f);g.quadraticCurveTo(bx-3,by-2,bx,by);g.quadraticCurveTo(bx+3,by-2,bx+6,by-f);g.stroke();}}
  else if(id==='fireworks'){const every=1.7;for(let k=Math.floor(t/every)-1;k<=Math.floor(t/every);k++){const p=t-k*every;if(p<0||p>1.4)continue;const cx=w*(.15+.7*hash(k)),cy=h*(.15+.3*hash(k+5)),col=SPARKS[Math.floor(hash(k+9)*SPARKS.length)],R=(30+30*hash(k+2))*(1-Math.exp(-3.5*p)),a=1-p/1.4,s=glowSprite('spark'+col,col);
    for(let i=0;i<18;i++){const an=i/18*Math.PI*2;g.globalAlpha=a;g.drawImage(s,cx+Math.cos(an)*R-4,cy+Math.sin(an)*R+p*p*12-4,8,8);}}}
  else if(id==='galaxy'){const band=sprite(`galaxy${w}x${h}`,w,h,c=>{c.save();c.translate(w*.5,h*.4);c.rotate(-.5);c.fillStyle=linear(c,0,-h*.25,0,h*.25,[[0,'rgba(170,150,255,0)'],[.5,'rgba(220,200,255,.28)'],[1,'rgba(170,150,255,0)']]);c.fillRect(-w,-h*.25,w*2,h*.5);
      for(let i=0;i<260;i++){const x=(hash(i+900)-.5)*w*1.6,y=(hash(i+901)+hash(i+902)-1)*h*.18;c.fillStyle=`rgba(255,250,255,${.25+.6*hash(i+903)})`;c.fillRect(x,y,.9,.9);}c.restore();});g.globalAlpha=.75+.15*Math.sin(t*.4);g.drawImage(band,0,0,w,h);}
  else if(id==='halo'){const cx=w*.36,cy=h*.3;for(let k=0;k<3;k++){const p=((t/2.4+k/3)%1),r=20+p*w*.6;g.strokeStyle=`rgba(255,226,150,${.28*(1-p)})`;g.lineWidth=2.5*(1-p)+1;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();}
    g.fillStyle=radial(g,cx,cy,w*.25,[[0,'rgba(255,240,190,.2)'],[1,'rgba(255,240,190,0)']]);g.fillRect(0,0,w,h);}
  g.restore();}
// The illustration framed by a camera shot: zoomed from z0 to z1 over u = 0…1 and panned by dx, kept inside the picture.
function shot(g,img,w,h,[fx,fy,z0,z1,dx],u){const z=z0+(z1-z0)*u,s=Math.max(w/img.width,h/img.height)*z,dw=img.width*s,dh=img.height*s,cx=clamp(fx+dx*(u-.5));
  g.drawImage(img,Math.min(0,Math.max(w-dw,w/2-cx*dw)),Math.min(0,Math.max(h-dh,h/2-fy*dh)),dw,dh);}
// The plate of a stage (what does not move) at a time, cached per size. Stages drawn from painted pieces wait for the illustration.
const OVER=1.12;
function plate(stage,P,W,H,img){return sprite(`plate|${stage.id}|${P.id}|${W}x${H}|${img?1:0}`,W,H,g=>stage.plate(g,W,H,P,img));}
// One scene into a w×h canvas: the stage under a slow camera (zoom and pan over u), its colour grade for the picture stages,
// the stars, the sky event and the particles on top.
function paintScene(g,img,sc,u,w,h,t,count){const {time:P,stage}=sc;g.globalCompositeOperation='source-over';g.globalAlpha=1;g.fillStyle='#0b1022';g.fillRect(0,0,w,h);
  if(stage.shot){if(img)shot(g,img,w,h,stage.shot,u);for(let i=0;i<5;i++){const k=.7+(i%3)*.3,cw=180*k,span=w+cw,px=span-((t*(14+i*7)+i*137)%span)-cw*.5,py=18+i*26+Math.sin(t*.3+i)*5;g.globalAlpha=(.32+.06*(i%3))*(1-P.dark*.65);g.drawImage(CLOUD(),px-cw/2,py-35*k,cw,70*k);}g.globalAlpha=1;
    if(P.mul){g.globalCompositeOperation='multiply';g.fillStyle=linear(g,0,0,0,h,[[0,P.mul[0]],[1,P.mul[1]]]);g.fillRect(0,0,w,h);}
    g.globalCompositeOperation='lighter';g.fillStyle=radial(g,P.sun[0]*w,P.sun[1]*h,Math.max(w,h)*.7,[[0,al(P.glow,.25)],[1,al(P.glow,0)]]);g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';}
  else{const W=Math.round(w*OVER),H=Math.round(h*OVER),z=1+.06*u,dx=(u-.5)*(W-w)*.6;g.save();g.translate(w/2,h/2);g.scale(z,z);g.translate(-W/2-dx,-H/2);g.drawImage(plate(stage,P,W,H,img),0,0,W,H);stage.live(g,W,H,t,P,img);g.restore();
    g.globalCompositeOperation='lighter';g.fillStyle=radial(g,P.sun[0]*w,P.sun[1]*h,Math.max(w,h)*.8,[[0,al(P.glow,.16)],[1,al(P.glow,0)]]);g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';g.drawImage(sprite(`vignette${w}x${h}`,w,h,c=>{c.fillStyle=radial(c,w/2,h/2,Math.max(w,h)*.72,[[0,'#00000000'],[.6,'#00000000'],[1,'#00000066']]);c.fillRect(0,0,w,h);}),0,0,w,h);}
  if(P.stars&&stage.shot)stars(g,w,h,t,P.stars);sky(g,sc.sky.id,w,h,t,P.glow,P.dark);weather(g,sc.weather,w,h,t,count);
  if(stage.shot){for(let i=0;i<2;i++){const cw=180*2.1,span=w+cw,px=span-((t*(46+i*20)+i*260)%span)-cw*.5,py=h-20-i*14;g.globalAlpha=.4*(1-P.dark*.65);g.drawImage(CLOUD(),px-cw/2,py-70,cw,147);}g.globalAlpha=1;}}
const layers=[];function layer(i,w,h){const c=layers[i]??=canvas(w,h);if(c.width!==Math.ceil(w*DPR)||c.height!==Math.ceil(h*DPR)){c.width=Math.ceil(w*DPR);c.height=Math.ceil(h*DPR);}const g=c.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);return [c,g];}
// Draws the backdrop b into the box at x,y. level: how busy the state is (idle .8 … bonus 1.4), which sets the number of particles.
export function drawBackdrop(ctx,img,b,{x,y,w,h,t,level=1,gentle=true,reduced=false,dpr=1}){if(DPR!==dpr){DPR=dpr;sprites.clear();}const v=backdropView(b,t),count=reduced?.6:level*(gentle?.75:1),time=reduced?0:t;
  const draw=(i,sc,u,alpha)=>{const [c,g]=layer(i,w,h);paintScene(g,img,sc,reduced?.5:u,w,h,time,count);ctx.globalAlpha=alpha;ctx.drawImage(c,x,y,w,h);ctx.globalAlpha=1;};
  if(v.prev)draw(1,v.prev,v.prevU,1);draw(0,v.scene,v.u,v.mix);
  if(v.prev&&!gentle&&!reduced&&b.fade>=.6){const sx=x-w*.4+w*1.8*v.mix;ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=linear(ctx,sx-90,y,sx+90,y+h*.3,[[0,'#fff0'],[.5,`rgba(255,240,250,${.55*Math.sin(Math.PI*v.mix)})`],[1,'#fff0']]);ctx.fillRect(x,y,w,h);ctx.restore();}}

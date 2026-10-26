// LCD background scenes, like the many background stages of a real machine. A scene is one camera shot of the LCD illustration
// (the floating sky castle) with a time of day (colour grade), a weather (falling or rising particles) and an event in the sky.
// SCENES holds SCENE_COUNT combinations of the tables below, picked with a fixed seed, so every scene keeps its number and name.
// Each machine shuffles its own deck (AURORA leans to warm, pink skies and ASTRAL to night and starry ones) and the same scenes
// are reused in every state: they cycle while idle, change at the start of a draw, a reach switches to a darker, more dramatic
// scene and a bonus to a festive one. Scenes never hint at a result: they change on what is already on screen.
// Gentle mode draws fewer particles and no light sweep between scenes; prefers-reduced-motion shows still scenes.

// shot: [focus x, focus y, zoom from, zoom to, pan] over the illustration (assets/lcd-illustration.jpg).
export const PLACES=[
  {id:'castle',name:'天空城',shot:[.3,.42,1.12,1.4,.12]},
  {id:'isles',name:'浮島',shot:[.72,.36,1.38,1.12,-.16]},
  {id:'sea',name:'雲海',shot:[.5,.7,1.18,1.48,.1]},
  {id:'muse',name:'女神',shot:[.86,.48,1.6,1.3,-.08]},
  {id:'sky',name:'大空',shot:[.5,.3,1.04,1.22,0]},
  {id:'gate',name:'光の門',shot:[.28,.24,1.75,2.1,.04]},
  {id:'falls',name:'滝',shot:[.08,.5,1.5,1.3,.12]},
  {id:'lake',name:'天空の湖',shot:[.38,.62,1.5,1.75,-.1]},
  {id:'spires',name:'尖塔',shot:[.55,.16,1.6,1.4,-.12]},
  {id:'crystal',name:'水晶の島',shot:[.08,.68,1.75,1.95,.08]},
];
// mul: colours the picture is multiplied by (top, bottom). glow: [colour, strength, x, y] of a soft light added on top.
// dark: how dark the sky is (0 day … 1 night); stars: strength of the star field; theme: the machine whose deck it belongs to.
export const TIMES=[
  {id:'day',name:'昼',theme:'both',dark:0,mul:null,glow:['#fff4e0',.18,.3,.1]},
  {id:'dawn',name:'朝焼け',theme:'aurora',dark:0,mul:['#ffe2d2','#d6e0ff'],glow:['#ffb48c',.35,.5,.95]},
  {id:'sunset',name:'夕焼け',theme:'aurora',dark:.3,mul:['#ff9c70','#9a5c9e'],glow:['#ffa040',.42,.5,.78]},
  {id:'twilight',name:'黄昏',theme:'both',dark:.5,mul:['#7a66c4','#ffa0bc'],glow:['#ff80b0',.3,.5,1],stars:.4},
  {id:'night',name:'夜',theme:'astral',dark:1,mul:['#34449a','#5468b8'],glow:['#5070ff',.2,.3,.3],stars:1},
  {id:'moon',name:'月夜',theme:'astral',dark:.9,mul:['#5878c4','#34488c'],glow:['#c0d8ff',.25,.78,.15],stars:.7},
  {id:'rose',name:'桜色',theme:'aurora',dark:0,mul:['#ffcae2','#ffe2f0'],glow:['#ff90c8',.3,.5,.4]},
  {id:'gold',name:'黄金',theme:'aurora',dark:.1,mul:['#ffe2a4','#ffbe74'],glow:['#ffd060',.4,.3,.35]},
  {id:'nebula',name:'星雲',theme:'astral',dark:1,mul:['#5a3a98','#2c2068'],glow:['#c060ff',.32,.6,.4],stars:1},
  {id:'polar',name:'極夜',theme:'astral',dark:1,mul:['#24506e','#2e5482'],glow:['#40ffc0',.2,.5,.2],stars:.8},
  {id:'frost',name:'白銀',theme:'astral',dark:0,mul:['#deecff','#bacef6'],glow:['#ffffff',.3,.5,.6]},
  {id:'jade',name:'翡翠',theme:'both',dark:.1,mul:['#bcf6de','#74bcb4'],glow:['#80ffd0',.25,.5,.5]},
];
// Particles. fall: speed range in px per second (negative rises); drift: sideways speed; sway: wobble; spin: turns per second;
// flip: the particle tumbles (petals, leaves); still: it stays in place and twinkles; wander: it floats around (fireflies).
export const WEATHERS=[
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
];
// dark: the sky must be at least this dark; light: at most this dark. party: used in bonus scenes; drama: used in reach scenes.
export const SKIES=[
  {id:'rays',name:'光の筋',party:true},
  {id:'meteor',name:'流れ星',drama:true},
  {id:'aurora',name:'オーロラ',dark:.5,drama:true},
  {id:'moon',name:'満月',dark:.3},
  {id:'rainbow',name:'虹',light:.1},
  {id:'lanterns',name:'灯籠',dark:.3,party:true},
  {id:'birds',name:'鳥の群れ',light:.5},
  {id:'fireworks',name:'花火',dark:.3,party:true},
  {id:'galaxy',name:'天の川',dark:.9,drama:true},
  {id:'halo',name:'光輪',party:true,drama:true},
];
export const SCENE_COUNT=400;
export function skyFits(sky,time){return time.dark>=(sky.dark??0)&&time.dark<=(sky.light??1);}
// A small seeded random generator, so the catalogue is the same on every device and in every version.
function seeded(seed){let a=seed>>>0;return n=>{a=a+0x6d2b79f5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n);};}
function shuffle(list,rand){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
// Each time of day gets an even share of scenes: its valid combinations are shuffled and taken in order while no place, weather
// or sky is used more than its fair share within that time. The times are then interleaved, so the numbers mix them.
function catalogue(){const rand=seeded(20261026),per=TIMES.map(time=>{const q=Math.ceil(SCENE_COUNT/TIMES.length),skies=SKIES.filter(sky=>skyFits(sky,time)),all=[];
    for(const place of PLACES)for(const weather of WEATHERS)for(const sky of skies)all.push({place,time,weather,sky});
    const cap={place:Math.ceil(q/PLACES.length),weather:Math.ceil(q/WEATHERS.length),sky:Math.ceil(q/skies.length)},used=new Map(),picked=[];
    for(const c of shuffle(all,rand)){if(picked.length>=q)break;if(Object.keys(cap).some(k=>(used.get(c[k])??0)>=cap[k]))continue;for(const k of Object.keys(cap))used.set(c[k],(used.get(c[k])??0)+1);picked.push(c);}
    return picked;}),mixed=[];
  for(let i=0;mixed.length<SCENE_COUNT;i++)for(const list of per)if(i<list.length&&mixed.length<SCENE_COUNT)mixed.push(list[i]);
  return mixed.map((c,i)=>({...c,no:i+1,name:`${c.time.name}の${c.place.name}・${c.weather.name}と${c.sky.name}`,
    machines:c.time.theme==='both'?['aurora','astral']:[c.time.theme],party:!!c.sky.party,drama:!!c.sky.drama&&c.time.dark>=.3}));}
export const SCENES=catalogue();

// --- Which scene is on screen. b is a backdrop made by createBackdrop; t is the background clock (it runs faster while spinning). ---
export const SHOT_LEN=7,FADE=1.1,MIN_SHOW=4;
// Scenes each pool picks from: normal (idle and draws), reach (dark, dramatic skies), bonus (festive skies).
export const POOLS={normal:()=>true,reach:s=>s.drama,bonus:s=>s.party};
export function deckFor(machine){return SCENES.filter(s=>s.machines.includes(machine));}
export function createBackdrop(machine,rand=n=>Math.floor(Math.random()*n)){const deck=shuffle(deckFor(machine),rand),decks={};
  for(const pool of Object.keys(POOLS))decks[pool]=deck.filter(POOLS[pool]);return {machine,decks,next:{normal:0,reach:0,bonus:0},pool:'normal',scene:null,at:0,len:SHOT_LEN,fade:0,prev:null,prevAt:0,prevLen:SHOT_LEN,draw:null};}
// Next scene of a pool, going through the whole shuffled deck before any scene comes back.
function take(b,pool){const deck=b.decks[pool];let s=deck[b.next[pool]++%deck.length];if(s===b.scene&&deck.length>1)s=deck[b.next[pool]++%deck.length];return s;}
// phase: 'idle' | 'draw' | 'reach' | 'bonus'. draw: anything that changes at the start of each draw (a new draw shows a new scene).
// timed:false (prefers-reduced-motion) changes scenes only on those events, with a cut instead of a cross-fade. pin: a scene number to keep.
export function stepBackdrop(b,t,{phase='idle',draw=null,timed=true,pin=null}={}){const pool=phase==='bonus'||phase==='reach'?phase:'normal';let fade=null;
  if(pin){if(b.scene?.no!==pin){b.scene=SCENES[pin-1]??SCENES[0];b.at=t;b.fade=0;b.prev=null;}return b;}
  if(!b.scene)fade=0;else if(pool!==b.pool)fade=pool==='normal'?FADE:.5;else if(draw!==b.draw&&draw!=null&&t-b.at>=MIN_SHOW)fade=.6;else if(timed&&t-b.at>=b.len)fade=FADE;
  b.draw=draw;if(fade===null)return b;
  b.prev=b.scene;b.prevAt=b.at;b.prevLen=b.len;b.pool=pool;b.scene=take(b,pool);b.at=t;b.len=pool==='normal'?SHOT_LEN:SHOT_LEN*1.6;b.fade=timed?fade:0;return b;}
// What to draw at time t: the scene and how far its camera move is (u), and the previous scene while the new one fades in (mix < 1).
export function backdropView(b,t){const mix=b.fade>0?ease(clamp((t-b.at)/b.fade)):1;
  return {scene:b.scene,u:clamp((t-b.at)/b.len,0,1.3),prev:mix<1?b.prev:null,prevU:clamp((t-b.prevAt)/b.prevLen,0,1.3),mix};}

const clamp=(v,a=0,z=1)=>v<a?a:v>z?z:v,ease=v=>v*v*(3-2*v);
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const lerp=([a,z],k)=>a+(z-a)*k;

// --- Browser side: drawing. Everything is a function of the time t, so nothing has to be stepped. ---
let DPR=1;const sprites=new Map();
function canvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w*DPR));c.height=Math.max(1,Math.ceil(h*DPR));return c;}
function sprite(key,w,h,paint){let c=sprites.get(key);if(!c){c=canvas(w,h);const g=c.getContext('2d');g.scale(DPR,DPR);paint(g,w,h);sprites.set(key,c);}return c;}
function radial(g,x,y,r,stops){const gr=g.createRadialGradient(x,y,0,x,y,r);stops.forEach(([p,c])=>gr.addColorStop(p,c));return gr;}
function linear(g,x1,y1,x2,y2,stops){const gr=g.createLinearGradient(x1,y1,x2,y2);stops.forEach(([p,c])=>gr.addColorStop(p,c));return gr;}
function glowSprite(key,color){return sprite(key,32,32,g=>{g.fillStyle=radial(g,16,16,16,[[0,'#ffffff'],[.2,color],[1,color+'00']]);g.fillRect(0,0,32,32);});}
const CLOUD=()=>sprite('cloud',180,70,g=>{for(const [cx,cy,r] of [[40,44,24],[70,34,30],[105,30,34],[138,42,26],[90,50,30],[60,52,22],[122,52,22]]){g.fillStyle=radial(g,cx,cy,r,[[0,'#ffffffcc'],[.6,'#ffffff55'],[1,'#ffffff00']]);g.fillRect(cx-r,cy-r,r*2,r*2);}});
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
};
// Particles of one weather in a w×h box. count scales the number (state and gentle mode).
function weather(g,wx,w,h,t,count){const img=sprite(wx.id,32,32,PAINT[wx.id]),n=Math.round(wx.n*count),m=30;g.save();if(wx.light)g.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const r1=hash(i+1),r2=hash(i+31),r3=hash(i+71),s=lerp(wx.size,r3);let px,py,rot=0,sy=1,a=.85;
    if(wx.still){px=r1*w;py=r2*h*.85;const tw=.5+.5*Math.sin(t*(1.5+r3*2)+i*2.3);a=tw;rot=t*.3+i;}
    else if(wx.wander){px=w*(r1+.08*Math.sin(t*(.3+r3*.4)+i*3));py=h*(.25+.7*r2+.06*Math.sin(t*(.4+r1*.3)+i));a=.35+.65*Math.max(0,Math.sin(t*(1+r2)+i*1.7));}
    else{const v=lerp(wx.fall,r1),cycle=(h+2*m)/Math.abs(v),ph=(t+r2*cycle)%cycle,d=v>0?ph*v:h+2*m+ph*v;py=d-m;
      px=((r3*w*1.7+ph*lerp(wx.drift,r2)+Math.sin(t*1.4+i)*(wx.sway??0))%(w+2*m)+w+2*m)%(w+2*m)-m;
      if(wx.spin)rot=t*wx.spin*Math.PI*(r1>.5?1:-1)+i;if(wx.flip)sy=Math.max(.15,Math.abs(Math.cos(t*2.4+i*1.7)));
      if(wx.streak)rot=Math.atan2(v,lerp(wx.drift,r2));if(wx.twinkle)a=.45+.4*Math.sin(t*2+i*2.1);if(wx.light&&!wx.twinkle)a=.75;}
    g.globalAlpha=clamp(a);g.save();g.translate(px,py);g.rotate(rot);g.scale(1,sy);g.drawImage(img,-s/2,-s/2,s,s);g.restore();}
  g.restore();}
// A star field for a w×h box (made once per size) with a few stars twinkling over it.
function stars(g,w,h,t,amount){const field=sprite(`stars${w}x${h}`,w,h,(c)=>{for(let i=0;i<120;i++){const r=.4+hash(i+400)*1.1;c.fillStyle=`rgba(230,238,255,${.3+.6*hash(i+500)})`;c.beginPath();c.arc(hash(i+200)*w,hash(i+300)*h*.75,r,0,7);c.fill();}});
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha=amount*.9;g.drawImage(field,0,0,w,h);const tw=glowSprite('star','#cfe0ff');
  for(let i=0;i<10;i++){const a=Math.max(0,Math.sin(t*(1.2+hash(i+9)*1.5)+i*2));g.globalAlpha=amount*a;const s=6+hash(i+5)*6;g.drawImage(tw,hash(i+600)*w-s/2,hash(i+700)*h*.6-s/2,s,s);}g.restore();}
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
  else if(id==='halo'){const cx=w*.36,cy=h*.3;for(let k=0;k<3;k++){const p=((t/2.4+k/3)%1),r=20+p*w*.6;g.strokeStyle=`rgba(255,226,150,${.45*(1-p)})`;g.lineWidth=3*(1-p)+1;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();}
    g.fillStyle=radial(g,cx,cy,w*.25,[[0,'rgba(255,240,190,.35)'],[1,'rgba(255,240,190,0)']]);g.fillRect(0,0,w,h);}
  g.restore();}
// The illustration framed by a camera shot: zoomed from z0 to z1 over u = 0…1 and panned by dx, kept inside the picture.
function shot(g,img,w,h,[fx,fy,z0,z1,dx],u){const z=z0+(z1-z0)*u,s=Math.max(w/img.width,h/img.height)*z,dw=img.width*s,dh=img.height*s,cx=clamp(fx+dx*(u-.5));
  g.drawImage(img,Math.min(0,Math.max(w-dw,w/2-cx*dw)),Math.min(0,Math.max(h-dh,h/2-fy*dh)),dw,dh);}
// One scene into a w×h canvas: picture, far clouds, colour grade, stars, sky event, particles, near clouds.
function paintScene(g,img,sc,u,w,h,t,count){const {time}=sc,cloud=CLOUD(),dim=1-time.dark*.65;g.globalCompositeOperation='source-over';g.globalAlpha=1;g.fillStyle='#0b1022';g.fillRect(0,0,w,h);if(img)shot(g,img,w,h,sc.place.shot,u);
  for(let i=0;i<5;i++){const k=.7+(i%3)*.3,cw=180*k,span=w+cw,px=span-((t*(14+i*7)+i*137)%span)-cw*.5,py=18+i*26+Math.sin(t*.3+i)*5;g.globalAlpha=(.32+.06*(i%3))*dim;g.drawImage(cloud,px-cw/2,py-35*k,cw,70*k);}g.globalAlpha=1;
  if(time.mul){g.globalCompositeOperation='multiply';g.fillStyle=linear(g,0,0,0,h,[[0,time.mul[0]],[1,time.mul[1]]]);g.fillRect(0,0,w,h);}
  const [gc,ga,gx,gy]=time.glow;g.globalCompositeOperation='lighter';g.fillStyle=radial(g,gx*w,gy*h,Math.max(w,h)*.7,[[0,gc+Math.round(ga*255).toString(16).padStart(2,'0')],[1,gc+'00']]);g.fillRect(0,0,w,h);g.globalCompositeOperation='source-over';
  if(time.stars)stars(g,w,h,t,time.stars);sky(g,sc.sky.id,w,h,t,time.glow[0],time.dark);weather(g,sc.weather,w,h,t,count);
  for(let i=0;i<2;i++){const cw=180*2.1,span=w+cw,px=span-((t*(46+i*20)+i*260)%span)-cw*.5,py=h-20-i*14;g.globalAlpha=.4*dim;g.drawImage(cloud,px-cw/2,py-70,cw,147);}g.globalAlpha=1;}
const layers=[];function layer(i,w,h){const c=layers[i]??=canvas(w,h);if(c.width!==Math.ceil(w*DPR)||c.height!==Math.ceil(h*DPR)){c.width=Math.ceil(w*DPR);c.height=Math.ceil(h*DPR);}const g=c.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);return [c,g];}
// Draws the backdrop b into the box at x,y. level: how busy the state is (idle .8 … bonus 1.4), which sets the number of particles.
export function drawBackdrop(ctx,img,b,{x,y,w,h,t,level=1,gentle=true,reduced=false,dpr=1}){if(DPR!==dpr){DPR=dpr;sprites.clear();}const v=backdropView(b,t),count=reduced?.6:level*(gentle?.75:1),time=reduced?0:t;
  const draw=(i,sc,u,alpha)=>{const [c,g]=layer(i,w,h);paintScene(g,img,sc,reduced?.5:u,w,h,time,count);ctx.globalAlpha=alpha;ctx.drawImage(c,x,y,w,h);ctx.globalAlpha=1;};
  if(v.prev)draw(1,v.prev,v.prevU,1);draw(0,v.scene,v.u,v.mix);
  if(v.prev&&!gentle&&!reduced&&b.fade>=.6){const sx=x-w*.4+w*1.8*v.mix;ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=linear(ctx,sx-90,y,sx+90,y+h*.3,[[0,'#fff0'],[.5,`rgba(255,240,250,${.55*Math.sin(Math.PI*v.mix)})`],[1,'#fff0']]);ctx.fillRect(x,y,w,h);ctx.restore();}}

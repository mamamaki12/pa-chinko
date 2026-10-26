// Cabinet LEDs: the lamp parts painted in the cabinet art (assets/aurora.webp, astral.webp), managed one part at a time.
// Each part is a polygon over the art. Inside it, the bright coloured pixels are the LED, and three layers are cut from them once:
// shade (darkens the LED when it is off), lit (the LED's own colours, added when it is on) and bloom (a blurred copy for the halo).
// Only those pixels change, so the rest of the cabinet art and the screen never light up with them.
// Every part has its own state (off / on / blink / breathe / chase, level, colour), set directly with set() or by a scene.

// seq: position in the chase that runs around the frame. group: parts that are switched together.
export const LED_PARTS={
  aurora:[
    {id:'fenderL',label:'左下のランプ',group:'side',seq:0,poly:[[34,688],[102,700],[98,740],[38,728]]},
    {id:'gemL',label:'左下の宝石',group:'side',seq:1,poly:[[84,610],[136,612],[138,690],[92,684]]},
    {id:'sideL2',label:'左サイド下',group:'side',seq:2,poly:[[16,465],[68,465],[72,604],[28,612],[16,590]]},
    {id:'sideL1',label:'左サイド上',group:'side',seq:3,poly:[[14,320],[62,320],[68,465],[16,465]]},
    {id:'wingL',label:'左上の羽',group:'top',seq:4,poly:[[38,14],[146,12],[168,58],[126,108],[60,126],[36,104]]},
    {id:'crownL',label:'上の飾り左',group:'top',seq:5,poly:[[146,10],[300,6],[296,42],[226,62],[160,66]]},
    {id:'title',label:'タイトル',group:'top',seq:6,poly:[[216,58],[504,58],[506,138],[214,138]]},
    {id:'crownR',label:'上の飾り右',group:'top',seq:7,poly:[[420,6],[574,10],[560,66],[494,62],[424,42]]},
    {id:'wingR',label:'右上の羽',group:'top',seq:8,poly:[[574,12],[682,14],[684,104],[660,126],[594,108],[552,58]]},
    {id:'sideR1',label:'右サイド上',group:'side',seq:9,poly:[[636,380],[706,380],[706,486],[638,486]]},
    {id:'sideR2',label:'右サイド下',group:'side',seq:10,poly:[[638,486],[706,486],[706,600],[690,612],[646,606]]},
    {id:'gemR',label:'右下の宝石',group:'side',seq:11,poly:[[584,612],[636,610],[628,684],[582,690]]},
    {id:'fenderR',label:'右下のランプ',group:'side',seq:12,poly:[[618,700],[686,688],[682,728],[622,740]]},
    {id:'topGem',label:'上の宝石',group:'board',seq:0,poly:[[340,4],[380,4],[386,40],[360,58],[334,40]]},
    {id:'compass',label:'右の羅針盤',group:'board',seq:1,poly:[[586,320],[640,348],[640,452],[586,476],[536,450],[534,346]]},
    {id:'centerGem',label:'液晶下の宝石',group:'board',seq:2,poly:[[360,506],[384,524],[372,550],[348,550],[336,524]]},
    {id:'vL1',label:'ボタン左上',group:'front',seq:0,poly:[[226,706],[300,700],[316,792],[262,804]]},
    {id:'vL2',label:'ボタン左下',group:'front',seq:1,poly:[[262,804],[316,792],[350,896],[300,900]]},
    {id:'jewel',label:'ボタン下の宝石',group:'front',seq:2,poly:[[310,738],[410,738],[396,800],[360,830],[324,800]]},
    {id:'vR2',label:'ボタン右下',group:'front',seq:3,poly:[[404,792],[458,804],[420,900],[370,896]]},
    {id:'vR1',label:'ボタン右上',group:'front',seq:4,poly:[[420,700],[494,706],[458,804],[404,792]]},
  ],
  astral:[
    {id:'lowerL',label:'左下のライン',group:'side',seq:0,poly:[[12,624],[52,624],[52,800],[12,800]]},
    {id:'shoulderL',label:'左の肩',group:'side',seq:1,poly:[[10,556],[136,556],[136,622],[10,622]]},
    {id:'pillarL2',label:'左の柱 下',group:'side',seq:2,poly:[[14,332],[84,332],[84,554],[14,554]]},
    {id:'pillarL1',label:'左の柱 上',group:'side',seq:3,poly:[[16,74],[60,74],[60,330],[16,330]]},
    {id:'cornerL',label:'左上の角',group:'top',seq:4,poly:[[26,10],[176,12],[196,74],[130,82],[60,74],[26,70]]},
    {id:'title',label:'タイトル',group:'top',seq:5,poly:[[200,26],[520,26],[520,96],[200,96]]},
    {id:'titleBand',label:'タイトル下のライン',group:'top',seq:6,poly:[[256,96],[504,96],[490,126],[270,126]]},
    {id:'cornerR',label:'右上の角',group:'top',seq:7,poly:[[544,12],[694,10],[694,70],[660,74],[590,82],[524,74]]},
    {id:'pillarR1',label:'右の柱 上',group:'side',seq:8,poly:[[660,74],[704,74],[704,330],[660,330]]},
    {id:'pillarR2',label:'右の柱 下',group:'side',seq:9,poly:[[636,332],[706,332],[706,554],[636,554]]},
    {id:'shoulderR',label:'右の肩',group:'side',seq:10,poly:[[612,560],[710,556],[710,622],[596,622],[596,580]]},
    {id:'lowerR',label:'右下のライン',group:'side',seq:11,poly:[[668,624],[708,624],[708,800],[668,800]]},
    {id:'lcdL',label:'液晶の左',group:'frame',seq:0,poly:[[158,134],[180,134],[180,292],[158,292]]},
    {id:'midBand',label:'液晶とリールの間',group:'frame',seq:1,poly:[[110,294],[610,294],[584,338],[136,338]]},
    {id:'reelStar',label:'リール下の星',group:'frame',seq:2,poly:[[304,502],[416,502],[416,546],[304,546]]},
    {id:'lcdR',label:'液晶の右',group:'frame',seq:3,poly:[[544,134],[566,134],[566,292],[544,292]]},
  ],
};

export const MODES=['off','on','blink','breathe','chase'];
// Blinking never goes faster than this, in line with the room's no-fast-flash rule.
export const MAX_HZ=3;
const DEFAULT={mode:'on',level:1,color:null,speed:1,min:0};

// Parts named by target: 'all', a group, a part id, or a list of those.
export function select(parts,target){const list=[].concat(target);return parts.filter(p=>list.includes('all')||list.includes(p.id)||list.includes(p.group));}

// Brightness 0..1 of a part at time t. k is its place in the chase and n the number of places.
export function ledLevel(s,t,k=0,n=1){
  const level=Math.max(0,Math.min(1,s.level??1)),min=Math.max(0,Math.min(1,s.min??0)),hz=Math.min(MAX_HZ,Math.max(0,s.speed??1));
  switch(s.mode){
    case 'off':return 0;
    case 'blink':return (t*hz+k*.5)%1<.5?level:level*min;
    case 'breathe':return level*(min+(1-min)*(.5+.5*Math.sin(2*Math.PI*(t*hz-k/Math.max(1,n)))));
    case 'chase':{const d=((t*hz*n-k)%n+n)%n,tail=Math.max(1,n/3);return level*Math.max(min,1-d/tail);}
    default:return level;
  }
}

// Rainbow parts take one of 12 hues, so tinted layers can be cached.
const HUES=Array.from({length:12},(_,i)=>{const h=i/12,f=c=>{const k=(c+h*6)%6;return Math.round(255*(1-Math.max(0,Math.min(k,4-k,1))*.85));};return '#'+[f(5),f(3),f(1)].map(v=>v.toString(16).padStart(2,'0')).join('');});
export function ledColor(s,t,k=0){if(s.color!=='rainbow')return s.color??null;return HUES[((Math.floor(t*2+k*2))%12+12)%12];}

// The LED controller of one machine: state per part, set by id / group / 'all'.
export function createLeds(machine){
  const parts=LED_PARTS[machine],states=new Map(parts.map(p=>[p.id,{...DEFAULT}]));
  const counts={};for(const p of parts)counts[p.group]=Math.max(counts[p.group]??0,p.seq+1);
  return {machine,parts,
    set(target,state={}){for(const p of select(parts,target))states.set(p.id,{...DEFAULT,...state});return this;},
    on(target='all',state={}){return this.set(target,{...state,mode:'on'});},
    off(target='all'){return this.set(target,{mode:'off'});},
    get(id){return states.get(id);},
    // [{id, level, color}] for every part at time t; chases run within each group.
    frame(t){return parts.map(p=>{const s=states.get(p.id);return {id:p.id,level:ledLevel(s,t,p.seq,counts[p.group]),color:ledColor(s,t,p.seq)};});},
  };
}

// Scenes: what the frame does in each moment of play, like the lamp programs of a real machine.
// gentle slows everything down and turns blinking into breathing; reduced (prefers-reduced-motion) keeps every part steady.
export const SCENES={
  aurora:{
    idle:[['all',{mode:'breathe',speed:.2,min:.55}]],
    draw:[['all',{mode:'chase',speed:.5,min:.5}]],
    reach:[['side',{mode:'chase',speed:1.2,min:.3,color:'#ff3c8c'}],['top',{mode:'blink',speed:1.5,min:.4,color:'#ff3c8c'}],['board',{mode:'blink',speed:1.5,min:.4,color:'#ff3c8c'}],['front',{mode:'breathe',speed:.8,min:.5}]],
    'reach-sp':[['side',{mode:'chase',speed:1.6,min:.25,color:'#5fb0ff'}],['top',{mode:'chase',speed:1.6,min:.25,color:'#9fd0ff'}],['board',{mode:'breathe',speed:1,min:.35,color:'#5fb0ff'}],['front',{mode:'breathe',speed:.8,min:.5,color:'#cfe6ff'}]],
    'reach-spsp':[['side',{mode:'chase',speed:1.8,min:.3,color:'rainbow'}],['top',{mode:'blink',speed:2,min:.4,color:'#ffd36a'}],['board',{mode:'chase',speed:1.4,min:.35,color:'#ffd36a'}],['front',{mode:'breathe',speed:1,min:.5,color:'#ffd36a'}]],
    push:[['side',{mode:'on',level:.25}],['top',{mode:'on',level:.25}],['board',{mode:'on',level:.25}],['front',{mode:'blink',speed:2.5,min:.2,color:'#ffffff'}]],
    bonus:[['all',{mode:'chase',speed:1,min:.45,color:'rainbow'}]],
    win:[['all',{mode:'blink',speed:1.5,min:.45,color:'#ffd36a'}]],
    dark:[['all',{mode:'off'}]],
    lit:[['all',{mode:'on'}]],
  },
  astral:{
    idle:[['all',{mode:'breathe',speed:.2,min:.55}]],
    spin:[['side',{mode:'chase',speed:.6,min:.5}],['top',{mode:'chase',speed:.6,min:.5}],['frame',{mode:'on'}]],
    win:[['all',{mode:'blink',speed:1.5,min:.45,color:'#ffd36a'}]],
    replay:[['all',{mode:'breathe',speed:.6,min:.5,color:'#5ff0b4'}]],
    big:[['all',{mode:'chase',speed:1,min:.45,color:'rainbow'}]],
    dark:[['all',{mode:'off'}]],
    lit:[['all',{mode:'on'}]],
  },
};
export function applyScene(leds,name,{gentle=false,reduced=false}={}){
  const steps=SCENES[leds.machine][name]??SCENES[leds.machine].idle;
  for(const [target,s] of steps){let st={...s};
    if(reduced&&st.mode!=='off')st={...st,mode:'on',level:(st.level??1)*(st.mode==='on'?1:.85)};
    else if(gentle){st.speed=(st.speed??1)*.5;if(st.mode==='blink')st.mode='breathe';}
    leds.set(target,st);}
  return leds;
}

// --- Browser side: cut the layers out of the art and draw them. ---
const clamp=v=>v<0?0:v>1?1:v;
// Builds the layers of every part from the cabinet image (720×960). Returns null where canvases are unavailable.
export function buildLeds(img,parts){try{return parts.map(p=>buildPart(img,p));}catch{return null;}}
function buildPart(img,p){
  const xs=p.poly.map(q=>q[0]),ys=p.poly.map(q=>q[1]),pad=10,x=Math.max(0,Math.min(...xs)-pad),y=Math.max(0,Math.min(...ys)-pad),w=Math.min(720,Math.max(...xs)+pad)-x,h=Math.min(960,Math.max(...ys)+pad)-y;
  const canvas=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const src=canvas(),g=src.getContext('2d',{willReadFrequently:true});g.translate(-x,-y);g.beginPath();p.poly.forEach(([px,py],i)=>i?g.lineTo(px,py):g.moveTo(px,py));g.closePath();g.clip();g.drawImage(img,0,0,720,960);
  const d=g.getImageData(0,0,w,h),px=d.data,n=w*h,m0=new Float32Array(n),lum=new Float32Array(n);
  // An LED pixel is bright and clearly coloured; white-hot centres next to such pixels count too (filled in from a blurred copy).
  for(let i=0;i<n;i++){const r=px[i*4],gr=px[i*4+1],b=px[i*4+2],a=px[i*4+3],mx=Math.max(r,gr,b),mn=Math.min(r,gr,b),sat=mx?(mx-mn)/mx:0;lum[i]=(r+gr+b)/3;m0[i]=a<200?0:clamp((mx-150)/70)*clamp((sat-.2)/.2);}
  const near=boxBlur(boxBlur(m0,w,h,7),w,h,7),out=new Uint8ClampedArray(n*4);
  const mask=new Float32Array(n);for(let i=0;i<n;i++)mask[i]=px[i*4+3]<200?0:Math.max(m0[i],clamp(near[i]*3)*clamp((lum[i]-150)/50));
  const layer=(rgb)=>{const c=canvas(),cg=c.getContext('2d'),o=cg.createImageData(w,h);for(let i=0;i<n;i++){const [r,gr,b]=rgb(i);o.data[i*4]=r;o.data[i*4+1]=gr;o.data[i*4+2]=b;o.data[i*4+3]=mask[i]*255;}cg.putImageData(o,0,0);return c;};
  const lit=layer(i=>[px[i*4],px[i*4+1],px[i*4+2]]),shade=layer(()=>[8,5,14]),white=layer(i=>{const v=Math.min(255,lum[i]*1.1);return [v,v,v];});
  return {id:p.id,x,y,w,h,lit,shade,white,bloom:blurred(lit),tints:new Map()};
}
function boxBlur(a,w,h,r){const o=new Float32Array(a.length),t=new Float32Array(a.length);
  for(let y=0;y<h;y++){let s=0;for(let x=-r;x<=r;x++)s+=a[y*w+Math.min(w-1,Math.max(0,x))];for(let x=0;x<w;x++){t[y*w+x]=s/(2*r+1);s+=a[y*w+Math.min(w-1,x+r+1)]-a[y*w+Math.max(0,x-r)];}}
  for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=t[Math.min(h-1,Math.max(0,y))*w+x];for(let y=0;y<h;y++){o[y*w+x]=s/(2*r+1);s+=t[Math.min(h-1,y+r+1)*w+x]-t[Math.max(0,y-r)*w+x];}}
  return o;}
function blurred(src){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');if(!('filter' in g))return src;g.filter='blur(5px)';g.drawImage(src,0,0);g.filter='none';return c;}
// The part's layers recoloured: a solid colour in the LED's shape (blended with the 'color' mode, so the art keeps its
// brightness and only the hue changes) and a halo in that colour.
function tint(part,color){let t=part.tints.get(color);if(t)return t;const make=src=>{const c=document.createElement('canvas');c.width=part.w;c.height=part.h;const g=c.getContext('2d');g.drawImage(src,0,0);g.globalCompositeOperation='source-in';g.fillStyle=color;g.fillRect(0,0,part.w,part.h);return c;};
  const glow=make(part.white);t={hue:make(part.shade),lit:glow,bloom:blurred(glow)};part.tints.set(color,t);return t;}

// Draws the parts over the cabinet art. levels: controller.frame(t). gain: how much light an LED at full level adds.
// Level 1 is the art as painted plus a halo, lower levels darken the LED, 0 is a dark, unlit lens.
export function drawLeds(ctx,built,levels,{gain=.5}={}){if(!built)return;
  for(let i=0;i<built.length;i++){const p=built[i],{level,color}=levels[i],l=color?tint(p,color):p;
    if(color){ctx.save();ctx.globalCompositeOperation='color';ctx.globalAlpha=.85;ctx.drawImage(l.hue,p.x,p.y);ctx.restore();}
    if(level<.99){ctx.globalAlpha=(1-level)*.8;ctx.drawImage(p.shade,p.x,p.y);}
    if(level>.01){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=level*gain;ctx.drawImage(l.bloom,p.x,p.y);ctx.globalAlpha=level*gain*.35;ctx.drawImage(l.lit,p.x,p.y);ctx.restore();}
  }
  ctx.globalAlpha=1;
}

import {REACH_KINDS} from './engine.js';
// Reach presentation on the AURORA LCD (see planSpin in engine.js for how the kind and colour are picked).
// (バトルリーチ is drawn by battle-fx.js.) 流星リーチ: the sky turns to night and shooting stars pour across it. 天空城リーチ: golden light from the floating castle,
// turning rays and rising sparks, with a rainbow rim. Each development opens with a short cut-in banner naming the reach.
// Gentle mode dims and slows everything and skips the white flash; prefers-reduced-motion shows still versions.

// Title / button colours. pink is the plain colour used when reach variety is off.
export const REACH_COLORS={
  pink:{label:'#ffe3f3',rim:'#ffb6dc',glow:'#ff74c4',button:['#ffe9f6','#ff7cc4','#a02a73']},
  blue:{label:'#8fd0ff',rim:'#7cc4ff',glow:'#3f9bff',button:['#e6f4ff','#4aa8ff','#1d4fa8']},
  green:{label:'#7ff5a8',rim:'#7cf0a4',glow:'#2fd872',button:['#eafff0','#3fd87a','#167a3c']},
  red:{label:'#ff7a68',rim:'#ff7a6c',glow:'#ff3a2a',button:['#fff0ec','#ff4a3a','#a01a12']},
};
const BANNER=1.1;
const clamp=v=>v<0?0:v>1?1:v,ease=v=>v*v*(3-2*v);
const hash=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};

// How far the digits have moved aside for a developed reach (0 = normal layout, 1 = small corner digits and a big middle one).
export function reachLayout(plan,t,drawing){const dev=plan?.reach&&plan.stages[1];return drawing&&dev?ease(clamp((t-dev.at)/.5)):0;}
// Centre and scale of LCD column i for layout amount k. In a battle all three digits shrink into the top-left corner, clear of the fight.
export function columnPlace(i,k,battle=false){const x=262+i*98,y=410;if(battle)return {x:x+(214+i*30-x)*k,y:y+(284-y)*k,scale:1-.68*k};if(i===1)return {x,y:y-8*k,scale:1+.25*k};return {x:x+(i?48:-48)*k,y:y-110*k,scale:1-.5*k};}

// Background layer of a developed stage, drawn over the LCD art and under the character and digits.
export function reachBackdrop(ctx,stage,{x,y,w,h,t,gentle,reduced}){if(!stage||stage.kind==='normal'||stage.kind==='battle')return;const age=t-stage.at,fade=reduced?1:clamp(age/.4);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  if(stage.kind==='sp'){ctx.fillStyle=`rgba(6,10,40,${.62*fade})`;ctx.fillRect(x,y,w,h);ctx.globalCompositeOperation='lighter';
    for(let i=0;i<40;i++){const a=(.25+.35*hash(i))*(reduced?1:.6+.4*Math.sin(t*2+i));ctx.fillStyle=`rgba(220,235,255,${a*fade})`;ctx.fillRect(x+hash(i+3)*w,y+hash(i+7)*h*.8,1.6,1.6);}
    const n=reduced?0:gentle?4:9;for(let i=0;i<n;i++){const life=1.1+hash(i)*.7,ph=(age*(gentle?.6:1)+hash(i+9)*life)%life,q=ph/life,sx=x+w*(.1+1.1*hash(i+Math.floor((age+hash(i+9)*life)/life)*17))-q*w*.55,sy=y-10+q*h*.9,len=60+hash(i+5)*60,al=Math.sin(Math.PI*q)*(gentle?.6:1)*fade;
      ctx.strokeStyle=grad(ctx,sx+len,sy-len*.55,sx,sy,`rgba(150,200,255,0)`,`rgba(235,245,255,${al})`);ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx+len,sy-len*.55);ctx.lineTo(sx,sy);ctx.stroke();
      ctx.fillStyle=`rgba(255,255,255,${al})`;ctx.beginPath();ctx.arc(sx,sy,2.2,0,7);ctx.fill();}}
  else{const cx=x+w/2,cy=y+h*.32;ctx.fillStyle=`rgba(60,30,0,${.35*fade})`;ctx.fillRect(x,y,w,h);ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,w*.7);g.addColorStop(0,`rgba(255,230,150,${(gentle?.45:.7)*fade})`);g.addColorStop(.5,`rgba(255,170,60,${.25*fade})`);g.addColorStop(1,'rgba(255,170,60,0)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
    const turn=reduced?0:t*(gentle?.15:.35);for(let k=0;k<12;k++){const a=turn+k*Math.PI/6;ctx.fillStyle=`rgba(255,236,170,${(gentle?.08:.14)*fade})`;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,w,a-.09,a+.09);ctx.closePath();ctx.fill();}
    if(!reduced)for(let i=0;i<(gentle?14:28);i++){const sp=18+hash(i)*30,py=y+h-((age*sp+hash(i+2)*h)%(h+10)),px=x+hash(i+4)*w+Math.sin(t*1.5+i)*6,r=1.2+hash(i+6)*1.8;ctx.fillStyle=`rgba(255,220,120,${.7*fade})`;ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill();}
    ctx.globalCompositeOperation='source-over';ctx.lineWidth=4;ctx.strokeStyle=rainbow(ctx,x,y,w,reduced?0:t);ctx.globalAlpha=fade;ctx.beginPath();ctx.roundRect(x+3,y+3,w-6,h-6,14);ctx.stroke();}
  ctx.restore();}

// Cut-in banner at the start of a developed stage: a white flash and the reach name sliding in across the LCD.
export function reachBanner(ctx,stage,color,{x,y,w,h,t,gentle,reduced}){if(!stage||stage.kind==='normal')return;const age=t-stage.at;if(age<0||age>BANNER)return;const c=REACH_COLORS[color]??REACH_COLORS.pink;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
  if(!reduced&&age<.25){ctx.fillStyle=`rgba(255,255,255,${(gentle?.25:.7)*(1-age/.25)})`;ctx.fillRect(x,y,w,h);}
  const inq=reduced?1:ease(clamp(age/.22)),out=reduced?1:1-ease(clamp((age-BANNER+.2)/.2)),by=y+h*.5,bx=x+w/2+(1-inq)*w;ctx.globalAlpha=out;
  ctx.fillStyle='rgba(10,4,20,.82)';ctx.fillRect(x,by-28,w,56);ctx.fillStyle=c.rim;ctx.fillRect(x,by-28,w,3);ctx.fillRect(x,by+25,w,3);
  ctx.font='bold 30px Georgia,"Hiragino Mincho ProN",serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=6;ctx.strokeStyle='#14040f';const name=REACH_KINDS[stage.kind];ctx.strokeText(name,bx,by+1);
  ctx.shadowColor=c.glow;ctx.shadowBlur=gentle||reduced?4:14;ctx.fillStyle=stage.kind==='spsp'?grad(ctx,0,by-16,0,by+16,'#fff6d6','#ffb83a'):c.label;ctx.fillText(name,bx,by+1);ctx.restore();}

// Label under the digits during a reach ("リ ー チ", or the developed reach's name) in the reach colour.
export function reachLabel(stage,color){const c=REACH_COLORS[color]??REACH_COLORS.pink;return {text:stage&&stage.kind!=='normal'?REACH_KINDS[stage.kind]:'リ ー チ',color:c.label};}

function grad(ctx,x1,y1,x2,y2,a,b){const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function rainbow(ctx,x,y,w,t){const g=ctx.createLinearGradient(x,y,x+w,y);const hues=[0,40,60,130,200,270,330];hues.forEach((hu,i)=>g.addColorStop(i/(hues.length-1),`hsl(${(hu+t*60)%360},90%,65%)`));return g;}

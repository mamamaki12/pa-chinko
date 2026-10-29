import {BATTLE} from './engine.js';
import {goldText,PALETTES} from './celebration.js';
// バトルリーチ on the AURORA LCD: Hana (left) fights an enemy (right), like the battle reach of a real machine: the cloud imp モクモ,
// the ice knight グラシエ or the night dragon princess ノクス (picked after the draw, see BATTLE.pick in engine.js).
// They are drawn from sheets made by scripts/make-battle-sprites.py from the generated pictures in assets/battle/, 4 poses a row:
// assets/battle-sprites.webp row 0 Hana (ready, cast, charge, victory), row 1 Hana's comeback (calm, glow, revived, strike);
// assets/battle-foes.webp one row per enemy (ready, attack, dizzy, leave). Petals, gusts, ice shards, starlight, beams and sparks are drawn here. Everything before the button is the same for every
// draw; after it, the fight follows plan.battle.outcome (win / lose / revive, see BATTLE in engine.js). A loss is shown lightly: the
// enemy just leaves and Hana watches calmly, never hurt or sad. Gentle mode dims flashes and shakes; prefers-reduced-motion keeps the
// characters in place and drops the moving particles.

// Hana's sheet: cell size, and the feet line of each pose in its cell (the characters stand on STAGE.ground, centred on the cell).
export const SHEET={path:'assets/battle-sprites.webp',w:272,h:362,feet:[[345,347,345,345],[351,347,350,350]]};
export const POSES={hana:{ready:[0,0],cast:[0,1],charge:[0,2],victory:[0,3],calm:[1,0],glow:[1,1],revived:[1,2],strike:[1,3]},foe:{ready:0,attack:1,dizzy:2,leave:3}};
// The enemies' sheet: wider cells (swords and wings reach far out), the row and feet line of each enemy, the point of its attack pose
// (cell px) where its shot starts, its shot and the colour of its light.
export const FOES={path:'assets/battle-foes.webp',w:400,h:362,
  cloud:{row:0,feet:[351,351,325,345],attack:[79,170],shot:'gust',color:'200,190,255',arena:'arena'},
  ice:{row:1,feet:[354,355,351,353],attack:[40,110],shot:'shards',color:'150,215,255',arena:'arena'},
  dragon:{row:2,feet:[345,345,341,326],attack:[120,155],shot:'stars',color:'190,130,255',arena:'arenaNight'}};
// The battle stage: a generated painting of a marble duel platform above the clouds (sunset, or moonlit for the night princess ノクス).
// floor: the height in the picture (0 top … 1 bottom) of the platform's front edge, drawn on STAGE.ground so the fighters stand on it;
// size: the drawn height of the picture in LCD heights.
export const ARENA={floor:.72,size:1.37,arena:'assets/lcd-stages/stage-arena.webp',arenaNight:'assets/lcd-stages/stage-arena-night.webp'};
// Board positions: the ground line on the LCD, where each character stands, and how tall the characters are drawn.
export const STAGE={ground:498,hana:254,foe:466,height:150,mid:360};
// Points in a cell (sheet px) where an attack starts: the wand tip of Hana's cast / charge / strike poses.
const POINTS={cast:[150,128],charge:[86,40],strike:[160,136]};
const K=STAGE.height/SHEET.h;
const clamp=v=>v<0?0:v>1?1:v,ease=v=>v*v*(3-2*v),lerp=(a,b,k)=>a+(b-a)*k,bump=v=>v<=0||v>=1?0:Math.sin(Math.PI*v);
const hash=i=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s);};

const sheets={};
export function loadBattleSprites(){if(typeof Image==='undefined')return;for(const [key,path] of [['hana',SHEET.path],['foe',FOES.path],['arena',ARENA.arena],['arenaNight',ARENA.arenaNight]]){if(sheets[key])continue;const img=new Image();img.decoding='async';img.onload=()=>{sheets[key]=img;};img.src=path;}}

// Seconds into the battle stage (bt) before the button, or since the button was pressed (f); null outside the battle.
export function battleTime(plan,t){const st=plan?.battle&&plan.stages[1];if(!st||t<st.at)return null;return plan.pressed!=null&&t>=plan.pressed?{f:t-plan.pressed}:{bt:t-st.at};}
// Board point of an attack start for Hana or the enemy (foe: its FOES entry) in a pose.
function point(who,a,foe){if(who==='foe'){const [px,py]=foe.attack;return [a.x+(px-FOES.w/2)*K,STAGE.ground-a.lift+(py-foe.feet[POSES.foe[a.pose]])*K];}
  const [r,c]=POSES.hana[a.pose],[px,py]=POINTS[a.pose];return [a.x+(px-SHEET.w/2)*K,STAGE.ground-a.lift+(py-SHEET.feet[r][c])*K];}
const chest=a=>[a.x,STAGE.ground-a.lift-STAGE.height*.42];

// What the battle shows at time t of the draw: each character's pose, place and fade, the effects, and the title, flash and shake.
// Pure, so the tests can check that wins and losses look the same until the button and that a revival looks like a loss until reviveAt.
export function battleScene(plan,t,{reduced=false}={}){const at=battleTime(plan,t);if(!at)return null;const {intro,cycle,clash,reviveAt}=BATTLE,mv=reduced?0:1,o=plan.battle.outcome,foe=FOES[plan.battle.enemy]??FOES.cloud;
  const H={pose:'ready',x:STAGE.hana,lift:0,alpha:1,spin:0},F={pose:'ready',x:STAGE.foe,lift:0,alpha:1,spin:0},s={hana:H,foe:F,fx:[],vs:0,title:0,flash:0,shake:0,ring:0,aura:0,pillar:0,led:null};
  if(at.bt!=null){const bt=at.bt;
    if(bt<intro){H.x=lerp(STAGE.hana-160,STAGE.hana,reduced?1:ease(clamp((bt-.25)/.6)));F.x=lerp(STAGE.foe+160,STAGE.foe,reduced?1:ease(clamp((bt-.35)/.6)));s.vs=Math.min(clamp((bt-1.05)/.15),clamp((intro-bt)/.2));}
    else if(plan.asked){H.pose='charge';s.ring=1;F.lift=Math.abs(Math.sin(bt*3))*4*mv;}
    else{const c=(bt-intro)%cycle;
      if(c<.8){H.pose=c>.05&&c<.7?'cast':'ready';F.lift=bump((c-.42)/.34)*28*mv;const q=(c-.15)/.4;if(q>0&&q<1&&mv)s.fx.push({kind:'petals',from:point('hana',{...H,pose:'cast'}),to:[F.x-6,STAGE.ground-70],q});}
      else{const d=c-.8;F.pose=d>.05&&d<.7?'attack':'ready';H.lift=bump((d-.42)/.34)*28*mv;const q=(d-.15)/.4;if(q>0&&q<1&&mv)s.fx.push({kind:foe.shot,from:point('foe',{...F,pose:'attack'},foe),to:[H.x+6,STAGE.ground-70],q});}}
    return s;}
  const f=at.f;
  // The enemy is hit by Hana's special move at time h (seconds after the button): it spins away to the right and fades.
  const knock=(h,from)=>{const k=clamp((f-h)/.6);F.pose='dizzy';F.x=from+ease(k)*120*mv;F.lift=bump(k*.8)*46*mv;F.spin=k*.7*mv;F.alpha=1-clamp((f-h-.2)/.4);if(f-h<.6)s.fx.push({kind:'sparks',at:chest({...F,x:from,lift:0}),age:f-h});s.shake=Math.max(s.shake,bump((f-h)/.3));};
  // Hana's special move from time a: the beam shoots at the enemy standing at x and lasts .45 s.
  const strike=(a,x)=>{H.pose='strike';const q=clamp((f-a)/.12)*(1-clamp((f-a-.3)/.15));if(q>0)s.fx.push({kind:'beam',from:point('hana',H),to:[x+6,STAGE.ground-STAGE.height*.42],q});};
  const win=a=>{H.pose='victory';H.lift=bump(((f-a)%.8)/.8)*16*mv;s.title=clamp((f-a+.05)/.2);};
  // Every outcome opens the same way: both attacks meet in the middle and burst.
  if(f<clash){H.pose='cast';F.pose='attack';const q=clamp(f/.3),m=[STAGE.mid,STAGE.ground-82];s.fx.push({kind:'stream',from:point('hana',H),to:m,q,color:'pink'},{kind:'stream',from:point('foe',F,foe),to:m,q,color:foe.color});if(f>.25)s.fx.push({kind:'burst',at:m,age:f-.25});s.flash=bump((f-.38)/.22);return s;}
  if(o==='win'){
    if(f<.95){H.pose='charge';s.ring=1;}
    else if(f<1.6)strike(.95,STAGE.foe);else win(1.6);
    if(f>=1.1)knock(1.1,STAGE.foe);return s;}
  // A loss: the clash fades out on Hana's side, the enemy stands ready, then waves and leaves to the right. Hana watches calmly.
  H.pose='calm';if(f<.85)s.fx.push({kind:'burst',at:[lerp(STAGE.mid,H.x+30,clamp((f-clash)/.25)),STAGE.ground-82],age:.35+(f-clash)*1.5,fade:1});
  const leave=g=>{const k=clamp((g-1)/1.4);F.pose=g<1?'ready':'leave';F.x=STAGE.foe+k*170*mv;F.lift=g<1?0:Math.abs(Math.sin((g-1)*7))*8*mv;F.alpha=1-clamp((g-2)/.4);};
  if(o==='lose'||f<reviveAt){leave(f);return s;}
  // 復活: from reviveAt Hana starts to glow while the enemy is still leaving; it stops and turns back, Hana rises in gold and finishes it.
  leave(Math.min(f,reviveAt+.3));if(f>=reviveAt+.35){F.x=lerp(F.x,STAGE.foe,ease(clamp((f-reviveAt-.35)/.3)));if(f<2.3)F.pose='ready';}
  s.aura=clamp((f-reviveAt)/.4)*(f<1.5?.55:1);s.led=f>=1.5?'revive':null;
  if(f<1.5)H.pose='glow';else if(f<2.1){H.pose='revived';s.flash=bump((f-1.5)/.3);s.pillar=clamp((f-1.5)/.15)*(1-clamp((f-1.95)/.15));}else if(f<2.7)strike(2.1,F.x);else{win(2.7);s.aura*=1-clamp((f-2.7)/.5);}
  if(f>=2.3)knock(2.3,F.x);return s;}

// Sound cues of the battle up to time t, as [key, name] pairs (keys are unique per draw, so each one plays once).
export function battleEvents(plan,t){const at=battleTime(plan,t);if(!at)return [];const out=[],{intro,cycle}=BATTLE,o=plan.battle.outcome,st=plan.stages[1];
  const add=(key,name,when)=>{if(when<=t)out.push([key,name]);};
  add('vs','vs',st.at+1.05);const end=plan.pressed??(plan.asked?plan.push:t);for(let n=0;;n++){const c=st.at+intro+n*cycle;if(c>=end)break;if(c+.15<end)add(`a${n}`,'attack',c+.15);if(c+.95<end)add(`g${n}`,'gust',c+.95);}
  if(plan.pressed!=null){const p=plan.pressed;add('clash','clash',p+.38);
    if(o==='win'){add('beam','beam',p+.95);add('hit','hit',p+1.1);add('won','won',p+1.6);}
    if(o==='revive'){add('revive','revive',p+BATTLE.reviveAt);add('rise','rise',p+1.5);add('beam','beam',p+2.1);add('hit','hit',p+2.3);add('won','won',p+2.7);}}
  return out;}

// Backdrop of the battle: the arena painting fades in (slowly zooming), a little darkened, with a light on each fighter and a glowing
// floor. Until the painting has loaded the scene just darkens to violet.
function backdrop(ctx,{x,y,w,h,t,age,gentle,reduced,foe}){const fade=reduced?1:clamp(age/.4),img=sheets[foe.arena];
  if(img){const z=1+(reduced?0:.04*clamp(age/10)),dh=h*ARENA.size*z,dw=dh*img.width/img.height,top=STAGE.ground-ARENA.floor*dh;ctx.save();ctx.globalAlpha*=fade;ctx.drawImage(img,STAGE.mid-dw/2,top,dw,dh);ctx.restore();}
  ctx.fillStyle=`rgba(18,6,34,${(img?.32:.55)*fade})`;ctx.fillRect(x,y,w,h);const lit=img?.5:1;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const [cx,col] of [[STAGE.hana,'255,120,190'],[STAGE.foe,foe.color]]){const g=ctx.createRadialGradient(cx,y+h*.55,0,cx,y+h*.55,w*.42);g.addColorStop(0,`rgba(${col},${(gentle?.22:.3)*fade*lit})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(x,y,w,h);}
  const fl=ctx.createRadialGradient(STAGE.mid,STAGE.ground,0,STAGE.mid,STAGE.ground,w*.6);fl.addColorStop(0,`rgba(255,215,150,${.28*fade*lit})`);fl.addColorStop(1,'rgba(255,215,150,0)');ctx.fillStyle=fl;ctx.save();ctx.translate(STAGE.mid,STAGE.ground);ctx.scale(1,.18);ctx.translate(-STAGE.mid,-STAGE.ground);ctx.fillRect(x,STAGE.ground-w*.6,w,w*1.2);ctx.restore();
  if(!reduced)for(let i=0;i<14;i++){const sp=(gentle?60:120)*(.6+hash(i)),px=x+((hash(i+3)*w*1.4-t*sp)%(w*1.4)+w*1.4)%(w*1.4)-w*.2,py=y+hash(i+7)*h*.75;ctx.strokeStyle=`rgba(255,230,250,${(gentle?.08:.14)*fade})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+40,py-8);ctx.stroke();}
  ctx.restore();}

function actor(ctx,who,a,t,reduced,foe){const img=sheets[who];if(!img||a.alpha<=0)return;const S=who==='foe'?FOES:SHEET,[r,c]=who==='foe'?[foe.row,POSES.foe[a.pose]]:POSES.hana[a.pose],feet=who==='foe'?foe.feet[c]:SHEET.feet[r][c],breathe=reduced?1:1+.012*Math.sin(t*3.2+(who==='foe'?1.7:0));
  ctx.save();ctx.globalAlpha*=a.alpha;ctx.fillStyle=`rgba(10,2,20,${.35/(1+a.lift/30)})`;ctx.beginPath();ctx.ellipse(a.x,STAGE.ground,34/(1+a.lift/60),6,0,0,7);ctx.fill();
  ctx.translate(a.x,STAGE.ground-a.lift);if(a.spin)ctx.rotate(a.spin);ctx.scale(1,breathe);ctx.drawImage(img,c*S.w,r*S.h,S.w,S.h,-S.w/2*K,-feet*K,S.w*K,S.h*K);ctx.restore();}
function petal(ctx,x,y,r,rot,a){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=`rgba(255,${170+(r*7|0)%40},215,${a})`;ctx.beginPath();ctx.ellipse(0,0,r,r*.55,0,0,7);ctx.fill();ctx.restore();}
function star(ctx,x,y,r,rot,col,a){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=`rgba(${col},${a})`;ctx.beginPath();for(let k=0;k<8;k++){const ang=k*Math.PI/4,d=k%2?r*.32:r;ctx.lineTo(Math.cos(ang)*d,Math.sin(ang)*d);}ctx.closePath();ctx.fill();ctx.restore();}
function glow(ctx,x,y,r,col,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function bolt(ctx,x,y,s,seed,a){ctx.strokeStyle=`rgba(255,230,90,${a})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);for(let i=1;i<4;i++)ctx.lineTo(x+(hash(seed+i)-.5)*s,y+i*s*.4);ctx.stroke();}
function effect(ctx,e,t,{gentle,reduced}){const [x0,y0]=e.from??e.at,[x1,y1]=e.to??e.at;ctx.save();ctx.globalCompositeOperation='lighter';
  if(e.kind==='petals'){const hx=lerp(x0,x1,e.q),hy=lerp(y0,y1,e.q);glow(ctx,hx,hy,34,'255,140,205',.6);glow(ctx,hx,hy,12,'255,255,255',.9);for(let i=0;i<16;i++){const q=e.q-i*.025;if(q<0)continue;const px=lerp(x0,x1,q),py=lerp(y0,y1,q)+Math.sin(q*14+i*1.7)*(4+i*.8);petal(ctx,px,py,7-i*.3,t*9+i,.95-i*.05);}}
  else if(e.kind==='gust'){ctx.globalCompositeOperation='source-over';for(let i=7;i>=0;i--){const q=e.q-i*.04;if(q<0)continue;const px=lerp(x0,x1,q),py=lerp(y0,y1,q)+Math.sin(q*10+i)*5,r=11+i*2.2,g=ctx.createRadialGradient(px-r*.3,py-r*.3,0,px,py,r);g.addColorStop(0,`rgba(255,255,255,${.95-i*.1})`);g.addColorStop(.6,`rgba(225,218,255,${.75-i*.08})`);g.addColorStop(1,'rgba(200,190,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,7);ctx.fill();}
    const hx=lerp(x0,x1,e.q),hy=lerp(y0,y1,e.q);bolt(ctx,hx-6,hy-22,14,Math.floor(t*12),.9);bolt(ctx,hx+8,hy+6,12,Math.floor(t*12)+5,.8);}
  else if(e.kind==='shards'){glow(ctx,lerp(x0,x1,e.q),lerp(y0,y1,e.q),30,'150,215,255',.55);
    for(let i=0;i<9;i++){const q=e.q-i*.035;if(q<0)continue;const px=lerp(x0,x1,q),py=lerp(y0,y1,q)+(hash(i+2)-.5)*26,r=(9-i*.6)*(.8+.4*hash(i)),a=.95-i*.08;
      ctx.save();ctx.translate(px,py);ctx.rotate(Math.atan2(y1-y0,x1-x0)+(hash(i+5)-.5)*.6);ctx.fillStyle=`rgba(190,235,255,${a})`;ctx.beginPath();ctx.moveTo(r*1.6,0);ctx.lineTo(0,-r*.45);ctx.lineTo(-r*.9,0);ctx.lineTo(0,r*.45);ctx.closePath();ctx.fill();
      ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=1;ctx.stroke();ctx.restore();}}
  else if(e.kind==='stars'){const hx=lerp(x0,x1,e.q),hy=lerp(y0,y1,e.q);glow(ctx,hx,hy,36,'190,130,255',.6);glow(ctx,hx,hy,12,'255,240,255',.9);
    for(let i=0;i<14;i++){const q=e.q-i*.028;if(q<0)continue;const px=lerp(x0,x1,q),py=lerp(y0,y1,q)+Math.sin(q*12+i*1.3)*(5+i*.7);star(ctx,px,py,6.5-i*.35,t*5+i,i%3?'210,170,255':'255,225,140',.95-i*.06);}}
  else if(e.kind==='stream'){const tx=lerp(x0,x1,e.q),ty=lerp(y0,y1,e.q),[a,b]=e.color==='pink'?['255,120,190','255,235,245']:[e.color,'245,245,255'];
    for(const [wd,col,al] of [[16,a,.35],[8,b,.7],[3,'255,255,255',.9]]){ctx.strokeStyle=`rgba(${col},${al})`;ctx.lineWidth=wd*(1+.15*Math.sin(t*30));ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(tx,ty);ctx.stroke();}}
  else if(e.kind==='burst'){const k=clamp(e.age/.35),a=e.fade?clamp(1-(e.age-.35)/.4):1,r=18+k*46;glow(ctx,x0,y0,r*1.6,'255,190,230',.6*a);glow(ctx,x0,y0,r*.7,'255,255,255',.9*a);
    if(!reduced)for(let i=0;i<10;i++){const ang=i*Math.PI/5+t*2,l=r*(1.1+.3*hash(i));ctx.strokeStyle=`rgba(255,240,250,${.6*a})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0+Math.cos(ang)*r*.4,y0+Math.sin(ang)*r*.4);ctx.lineTo(x0+Math.cos(ang)*l,y0+Math.sin(ang)*l);ctx.stroke();}}
  else if(e.kind==='beam'){const wob=reduced?1:1+.12*Math.sin(t*40);for(const [wd,col,al] of [[34,'255,110,180',.3],[20,'255,200,120',.45],[10,'255,236,245',.8],[4,'255,255,255',1]]){ctx.strokeStyle=`rgba(${col},${al*e.q})`;ctx.lineWidth=wd*wob*e.q;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();}
    glow(ctx,x1,y1,46*e.q,'255,230,200',.8*e.q);if(!reduced)for(let i=0;i<8;i++){const q=((t*1.8+hash(i))%1);petal(ctx,lerp(x0,x1,q),lerp(y0,y1,q)+(hash(i+4)-.5)*22,4,t*10+i,.85*e.q);}}
  else if(e.kind==='sparks'){const k=clamp(e.age/.6);glow(ctx,x0,y0,40*(1-k)+10,'255,250,220',.9*(1-k));if(!reduced)for(let i=0;i<14;i++){const ang=hash(i)*7,d=(20+hash(i+2)*50)*ease(k);ctx.fillStyle=`rgba(255,${200+(i%3)*25},${120+(i%2)*120},${1-k})`;ctx.beginPath();ctx.arc(x0+Math.cos(ang)*d,y0+Math.sin(ang)*d,2.6*(1-k)+.6,0,7);ctx.fill();}}
  ctx.restore();}

// Draws the battle for time t of the draw (alpha fades it out after the result) and returns the scene, or null outside the battle.
export function drawBattle(ctx,plan,t,{x,y,w,h,clock,gentle,reduced,alpha=1}){const s=battleScene(plan,t,{reduced});if(!s)return null;const st=plan.stages[1],foe=FOES[plan.battle.enemy]??FOES.cloud;
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.globalAlpha=alpha;backdrop(ctx,{x,y,w,h,t:clock,age:t-st.at,gentle,reduced,foe});
  const amp=reduced?0:gentle?2.5:6;if(s.shake&&amp)ctx.translate(Math.sin(clock*90)*amp*s.shake,Math.cos(clock*70)*amp*.6*s.shake);
  const H=s.hana,[hx,hy]=chest(H);ctx.save();ctx.globalCompositeOperation='lighter';
  if(s.aura){glow(ctx,hx,hy,90*s.aura,'255,215,120',(gentle?.45:.6)*s.aura);if(!reduced)for(let i=0;i<16;i++){const q=(clock*.7+hash(i))%1;ctx.fillStyle=`rgba(255,${220+(i%3)*12},150,${(1-q)*s.aura})`;ctx.beginPath();ctx.arc(hx+(hash(i+3)-.5)*90,STAGE.ground-q*160,1.6+hash(i+5)*1.6,0,7);ctx.fill();}}
  // The comeback: a pillar of gold light rises behind Hana.
  if(s.pillar){const pw=60,g=ctx.createLinearGradient(hx-pw,0,hx+pw,0);g.addColorStop(0,'rgba(255,210,120,0)');g.addColorStop(.5,`rgba(255,240,200,${(gentle?.55:.8)*s.pillar})`);g.addColorStop(1,'rgba(255,210,120,0)');ctx.fillStyle=g;ctx.fillRect(hx-pw,y,pw*2,STAGE.ground-y);glow(ctx,hx,STAGE.ground-6,80,'255,220,150',.7*s.pillar);}
  if(s.ring){const turn=reduced?0:clock*2;glow(ctx,hx,hy-10,70,'255,140,200',gentle?.25:.35);ctx.strokeStyle='rgba(255,200,230,.7)';ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.lineDashOffset=-turn*20;ctx.beginPath();ctx.ellipse(hx,STAGE.ground-4,52,12,0,0,7);ctx.stroke();ctx.setLineDash([]);
    const [wx,wy]=point('hana',H);glow(ctx,wx,wy,26+(reduced?0:6*Math.sin(clock*8)),'255,230,245',.8);}
  ctx.restore();
  actor(ctx,'foe',s.foe,clock,reduced,foe);actor(ctx,'hana',H,clock,reduced);
  for(const e of s.fx)effect(ctx,e,clock,{gentle,reduced});
  if(s.vs){const pop=reduced?1:1+.4*(1-ease(clamp((t-st.at-1.05)/.2)));ctx.globalAlpha=alpha*s.vs;goldText(ctx,'VS',STAGE.mid,372,58*pop,clock,{pal:PALETTES.aurora,glow:gentle||reduced?.4:.8});
    ctx.font='bold 15px "Hiragino Sans","Yu Gothic",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='#1a0620';const name=BATTLE.enemies[plan.battle.enemy];ctx.strokeText(name,STAGE.mid,414);ctx.fillStyle='#efe8ff';ctx.fillText(name,STAGE.mid,414);}
  if(s.title){const pop=reduced?1:1+.5*(1-ease(s.title));ctx.globalAlpha=alpha*s.title;goldText(ctx,'勝 利',STAGE.mid,344,44*pop,clock,{pal:PALETTES.aurora,font:'900 {s}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif',glow:gentle||reduced?.4:.8});}
  if(s.flash&&!reduced){ctx.globalAlpha=1;ctx.fillStyle=`rgba(255,248,252,${(gentle?.3:.65)*s.flash*alpha})`;ctx.fillRect(x-10,y-10,w+20,h+20);}
  ctx.restore();return s;}

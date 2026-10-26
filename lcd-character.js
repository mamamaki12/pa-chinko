import {drawPortrait} from './navigator-art.js';
// LCD navigator characters: original chibi mascots that live on the LCD and react to what just happened, like the
// mini characters of a real machine. ハナ lives on AURORA (pink, flower), ソラ on ASTRAL (silver-blue, star).
// Rules: reactions come at or after a known result (spin start, reach, stop, payout); the lever / spin / reach reactions are the
// same for every game, so they never hint at the outcome. sp / spsp follow a developed reach, which does (see REACH_PICK in engine.js). No near-miss teasing and no lines that push for more play;
// gentle lines about breaks are fine. Gentle mode keeps the motion but dims sparkles; prefers-reduced-motion keeps poses still
// (no blinking, lip flaps, hops or idle fidgets).

// Palettes. hair: highlight, base, shadow, deep shadow; eye: bottom glow, iris, top of iris, pupil, upper white shade;
// dress: white, white shade, colour, colour shadow; shade: shadow tint for white cloth; skin: base, shade, deep shade.
export const KINDS={
  hana:{name:'ハナ',pitch:1.15,line:'#5a2740',hairLine:'#8e3a5c',skin:['#fff4ef','#f7d2cc','#eaa9b0'],hair:['#fff6f9','#ffcfdc','#f39ab6','#cf5f88'],eye:['#ffd6e4','#e8578f','#7d1d4c','#2a0a1a','#f3dce6'],dress:['#ffffff','#f4dbe6','#ff86b4','#c8457f'],shade:'#c88aa8',trim:'#ebc76c',trimDark:'#a87a22',gem:'#ff5fa8',ribbon:'#ff5fa8',wing:'#ffb6dc',accent:'flower'},
  sora:{name:'ソラ',pitch:.95,line:'#33295e',hairLine:'#4d4590',skin:['#fff4ef','#f5d3cd','#e3aab2'],hair:['#ffffff','#e2e0fb','#b5b1ea','#8780cf'],eye:['#c9ecff','#5e86ee','#26308c','#100d36','#dde3f6'],dress:['#ffffff','#dde3f6','#3553bd','#1c2c7a'],shade:'#7e8cc6',trim:'#ebc76c',trimDark:'#a87a22',gem:'#4fb8ff',ribbon:'#5fb6ff',wing:'#a9d4ff',accent:'star'},
};

// pose: body motion; expr: face; dur: seconds the pose holds; chance: how often a line is spoken; prio: a lower priority
// line never cuts off a higher one that is still showing; next: follow-up event after this one ends.
export const EVENTS={
  hello:{pose:'wave',expr:'happy',dur:3,chance:1,prio:1,lines:['こんにちは、{name}だよ。のんびりいこうね','{name}だよ。マイペースでいこう']},
  chat:{pose:'idle',expr:'normal',dur:3,chance:1,prio:0,lines:['深呼吸、すー、はー','肩の力、ぬけてる？','お水、飲んでる？','のんびりいこうね','ここはお金のいらない遊技室だよ','疲れたら、いつでもおしまいでOK','外はどんな天気かな？','今日のごはん、何にしよう？']},
  launch:{pose:'nod',expr:'happy',dur:.8,chance:.5,prio:0,lines:['発射スタート','ゆっくりでいいよ']},
  launchStop:{pose:'idle',expr:'normal',dur:1,chance:.4,prio:0,lines:['ひと息つく？','おつかれさま。休憩もいいね']},
  enter:{pose:'nod',expr:'happy',dur:.6,chance:0,prio:0,lines:[]},
  spin:{pose:'watch',expr:'normal',dur:2,chance:.3,prio:1,lines:['くるくる〜','まわってるね','どれどれ…']},
  reach:{pose:'point',expr:'surprise',dur:3,chance:1,prio:2,lines:['リーチ！','リーチだね','左右がそろったよ']},
  sp:{pose:'point',expr:'surprise',dur:2.5,chance:1,prio:2,lines:['流れ星がきた！','流星リーチ！','星がいっぱい！']},
  spsp:{pose:'cheer',expr:'surprise',dur:3,chance:1,prio:2,lines:['お城が光ってる！','天空城リーチ！','わあ、お城だ！']},
  bonus:{pose:'point',expr:'surprise',dur:3.5,chance:1,prio:3,lines:['大当たり！ 右打ちで右下をねらってね','そろった！ 強めに打って右下へ']},
  win:{pose:'cheer',expr:'happy',dur:4.5,chance:1,prio:3,lines:['大当たり終了！ {n}玉だよ','おつかれさま、{n}玉！'],next:'afterWin'},
  afterWin:{pose:'idle',expr:'happy',dur:3,chance:1,prio:1,lines:['いい区切り。ここで休むのもアリだよ','うれしい気分のまま、ひと休みしよっか']},
  miss:{pose:'idle',expr:'normal',dur:1.6,chance:.25,prio:1,lines:['はずれ〜','今回はなしだね','ざんねん。のんびりいこう']},
  empty:{pose:'idle',expr:'normal',dur:3,chance:1,prio:2,lines:['玉がなくなったよ。今日はここまでにする？']},
  soonBreak:{pose:'wave',expr:'normal',dur:3,chance:1,prio:2,lines:['もうすぐ休憩の時間だよ','そろそろひと休みしようね']},
  rest:{pose:'sleepy',expr:'sleepy',dur:1e6,chance:1,prio:3,lines:['ちょっと休憩〜']},
  resume:{pose:'wave',expr:'happy',dur:2.5,chance:1,prio:3,lines:['おかえり！','おかえり。ゆっくりいこうね']},
  end:{pose:'bow',expr:'closed',dur:6,chance:1,prio:3,lines:['今日はおつかれさま。またね']},
  bet:{pose:'nod',expr:'normal',dur:.5,chance:0,prio:0,lines:[]},
  lever:{pose:'watch',expr:'normal',dur:1.5,chance:.2,prio:1,lines:['スタート！','まわれ〜']},
  stop:{pose:'nod',expr:'normal',dur:.4,chance:0,prio:0,lines:[]},
  replay:{pose:'wave',expr:'happy',dur:1.8,chance:.7,prio:1,lines:['リプレイ。次はメダルいらないよ','リプレイだね']},
  bell:{pose:'clap',expr:'happy',dur:1.8,chance:.6,prio:1,lines:['ベル、{n}枚！','ベルがそろったよ']},
  cherry:{pose:'clap',expr:'happy',dur:1.8,chance:.8,prio:1,lines:['チェリー、{n}枚だよ','さくらんぼ〜']},
  watermelon:{pose:'cheer',expr:'happy',dur:2.4,chance:1,prio:2,lines:['スイカ！ {n}枚','スイカがそろった！']},
  big:{pose:'cheer',expr:'happy',dur:5,chance:1,prio:3,lines:['7がそろった！ BIGボーナスだよ','BIG！ しばらくベルがそろうよ']},
  bigEnd:{pose:'cheer',expr:'happy',dur:4.5,chance:1,prio:3,lines:['BIG終了！ {n}枚だよ','おつかれさま、{n}枚！'],next:'afterWin'},
  slotMiss:{pose:'idle',expr:'normal',dur:1,chance:.12,prio:1,lines:['はずれ〜','なにもなし']},
};
export const CPS=16;
const GREET_AT=1.2,CHAT_GAP=[16,26];

export function createNavi(kind){return {kind,pose:'idle',expr:'normal',poseAt:-9,poseUntil:0,line:'',lineAt:0,lineUntil:0,prio:0,next:null,nextAt:0,chatAt:GREET_AT,greeted:false,shown:0};}

export function lineFor(n,event,rand=Math.random,count=0){
  const e=EVENTS[event];if(!e||!e.lines.length)return '';
  return e.lines[Math.floor(rand()*e.lines.length)%e.lines.length].replace('{name}',KINDS[n.kind].name).replace('{n}',String(count));
}

// Starts a reaction. opts.count fills {n}; opts.chance overrides the event's chance (e.g. always speak after a reach).
export function react(n,event,t,{rand=Math.random,count=0,chance}={}){
  const e=EVENTS[event];if(!e)return;
  // A lower-priority reaction never interrupts a line that is still showing (e.g. a stop nod during a payout cheer).
  if(n.line&&t<n.lineUntil&&e.prio<n.prio)return;
  n.pose=e.pose;n.expr=e.expr;n.poseAt=t;n.poseUntil=t+e.dur;n.next=null;
  if(event==='hello')n.greeted=true;
  const p=chance??e.chance;
  if(p>0&&rand()<p){
    const line=lineFor(n,event,rand,count);
    n.line=line;n.lineAt=t;n.lineUntil=t+Math.max(2.4,line.length/CPS+1.8);n.prio=e.prio;n.shown=0;
    n.poseUntil=Math.max(n.poseUntil,Math.min(n.lineUntil,t+e.dur+1));
  }
  if(e.next){n.next=e.next;n.nextAt=Math.max(n.poseUntil,n.lineUntil)+.2;}
  n.chatAt=t+CHAT_GAP[0]+rand()*(CHAT_GAP[1]-CHAT_GAP[0]);
}

// Advances timers. busy: a draw or the reels are running (no idle chatter then). Returns how many characters of the
// current line were newly revealed, so the caller can play the voice blips.
// party: a bonus (BIG / jackpot rounds) is running after its opening show; between reactions the character dances to the music.
export function tick(n,t,{busy=false,party=false,rand=Math.random,reduced=false}={}){
  if(!n.greeted&&t>=GREET_AT)react(n,'hello',t,{rand});
  if(n.next&&t>=n.nextAt){const ev=n.next;n.next=null;react(n,ev,t,{rand});}
  // During a bonus the dance is kept going half a second at a time, so it eases out by itself when the bonus ends.
  if(party&&(n.pose==='dance'||t>=n.poseUntil)){if(n.pose!=='dance'){n.pose='dance';n.expr='happy';n.poseAt=t;}n.poseUntil=t+.5;}
  // While a draw or the reels run, the character keeps watching the screen; otherwise it goes back to idling.
  const rest=busy?'watch':'idle';if(t>=n.poseUntil&&n.pose!==rest){n.pose=rest;n.expr='normal';n.poseAt=t;}
  if(n.line&&t>=n.lineUntil){n.line='';n.prio=0;}
  if(!busy&&!party&&!n.line&&t>=n.chatAt)react(n,'chat',t,{rand});
  if(!n.line)return 0;
  const shown=reduced?n.line.length:Math.min(n.line.length,Math.floor((t-n.lineAt)*CPS));
  const added=Math.max(0,shown-n.shown);n.shown=shown;return added;
}

// --- drawing -------------------------------------------------------------------------------------------
// The characters are drawn as layered anime-style illustrations: line art in a tinted ink, a base colour, cel-shaded
// shadows and highlights clipped to each part, and glossy layered eyes. Parts are authored on a 200-unit-tall figure
// (feet at 0, head centre at y=-146) and scaled down by U, so the callers' scale stays about the same as before.
const U=.46,HEAD_Y=-146;
let ctx;
function grad(x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function radial(x,y,r0,r1,stops){const g=ctx.createRadialGradient(x,y,r0,x,y,r1);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function ellipse(x,y,rx,ry,fill,stroke,lw=1.2,rot=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function star(x,y,r,fill,points=5,inner=.45){ctx.beginPath();for(let i=0;i<points*2;i++){const a=-Math.PI/2+i*Math.PI/points,rr=i%2?r*inner:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
// Paths are SVG path data, turned into Path2D once (lazily, so the module also loads in Node for the tests).
const paths=new Map();function P(d){let p=paths.get(d);if(!p){p=new Path2D(d);paths.set(d,p);}return p;}
function shape(d,fill,stroke,lw=1.6){const p=P(d);if(fill){ctx.fillStyle=fill;ctx.fill(p);}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw*.8;ctx.lineJoin='round';ctx.stroke(p);}return p;}
// Fills only inside path d (for shading a part).
function within(d,fn){ctx.save();ctx.clip(P(d));fn();ctx.restore();}
// Volume: light comes from the upper left, so each part gets a soft highlight on its left, a cel shadow on its right
// and a darker bottom. dark is the shadow colour of that part.
function vol(d,x0,x1,y0,y1,dark){within(d,()=>{const w=x1-x0;
  ctx.fillStyle=grad(x0,0,x1,0,[[0,'#ffffff40'],[.3,'#ffffff00'],[.62,dark+'00'],[.7,dark+'66'],[1,dark+'aa']]);ctx.fillRect(x0-2,y0-2,w+4,y1-y0+4);
  ctx.fillStyle=grad(0,y0,0,y1,[[0,'#ffffff00'],[.75,dark+'00'],[1,dark+'66']]);ctx.fillRect(x0-2,y0-2,w+4,y1-y0+4);});}
function line(pts,color,lw,alpha=1){ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=6)ctx.bezierCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5]);ctx.stroke();ctx.restore();}
// Mirrors an SVG path horizontally (x → -x), so left/right parts are authored once.
const mirrored=new Map();function M(d){let m=mirrored.get(d);if(!m){let i=0;m=d.replace(/-?\d*\.?\d+/g,n=>' '+(i++%2===0?-n:+n));mirrored.set(d,m);}return m;}

// --- head (head-local coordinates: face centre at 0,0; the neck pivot is at 0,36) ---
const FACE='M-37-8C-38 16-27 32-10 36Q0 38 10 36C27 32 38 16 37-8C35-42-35-42-37-8Z';
const BACK_HAIR={
  sora:'M-40-30C-60 0-62 50-55 88C-53 100-57 110-64 120C-52 119-44 113-40 105C-38 113-32 119-23 122C-27 110-23 98-19 90L19 90C23 98 27 110 23 122C32 119 38 113 40 105C44 113 52 119 64 120C57 110 53 100 55 88C62 50 60 0 40-30Z',
  hana:'M-42-28C-56 -2-56 26-50 46C-46 56-48 62-52 68C-42 68-36 62-34 56C-30 62-24 66-16 66L16 66C24 66 30 62 34 56C36 62 42 68 52 68C48 62 46 56 50 46C56 26 56-2 42-28Z',
};
// Bang tips from right to left; the curve between two tips dips up to a gap, like separate locks of hair.
const TIPS=[[46,20],[37,10],[25,-1],[12,-4],[0,-2],[-12,-5],[-25,-1],[-37,10],[-46,20]],GAPS=[0,-12,-15,-18,-20,-15,-12,0];
const FRONT_HAIR=(()=>{let d='M-46 16C-56-34-31-62 0-62C31-62 56-34 46 16';
  for(let i=1;i<TIPS.length;i++){const [ax,ay]=TIPS[i-1],[bx,by]=TIPS[i],px=(ax+bx)/2+(ax>0?2:-2),py=GAPS[i-1];
    d+=`C${ax+(px-ax)*.15} ${ay+(py-ay)*.5} ${px} ${py+(ay-py)*.45} ${px} ${py}C${px} ${py+(by-py)*.45} ${bx+(px-bx)*.15} ${by+(py-by)*.5} ${bx} ${by}`;}
  return d+'Z';})();
const SIDE_LOCK='M-38-14C-49 6-47 27-49 47C-50 59-55 67-48 78C-44 66-40 55-38 41C-36 26-34 10-30-6Z';
const SIDE_LOCK2='M-33 2C-40 19-38 36-42 56Q-37 50-35 40C-33 27-31 15-28 4Z';
const TAIL='M-42-30C-58-34-68-18-66 4C-64 26-56 44-62 70C-52 62-48 52-48 42C-46 56-40 64-30 68C-38 52-40 38-42 24C-44 8-43-8-38-20Z';
// Cute, gentle eyes: round, with a big iris that fills almost the whole eye, a soft pupil and big highlights.
// The upper lash is a soft arch (no slant), so the face never looks stern.
const EYE_X=17,EYE_Y=13;
const EYE_SHAPE=side=>{const ex=side*EYE_X,ey=EYE_Y;
  return `M${ex-10} ${ey}C${ex-10} ${ey-9} ${ex-6} ${ey-13} ${ex} ${ey-13}C${ex+6} ${ey-13} ${ex+10} ${ey-9} ${ex+10} ${ey}C${ex+10} ${ey+8} ${ex+6} ${ey+12} ${ex} ${ey+12}C${ex-6} ${ey+12} ${ex-10} ${ey+8} ${ex-10} ${ey}Z`;};

function eye(k,side,expr,look,blink){
  const s=side,ex=s*EYE_X,ey=EYE_Y,L=k.line;
  if(expr==='happy'||expr==='closed'||expr==='sleepy'||(blink&&expr!=='surprise')){
    // Closed eyes: a round ^ for a smile, a soft smiling curve for calm, sleepy or blinking, with a tiny lash.
    if(expr==='happy'){line([ex-8.5,ey+3,ex-6,ey-5,ex+6,ey-5,ex+8.5,ey+3],L,2.8);}
    else{line([ex-9,ey+1,ex-5,ey+6.5,ex+5,ey+6.5,ex+9,ey+1],L,2.6);line([ex+s*8.6,ey+1.5,ex+s*10,ey+1,ex+s*11,ey,ex+s*12,ey-1.2],L,1.6);}
    return;
  }
  const surprise=expr==='surprise',d=EYE_SHAPE(s);
  shape(d,'#ffffff');
  within(d,()=>{
    const cx=ex+look*.6,cy=ey+1,rx=surprise?7.4:8.8,ry=surprise?9.6:11.6;
    ellipse(cx,cy,rx,ry,grad(0,cy-ry,0,cy+ry,[[0,k.eye[2]],[.5,k.eye[1]],[.9,k.eye[0]],[1,'#ffffff']]));
    ellipse(cx,cy+1,surprise?3.2:4.4,surprise?4.2:5.8,k.eye[3]+'d8');
    ellipse(ex,ey-12,11,4,k.eye[2]+'66');
    ellipse(cx,cy+ry*.6,rx*.7,ry*.28,k.eye[0]+'c0');
    // Big round highlight, a second smaller one, and a little sparkle.
    ellipse(cx-3,cy-4.4,surprise?3:3.8,surprise?3.6:4.6,'#ffffff');
    ellipse(cx+3.6,cy+4.4,2,2,'#ffffffee');
    ctx.save();ctx.translate(cx+3.8,cy-5.4);ctx.fillStyle='#ffffff';ctx.beginPath();for(let i=0;i<8;i++){const r=i%2?.5:1.8,a=i*Math.PI/4;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.fill();ctx.restore();
  });
  // Soft arched upper lash with a tiny curl at the outer corner; a faint lower line.
  line([ex-10.6,ey+.5,ex-10,ey-10,ex+10,ey-10,ex+10.6,ey+.5],L,2.6);
  line([ex+s*9.8,ey-5,ex+s*11.2,ey-6.5,ex+s*12.4,ey-7.4,ex+s*13.4,ey-8.6],L,1.6);
  line([ex+s*10.4,ey-1.5,ex+s*11.8,ey-2.4,ex+s*12.8,ey-3,ex+s*13.8,ey-3.8],L,1.3);
  line([ex-5,ey+11.6,ex-2,ey+12.6,ex+2,ey+12.6,ex+5,ey+11.6],L,1,.45);
}

function mouth(k,expr,talking,open){
  const L=k.line,y=30;
  if(talking&&open>.15||expr==='happy'&&!talking){const h=talking?1.8+3.6*open:3.4,w=talking?3.6:4.6;
    ctx.beginPath();ctx.moveTo(-w,y-1);ctx.quadraticCurveTo(0,y,w,y-1);ctx.quadraticCurveTo(w*.85,y+h,0,y+h);ctx.quadraticCurveTo(-w*.85,y+h,-w,y-1);ctx.closePath();
    ctx.fillStyle='#c4475f';ctx.fill();ctx.save();ctx.clip();ellipse(0,y+h+.8,w*.8,h*.6,'#ff9fb3');ctx.restore();
    ctx.strokeStyle=L;ctx.lineWidth=1.2;ctx.stroke();return;}
  if(expr==='surprise'){ellipse(0,y+1.5,2.4,2.8,'#c4475f',L,1.1);ellipse(0,y+2.8,1.4,1,'#ff9fb3');return;}
  // A small cat-like ω smile.
  line([-4.4,y-.6,-3.6,y+2,-1,y+2,0,y],L,1.4);line([0,y,1,y+2,3.6,y+2,4.4,y-.6],L,1.4);
}

function face(k,n,t,still,talking){
  const blink=!still&&(t%3.7<.12||(t+1.3)%7.9<.1),look=still?0:Math.sin(t*.45)*1.4;
  shape(FACE,radial(-8,-12,4,46,[[0,k.skin[0]],[.7,k.skin[0]],[1,k.skin[1]]]),k.line,1.7);
  // Shadow the bangs cast on the forehead, and a soft shade under the side hair.
  within(FACE,()=>{ctx.fillStyle=grad(0,-16,0,8,[[0,k.skin[2]],[1,k.skin[1]+'00']]);ctx.fillRect(-40,-20,80,26);
    ellipse(-38,8,9,26,k.skin[1]+'aa');ellipse(38,8,9,26,k.skin[1]+'aa');
    ctx.fillStyle=k.skin[2]+'99';ctx.beginPath();ctx.moveTo(-46,-30);for(const [tx,ty] of TIPS.slice().reverse())ctx.lineTo(tx+2,ty+5);ctx.lineTo(46,-30);ctx.closePath();ctx.fill();
    // Cel shadow along the right cheek and jaw, a soft shade under the chin, and a sheen on the left cheek and the nose.
    ctx.fillStyle=k.skin[2]+'88';ctx.beginPath();ctx.moveTo(40,-12);ctx.bezierCurveTo(30,4,32,22,12,40);ctx.lineTo(40,40);ctx.closePath();ctx.fill();
    ctx.fillStyle=grad(0,24,0,38,[[0,k.skin[1]+'00'],[1,k.skin[2]+'99']]);ctx.fillRect(-40,24,80,16);
    ellipse(-22,14,6,3.4,'#ffffffaa',null,1,-.3);ellipse(-.6,23,1.4,.9,'#ffffffcc');});
  // Blush with a few hatch lines.
  for(const s of [-1,1])ellipse(s*25,26,9,5.4,radial(s*25,26,0,9,[[0,'#ff7fa2cc'],[1,'#ff7fa200']]));
  for(const s of [-1,1])for(let i=0;i<3;i++)line([s*(21+i*3.4),28,s*(21.6+i*3.4),26.5,s*(22.4+i*3.4),25,s*(23+i*3.4),23.5],'#e8708c',.9,.55);
  eye(k,-1,n.expr,look,blink);eye(k,1,n.expr,look,blink);
  // Brows show through the bangs.
  const by=n.expr==='surprise'?-10:-7;ctx.save();ctx.globalAlpha=.32;for(const s of [-1,1])line([s*23,by+1,s*20,by-1.6,s*14,by-1.6,s*11,by+.4],k.hairLine,1.3);ctx.restore();
  ellipse(0,24,.9,.6,k.skin[2]);
  const open=talking&&!still?.5+.5*Math.sin(t*22):talking?.6:0;mouth(k,n.expr,talking,open);
}

function hairFront(k){
  const H=k.hair,HL=k.hairLine;
  for(const s of [-1,1]){const d1=s<0?SIDE_LOCK:M(SIDE_LOCK),d2=s<0?SIDE_LOCK2:M(SIDE_LOCK2);
    shape(d1,grad(0,-14,0,78,[[0,H[1]],[.6,H[2]],[1,H[3]]]),HL,1.5);vol(d1,s<0?-50:30,s<0?-30:50,-14,78,H[3]);within(d1,()=>{line([s*38,-4,s*44,14,s*42,36,s*46,64],H[0],2.2,.7);});
    shape(d2,grad(0,0,0,56,[[0,H[1]],[1,H[2]]]),HL,1.3);}
  const fill=grad(0,-62,0,16,[[0,H[1]],[.5,H[1]],[.85,H[2]],[1,H[3]]]);shape(FRONT_HAIR,fill,HL,1.7);
  within(FRONT_HAIR,()=>{ctx.fillStyle=radial(-22,-48,2,40,[[0,'#ffffff66'],[1,'#ffffff00']]);ctx.fillRect(-60,-70,120,90);
    // Darker hair in the gaps between locks, and the glossy "angel ring" highlight across the crown.
    ctx.fillStyle=grad(0,-36,0,-14,[[0,H[2]+'00'],[1,H[2]+'88']]);ctx.fillRect(-50,-36,100,60);
    ellipse(-30,-26,18,28,H[2]+'55',null,1,.4);
    ctx.beginPath();for(let x=-44;x<=44;x+=2){const y=-36+(x/34)**2*14;x===-44?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.strokeStyle=H[3]+'70';ctx.lineWidth=6;ctx.stroke();
    for(const x of [-33,-21,-9,4,16,28]){const y=-44+(x/34)**2*14;ellipse(x,y,6.4,2,'#ffffff',null,1,Math.atan(x/34*.8));}
    for(let i=1;i<TIPS.length-1;i++){const [tx,ty]=TIPS[i];line([tx,ty-1,tx*1.01,ty-7,tx*.96,ty-13,tx*.9,ty-19],HL,.9,.5);}
    // Round crown: shadow on the right half, glossy strands on the left, deep shade at the tips of the locks.
    ctx.fillStyle=H[3]+'66';ctx.beginPath();ctx.moveTo(4,-62);ctx.bezierCurveTo(40,-58,56,-30,50,16);ctx.lineTo(60,16);ctx.lineTo(60,-70);ctx.closePath();ctx.fill();
    for(const [x,y,len] of [[-26,-46,20],[-16,-52,16],[-34,-34,16]])line([x,y,x-3,y+len*.4,x-4,y+len*.8,x-5,y+len],'#ffffff',1.6,.65);
    for(let i=1;i<TIPS.length-1;i++){const [tx,ty]=TIPS[i];ellipse(tx,ty-3,4,5,H[3]+'55');}
  });
  line([-46,14,-54,-30,-32,-60,0,-62],'#ffffff',1.6,.45);
  line([-6,-60,-10,-74,4,-84,14,-74],HL,4.4);line([-6,-60,-10,-74,4,-84,14,-74],H[1],2.6);
}

function tiara(k,t,still){
  const T=k.trim,TD=k.trimDark;
  if(k.accent==='star'){
    line([-38,-30,-26,-48,26,-48,38,-30],TD,4.2);line([-38,-30,-26,-48,26,-48,38,-30],T,2.4);
    // Crest: a gold four-point star with a blue gem, and filigree wings either side.
    for(const s of [-1,1]){line([s*4,-48,s*12,-60,s*22,-54,s*20,-46],TD,3);line([s*4,-48,s*12,-60,s*22,-54,s*20,-46],T,1.6);ellipse(s*20,-46,2,2,k.gem,TD,.8);}
    star(0,-55,15,TD,4,.32);star(0,-55.5,13,grad(-10,-68,10,-44,[[0,'#fff6cf'],[.5,T],[1,TD]]),4,.32);
    ellipse(0,-55,4.6,5.6,radial(-1.4,-57,.5,6,[[0,'#e8f7ff'],[.4,k.gem],[1,'#1a3b8a']]),TD,1);ellipse(-1.2,-57,1.3,1.6,'#fff');
    // Her signature star on the right side, swaying a little.
    ctx.save();ctx.translate(36,-36);ctx.rotate(still?0:Math.sin(t*1.7)*.12);star(0,0,10,TD);star(0,-.4,8.4,grad(-7,-7,7,7,[[0,'#fff6c8'],[.5,'#ffd34d'],[1,'#d99a1c']]));ellipse(-2,-3,1.4,1,'#fff');ctx.restore();
  }else{
    line([-40,-26,-28,-46,28,-46,40,-26],TD,3.6);line([-40,-26,-28,-46,28,-46,40,-26],T,2);
    const flower=(x,y,r,rot)=>{ctx.save();ctx.translate(x,y);ctx.rotate(still?rot:rot+Math.sin(t*1.5+x)*.08);
      for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*r*.62,Math.sin(a)*r*.62,r*.55,r*.4,grad(0,0,Math.cos(a)*r,Math.sin(a)*r,[[0,'#ff7fb2'],[1,'#fff0f6']]),'#b83a72',.9,a);}
      ellipse(0,0,r*.28,r*.28,'#ffd76a','#a8741c',.8);ctx.restore();};
    for(const s of [-1,1]){ellipse(s*14,-50,6,2.6,'#6fbf73','#2f7a3a',.8,s*-.5);ellipse(s*32,-40,6,2.6,'#6fbf73','#2f7a3a',.8,s*.8);}
    flower(-24,-46,10,.2);flower(26,-44,10,-.3);flower(0,-54,13,0);flower(-46,-26,7.5,.5);
    ctx.save();ctx.translate(40,-30);ctx.rotate(still?0:Math.sin(t*1.7)*.12);flower(0,0,8,0);ctx.restore();
  }
}

// --- body (figure coordinates: feet at 0,0) ---
const SKIRT_UNDER=(()=>{let d='M-11-84C-17-68-25-52-31-40';for(let i=0;i<6;i++){const x=-31+i*62/6;d+=`Q${x+62/12} ${-33} ${x+62/6} -40`;}return d+'C25-52 17-68 11-84Z';})();
const SKIRT_PANEL='M-11-84C-20-68-30-54-36-41Q-30-36-21-39C-17-54-10-70-5-84Z';
const BODICE='M-10-82C-12-92-15-99-15-106Q0-111 15-106C15-99 12-92 10-82Z';
const SLEEVE='M-4.5 0C-5.5 8-7.5 16-9 24Q0 28.5 9 24C7.5 16 5.5 8 4.5 0Z';
const BOW_TAIL='M-6-84C-14-76-22-62-28-46L-20-48C-16-62-10-74-2-82Z';
const CRYSTAL='M0 0L-18-20L-46-30L-36-12L-50-4L-30 4L-40 20L-14 10Z';
const WING='M0 0C-10-14-34-22-46-12C-40-6-34-2-26 0C-36 4-42 12-40 20C-28 18-12 10 0 0Z';

function arm(k,side,angle){
  ctx.save();ctx.translate(side*14,-103);ctx.rotate(-side*angle);
  ellipse(0,28.5,4.8,4.6,k.skin[0],k.line,1.3);ellipse(side*-3.6,26.6,1.8,2.6,k.skin[0],k.line,1);
  shape(SLEEVE,grad(-9,0,9,0,[[0,k.dress[1]],[.45,k.dress[0]],[1,k.dress[1]]]),k.line,1.4);vol(SLEEVE,side<0?-9:9,side<0?9:-9,0,28,k.shade);
  within(SLEEVE,()=>{ellipse(0,25,10,4,k.dress[2]);ctx.fillStyle=k.trim;ctx.fillRect(-10,20,20,1.6);});
  line([-9,24,-3,28.5,3,28.5,9,24],k.line,1.4);
  ctx.restore();
}

function body(k,m,t,still){
  const D=k.dress,L=k.line;
  for(const s of [-1,1])shape(s<0?BOW_TAIL:M(BOW_TAIL),grad(0,-84,0,-46,[[0,D[2]],[1,D[3]]]),L,1.3);
  // Legs: white tights and small boots with a gold strap.
  for(const s of [-1,1]){ctx.lineCap='round';ctx.strokeStyle=L;ctx.lineWidth=8.6;ctx.beginPath();ctx.moveTo(s*6.5,-42);ctx.lineTo(s*7,-8);ctx.stroke();ctx.strokeStyle='#fbfbff';ctx.lineWidth=6.2;ctx.stroke();
    ctx.strokeStyle=k.shade+'aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s*6.5+2,-36);ctx.lineTo(s*7+2,-12);ctx.stroke();ctx.strokeStyle='#ffffffcc';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(s*6.5-1.6,-36);ctx.lineTo(s*7-1.6,-14);ctx.stroke();ctx.fillStyle=k.shade+'88';ctx.fillRect(s*6.5-3,-42,6,4);
    ctx.beginPath();ctx.moveTo(s*2.5,-12);ctx.quadraticCurveTo(s*1.5,-1,s*4,0);ctx.lineTo(s*13.5,0);ctx.quadraticCurveTo(s*14,-6,s*11.5,-12);ctx.closePath();ctx.fillStyle=grad(0,-12,0,0,[[0,D[2]],[1,D[3]]]);ctx.fill();ctx.strokeStyle=L;ctx.lineWidth=1.3;ctx.stroke();
    ctx.fillStyle=k.trim;ctx.fillRect(s>0?3:-12,-9,9,1.8);ellipse(s*7.5,-3.5,2,1,'#ffffff88');}
  shape(SKIRT_UNDER,grad(0,-84,0,-34,[[0,D[0]],[.7,D[0]],[1,D[1]]]),L,1.4);
  vol(SKIRT_UNDER,-32,32,-84,-34,k.shade);
  within(SKIRT_UNDER,()=>{ctx.fillStyle=k.shade+'70';for(const x of [-12,0,12,24]){ctx.beginPath();ctx.moveTo(x*.3,-84);ctx.quadraticCurveTo(x*.7+1,-60,x+3,-36);ctx.lineTo(x+8,-36);ctx.quadraticCurveTo(x*.7+3,-60,x*.3+1,-84);ctx.fill();}
    for(const x of [-18,-6,6,18])line([x*.35,-82,x*.6,-66,x*.85,-52,x,-38],D[1],1.6,.9);ctx.fillStyle=k.trim+'aa';ctx.fillRect(-40,-42,80,1.4);
    for(let i=-2;i<=2;i++)ellipse(i*7,-45+Math.abs(i)*.6,1.3,1.3,k.trim);if(k.accent==='star'){star(0,-58,5.4,k.trimDark,4,.35);star(0,-58.3,4.4,k.trim,4,.35);}else for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*2.6,-58+Math.sin(a)*2.6,2.2,1.6,D[2],null,1,a);}});
  for(const s of [-1,1]){const d=s<0?SKIRT_PANEL:M(SKIRT_PANEL);shape(d,grad(s*-36,-84,s*-6,-40,[[0,D[3]],[.5,D[2]],[1,D[2]]]),L,1.4);
    vol(d,s<0?-36:5,s<0?-5:36,-84,-38,D[3]);within(d,()=>{line([s*9,-82,s*16,-66,s*22,-54,s*26,-42],D[3],1.4,.7);line([s*12,-82,s*20,-66,s*26,-54,s*32,-42],'#ffffff',1,.25);});
    line([s*5,-84,s*10,-70,s*17,-54,s*21,-39],k.trim,1.8);line([s*21,-39,s*26,-37,s*31,-36,s*36,-41],k.trim,1.8);}
  shape(BODICE,grad(-15,0,15,0,[[0,D[1]],[.4,D[0]],[1,D[1]]]),L,1.5);
  vol(BODICE,-15,15,-110,-82,k.shade);
  within(BODICE,()=>{ellipse(0,-110,16,7,'#2a1a5a30');ctx.fillStyle=grad(0,-92,0,-82,[[0,D[2]],[1,D[3]]]);ctx.fillRect(-16,-92,32,10);ctx.fillStyle=k.trim;ctx.fillRect(-16,-93,32,1.6);ctx.fillRect(-16,-83.5,32,1.4);
    line([-3,-92,-1,-89,1,-89,3,-86],k.trim,.9);line([3,-92,1,-89,-1,-89,-3,-86],k.trim,.9);});
  // Puff sleeves on the shoulders and a gem brooch at the collar.
  for(const s of [-1,1]){ellipse(s*15,-104,7,5.6,grad(0,-110,0,-98,[[0,D[0]],[1,D[1]]]),L,1.3,s*.3);line([s*10,-101,s*13,-99,s*17,-99,s*21,-101],k.trim,1.2);}
  line([-11,-107,-6,-102,6,-102,11,-107],k.trim,1.6);
  ellipse(0,-102,3.8,4.4,radial(-1,-103.5,.5,5,[[0,'#ffffff'],[.4,k.gem],[1,D[3]]]),k.trimDark,1.2);ellipse(-1,-103.5,1,1.2,'#fff');
}

// Small wings behind the character, matching its machine: crystal wings with stars for ソラ, sheer petal wings for ハナ.
function wings(k,m){
  for(const side of [-1,1]){ctx.save();ctx.translate(side*8,-104);ctx.rotate(side*(-.38-m.wing));ctx.scale(-side*1.5,1.5);ctx.globalAlpha=.9;
    if(k.accent==='star'){shape(CRYSTAL,grad(0,0,-50,-10,[[0,'#ffffffee'],[.5,k.wing+'cc'],[1,'#5f8fe8aa']]),'#ffffffdd',1.2);
      line([-2,-2,-16,-14,-30,-24,-44,-28],'#ffffff',1,.8);line([-2,2,-14,4,-26,8,-36,14],'#ffffff',1,.6);star(-44,-27,3.4,'#fff6c8');star(-36,14,2.6,'#fff6c8');}
    else{shape(WING,grad(0,0,-46,0,[[0,'#ffffffee'],[1,k.wing+'aa']]),'#ffffffcc',1.2);line([-2,-2,-14,-10,-28,-14,-40,-12],'#ffffff',1,.8);line([-2,2,-14,6,-26,10,-36,16],'#ffffff',1,.6);}
    ctx.restore();}
}

// Body motion for a pose at age a (seconds since the pose began). Arm angles: 0 = hanging down, π/2 = straight out, π = up;
// negative swings the hand toward the chest. Distances are in figure units.
function motion(pose,a,still){
  const s=still?0:1,m={bob:Math.sin(a*2.4)*3*s,jump:0,tilt:Math.sin(a*.9)*.04*s,arms:[.22+Math.sin(a*2.4)*.05*s,.22-Math.sin(a*2.4)*.05*s],headDrop:0,lean:0,wing:Math.sin(a*5)*.12*s};
  if(pose==='wave'){m.arms[1]=2.35+Math.sin(a*11)*.3*s;m.tilt=.08;}
  else if(pose==='cheer'){m.arms=[2.25+Math.sin(a*12)*.15*s,2.25-Math.sin(a*12)*.15*s];m.jump=Math.abs(Math.sin(a*6.5))*20*s;m.wing=Math.sin(a*14)*.3*s;m.tilt=0;}
  else if(pose==='dance'){const b=Math.sin(a*7.3);m.arms=[1.2+b*.9*s,1.2-b*.9*s];m.jump=Math.abs(Math.sin(a*7.3))*7*s;m.tilt=b*.12*s;m.lean=b*5*s;m.wing=Math.sin(a*14)*.25*s;}
  else if(pose==='clap'){const c=Math.abs(Math.sin(a*9))*s;m.arms=[-.5-c*.45,-.5-c*.45];m.jump=Math.abs(Math.sin(a*9))*4*s;}
  else if(pose==='watch'){m.arms=[-.9,-.9];m.lean=4;m.bob=Math.sin(a*6)*1.8*s;m.tilt=.06*Math.sin(a*1.5)*s;}
  else if(pose==='point'){m.arms[1]=1.15+Math.sin(a*8)*.08*s;m.arms[0]=.35;m.jump=a<.3?Math.sin(a/.3*Math.PI)*13*s:0;m.tilt=-.06;}
  else if(pose==='nod'){m.headDrop=Math.sin(Math.min(1,a/.4)*Math.PI)*7*s;}
  else if(pose==='bow'){const k=Math.min(1,a/.6);m.headDrop=12*k;m.lean=8*k;m.arms=[-.75,-.75];m.tilt=0;}
  else if(pose==='sleepy'){m.tilt=.22;m.arms=[.12,.12];m.bob=Math.sin(a*1.3)*2.6*s;m.wing=Math.sin(a*1.3)*.05*s;}
  return m;
}

function headTransform(m){ctx.translate(0,HEAD_Y+m.headDrop);ctx.translate(0,36);ctx.rotate(m.tilt);ctx.translate(0,-36);}

// Draws the character with its feet at (x,y). t: the game clock in seconds.
// Lighting over the finished figure in the buffer: a soft key light from the upper left and a darker lower right,
// then a cool rim light along the right-hand edges (the edge left over when the silhouette is shifted left).
let rim=null;
function light(bw,bh,u){
  const g=buf.getContext('2d');g.save();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-atop';
  g.fillStyle=g.createLinearGradient(0,0,bw,bh);g.fillStyle.addColorStop(0,'#fff6ff2e');g.fillStyle.addColorStop(.45,'#ffffff00');g.fillStyle.addColorStop(1,'#1a0f4a5a');g.fillRect(0,0,bw,bh);
  rim??=document.createElement('canvas');if(rim.width<buf.width||rim.height<buf.height){rim.width=buf.width;rim.height=buf.height;}
  const r=rim.getContext('2d'),d=Math.max(1,2.4*u);r.globalCompositeOperation='copy';r.drawImage(buf,0,0);r.globalCompositeOperation='destination-out';r.drawImage(buf,-d,d*.5);
  r.globalCompositeOperation='source-in';r.fillStyle='#e8f4ff';r.fillRect(0,0,bw,bh);
  g.globalAlpha=.75;g.drawImage(rim,0,0);g.restore();
}
// The figure is painted into an offscreen buffer first, then put on the LCD with a soft white halo, so it stands out
// from the busy background like the cut-out mini characters of a real machine.
let buf=null;
export function drawNavi(c,n,t,{x,y,scale=1,gentle=true,reduced=false,flip=false}){
  const art=drawPortrait(c,n,t,{x,y,scale,gentle,reduced,flip});if(art){ctx=c;emotes(n,t,art,{scale,gentle,still:reduced});return;}
  const k=KINDS[n.kind],still=reduced,a=t-n.poseAt,m=motion(n.pose,a,still),talking=!!n.line&&t<n.lineUntil&&n.shown<n.line.length;
  // A payout cheer steps forward a little, like a cut-in.
  if(n.pose==='cheer'&&n.prio>=3)scale*=1+.22*(still?1:Math.min(1,a/.35))*Math.min(1,(n.poseUntil-t)/.4);
  const f=scale*U,tr=c.getTransform(),px=Math.hypot(tr.a,tr.b)||1,W=200,H=290,OX=100,OY=262;
  ctx=c;ctx.save();ctx.translate(x,y);ctx.scale(f,f);ellipse(0,2,34-m.jump*.5,6,radial(0,2,0,34,[[0,'#0008'],[1,'#0000']]));ctx.restore();
  if(typeof document!=='undefined'){buf??=document.createElement('canvas');const bw=Math.ceil(W*f*px),bh=Math.ceil(H*f*px);if(buf.width<bw||buf.height<bh){buf.width=Math.max(buf.width,bw);buf.height=Math.max(buf.height,bh);}
    ctx=buf.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,bw+2,bh+2);ctx.setTransform(flip?-f*px:f*px,0,0,f*px,OX*f*px,OY*f*px);}
  else{ctx.save();ctx.translate(x,y);ctx.scale(flip?-f:f,f);}
  ctx.translate(m.lean,-m.jump-m.bob);
  wings(k,m);
  ctx.save();headTransform(m);shape(BACK_HAIR[n.kind],grad(0,-30,0,120,[[0,k.hair[2]],[1,k.hair[3]]]),k.hairLine,1.6);
  if(n.kind==='hana')for(const s of [-1,1])shape(s<0?TAIL:M(TAIL),grad(0,-26,0,66,[[0,k.hair[1]],[1,k.hair[3]]]),k.hairLine,1.5);
  within(BACK_HAIR[n.kind],()=>{const H=k.hair;
    for(let i=0;i<13;i++){const x=-60+i*10;line([x*.7,-30,x*.95,10,x*1.02,60,x*1.06,124],i%2?H[3]+'70':H[1]+'60',7);}
    ctx.fillStyle=grad(0,50,0,124,[[0,H[3]+'00'],[1,H[3]+'b0']]);ctx.fillRect(-70,50,140,80);
    ellipse(0,44,34,38,H[3]+'dd');
    for(const [x,c,a] of [[-48,'#ffffff',.6],[-38,'#ffffff',.35],[44,'#ffffff',.3]])line([x*.8,-10,x*.98,20,x*1.04,50,x*1.08,90],c,2,a);
    for(const x of [-44,-30,30,44])line([x*.8,0,x,30,x*1.05,60,x*1.1,100],k.hairLine,1,.35);ctx.fillStyle=grad(-60,0,60,0,[[0,'#ffffff55'],[.2,'#ffffff00'],[.8,'#ffffff00'],[1,'#ffffff33']]);ctx.fillRect(-70,-40,140,170);});ctx.restore();
  body(k,m,t,still);
  const up=m.arms.map(v=>v>1.6);m.arms.forEach((v,i)=>{if(!up[i])arm(k,i?1:-1,v);});
  ctx.save();headTransform(m);
  ctx.fillStyle=k.skin[1];ctx.fillRect(-5,28,10,14);ctx.strokeStyle=k.line;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-5,30);ctx.lineTo(-5,41);ctx.moveTo(5,30);ctx.lineTo(5,41);ctx.stroke();
  face(k,n,t,still,talking);hairFront(k);tiara(k,t,still);
  if(n.pose==='sleepy'&&!still){for(let i=0;i<3;i++){const p=(t*.6+i/3)%1;ctx.globalAlpha=Math.sin(p*Math.PI);ctx.font='bold 20px Arial';ctx.fillStyle='#e8f0ff';ctx.fillText('z',46+p*30+i*4,-50-p*34);}ctx.globalAlpha=1;}
  ctx.restore();
  // Raised arms go in front of the hair.
  m.arms.forEach((v,i)=>{if(up[i])arm(k,i?1:-1,v);});
  if(ctx===c)ctx.restore();
  else{light(Math.ceil(W*f*px),Math.ceil(H*f*px),f*px);ctx=c;ctx.save();ctx.shadowColor=gentle?'#ffffffaa':'#ffffffdd';ctx.shadowBlur=Math.max(3,5*scale)*px;const bw=W*f,bh=H*f;
    ctx.drawImage(buf,0,0,Math.ceil(bw*px),Math.ceil(bh*px),x-OX*f,y-OY*f,Math.ceil(bw*px)/px,Math.ceil(bh*px)/px);ctx.restore();}
  // Sparkles around a cheer (also for clap, smaller).
  if((n.pose==='cheer'||n.pose==='clap'||n.pose==='dance')&&t<n.poseUntil){
    const count=still?3:n.pose==='cheer'?9:n.pose==='dance'?6:4,alpha=gentle?.55:.95;ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<count;i++){const p=still?.5:(a*.9+i/count)%1,ang=i*2.4+(still?0:a*.6),r=(30+p*30)*scale;
      ctx.globalAlpha=alpha*Math.sin(p*Math.PI);star(x+Math.cos(ang)*r,y-50*scale+Math.sin(ang)*r*.8,(3+2*(i%3))*scale*(1-p*.4),i%2?'#fff6c8':k.wing);}
    ctx.restore();
  }
}

// Little marks around the illustrated character, like the effects that pop around a real machine's mini characters:
// sparkles for a cheer, clap or dance, a "!" for a reach or a bonus, notes while waving and z's
// while resting. head: where the head is drawn this frame, so the marks follow the jumps.
function emotes(n,t,{head:[hx,hy],height},{scale,gentle,still}){
  const a=t-n.poseAt,active=t<n.poseUntil,pose=n.pose,k=KINDS[n.kind],alpha=gentle?.6:.95;
  ctx.save();
  if((pose==='cheer'||pose==='clap'||pose==='dance')&&active){
    const count=still?3:pose==='cheer'?9:pose==='dance'?6:4;ctx.globalCompositeOperation='lighter';
    for(let i=0;i<count;i++){const p=still?.5:(a*.9+i/count)%1,ang=i*2.4+(still?0:a*.6),r=height*(.3+p*.28);
      ctx.globalAlpha=alpha*Math.sin(p*Math.PI);star(hx+Math.cos(ang)*r,hy+height*.12+Math.sin(ang)*r*.8,(3+2*(i%3))*scale*(1-p*.4),i%2?'#fff6c8':k.wing);}
  }
  else if(pose==='point'&&active&&a<2.2){
    // "!" pops in with a little overshoot, then fades.
    const pop=still?1:Math.min(1,a/.15)*(1+.25*Math.max(0,Math.sin(Math.min(1,a/.3)*Math.PI))),fade=Math.min(1,(2.2-a)/.4);
    ctx.globalAlpha=fade;ctx.translate(hx+height*.24,hy-height*.24);ctx.scale(pop,pop);ctx.rotate(.12);
    ctx.font=`900 ${Math.round(26*scale)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
    ctx.lineWidth=4*scale;ctx.strokeStyle='#7a2a10';ctx.strokeText('!',0,0);ctx.fillStyle='#ffe25a';ctx.fillText('!',0,0);
  }
  else if(pose==='wave'&&active&&!still){
    for(let i=0;i<2;i++){const p=(a*.7+i/2)%1;ctx.globalAlpha=alpha*Math.sin(p*Math.PI);note(hx+height*(.22+p*.14)+i*4*scale,hy-height*(.1+p*.3),scale,k.ribbon);}
  }
  else if(pose==='sleepy'&&!still){
    ctx.font=`bold ${Math.round(14*scale)}px Arial`;ctx.fillStyle='#e8f0ff';
    for(let i=0;i<3;i++){const p=(t*.6+i/3)%1;ctx.globalAlpha=Math.sin(p*Math.PI);ctx.fillText('z',hx+height*(.2+p*.2)+i*3*scale,hy-height*(.15+p*.25));}
  }
  ctx.restore();
}

// An eighth note: a tilted head, a stem and a flag, outlined in white so it reads on the busy LCD.
function note(x,y,s,color){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineJoin='round';
  const path=()=>{ctx.beginPath();ctx.ellipse(-2.6,5,3.4,2.5,-.4,0,Math.PI*2);ctx.moveTo(.4,4.5);ctx.lineTo(.4,-7);ctx.quadraticCurveTo(4.5,-5,5.5,-1);ctx.quadraticCurveTo(3.5,-3.5,.4,-3.8);};
  path();ctx.lineWidth=3.2;ctx.strokeStyle='#ffffffd0';ctx.stroke();path();ctx.lineWidth=1.4;ctx.strokeStyle=color;ctx.stroke();
  ctx.beginPath();ctx.ellipse(-2.6,5,3.4,2.5,-.4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.restore();
}

// Wraps a line into rows that fit maxW (Japanese has no spaces, so it breaks between characters).
export function wrap(measure,line,maxW){const rows=[];let row='';for(const ch of line){if(row&&measure(row+ch)>maxW){rows.push(row);row=ch.trim()?ch:'';}else row+=ch;}if(row)rows.push(row);return rows;}

// The character's line, typed out as text only. box: [x,y,w] of the area the text wraps in.
export function drawBubble(c,n,t,{box:[bx,by,bw],size=14,reduced=false}){
  ctx=c;if(!n.line||t>=n.lineUntil)return;
  const age=t-n.lineAt,left=n.lineUntil-t,alpha=Math.min(1,age/.15,left/.3),pop=reduced?1:Math.min(1,.85+age/.15*.15);
  const font=`bold ${size}px "Hiragino Maru Gothic ProN","Rounded Mplus 1c","Noto Sans JP","Hiragino Sans",sans-serif`;ctx.font=font;
  const rows=wrap(s=>ctx.measureText(s).width,n.line,bw-24),lh=size*1.3,bh=rows.length*lh+16,shown=reduced?n.line.length:Math.min(n.line.length,Math.floor(age*CPS));
  ctx.save();ctx.globalAlpha=Math.max(0,alpha);ctx.translate(bx+bw/2,by+bh/2);ctx.scale(pop,pop);ctx.translate(-(bx+bw/2),-(by+bh/2));
  // Text only (no window): white letters with a thick outline in the character's ink colour and a soft glow in its
  // ribbon colour, so the line stays readable over the bright LCD.
  const k=KINDS[n.kind];ctx.textAlign='left';ctx.font=font;ctx.lineJoin='round';let left2=shown;
  rows.forEach((r,i)=>{const part=[...r].slice(0,Math.max(0,left2)).join('');left2-=[...r].length;const x=bx+12,y=by+8+size+i*lh;
    ctx.shadowColor=k.ribbon+'cc';ctx.shadowBlur=size*.6;ctx.lineWidth=size*.32;ctx.strokeStyle=k.line;ctx.strokeText(part,x,y);
    ctx.shadowColor='transparent';ctx.lineWidth=size*.14;ctx.strokeStyle='#ffffff';ctx.strokeText(part,x,y);
    ctx.fillStyle='#ffffff';ctx.fillText(part,x,y);});
  ctx.restore();
}

// LCD navigator characters: original chibi mascots that live on the LCD and react to what just happened, like the
// mini characters of a real machine. ハナ lives on AURORA (pink, flower), ソラ on ASTRAL (silver-blue, star).
// Rules: reactions come at or after a known result (spin start, reach, stop, payout); the lever / spin reactions are the
// same for every game, so they never hint at the outcome. No near-miss teasing and no lines that push for more play;
// gentle lines about breaks are fine. Gentle mode keeps the motion but dims sparkles; prefers-reduced-motion keeps poses still.

// Palettes. hair: highlight, base, shadow, deep shadow; eye: bottom glow, iris, top of iris, pupil, upper white shade;
// dress: white, white shade, colour, colour shadow; skin: base, shade, deep shade.
export const KINDS={
  hana:{name:'ハナ',pitch:1.15,line:'#5a2740',hairLine:'#8e3a5c',skin:['#fff4ef','#f7d2cc','#eaa9b0'],hair:['#fff6f9','#ffcfdc','#f39ab6','#cf5f88'],eye:['#ffd6e4','#e8578f','#7d1d4c','#2a0a1a','#f3dce6'],dress:['#ffffff','#f4dbe6','#ff86b4','#c8457f'],trim:'#ebc76c',trimDark:'#a87a22',gem:'#ff5fa8',ribbon:'#ff5fa8',wing:'#ffb6dc',accent:'flower'},
  sora:{name:'ソラ',pitch:.95,line:'#33295e',hairLine:'#4d4590',skin:['#fff4ef','#f5d3cd','#e3aab2'],hair:['#ffffff','#e2e0fb','#b5b1ea','#8780cf'],eye:['#c9ecff','#5e86ee','#26308c','#100d36','#dde3f6'],dress:['#ffffff','#dde3f6','#3553bd','#1c2c7a'],trim:'#ebc76c',trimDark:'#a87a22',gem:'#4fb8ff',ribbon:'#5fb6ff',wing:'#a9d4ff',accent:'star'},
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
export function tick(n,t,{busy=false,rand=Math.random,reduced=false}={}){
  if(!n.greeted&&t>=GREET_AT)react(n,'hello',t,{rand});
  if(n.next&&t>=n.nextAt){const ev=n.next;n.next=null;react(n,ev,t,{rand});}
  // While a draw or the reels run, the character keeps watching the screen; otherwise it goes back to idling.
  const rest=busy?'watch':'idle';if(t>=n.poseUntil&&n.pose!==rest){n.pose=rest;n.expr='normal';n.poseAt=t;}
  if(n.line&&t>=n.lineUntil){n.line='';n.prio=0;}
  if(!busy&&!n.line&&t>=n.chatAt)react(n,'chat',t,{rand});
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
function line(pts,color,lw,alpha=1){ctx.save();ctx.globalAlpha*=alpha;ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=6)ctx.bezierCurveTo(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5]);ctx.stroke();ctx.restore();}
// Mirrors an SVG path horizontally (x → -x), so left/right parts are authored once.
const mirrored=new Map();function M(d){let m=mirrored.get(d);if(!m){let i=0;m=d.replace(/-?\d*\.?\d+/g,n=>' '+(i++%2===0?-n:+n));mirrored.set(d,m);}return m;}

// --- head (head-local coordinates: face centre at 0,0; the neck pivot is at 0,36) ---
const FACE='M-36 -10C-37 12-27 27-11 34Q0 39 11 34C27 27 37 12 36-10C34-42-34-42-36-10Z';
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
const EYE_SHAPE=side=>{const s=side,ex=s*16,ey=11,ox=ex+s*11,ix=ex-s*9.5;
  return `M${ox} ${ey-5}C${ox-s*3} ${ey-13} ${ix+s*4} ${ey-14} ${ix} ${ey-7}C${ix-s} ${ey+2} ${ix+s*2} ${ey+13} ${ex} ${ey+13}C${ex+s*7} ${ey+13} ${ox} ${ey+6} ${ox} ${ey-5}Z`;};

function eye(k,side,expr,look,blink){const ex=side*16,ey=11;ctx.save();ctx.translate(ex,ey);ctx.scale(1.1,1.1);ctx.translate(-ex,-ey);eyeParts(k,side,expr,look,blink);ctx.restore();}
function eyeParts(k,side,expr,look,blink){
  const s=side,ex=s*16,ey=11,ox=ex+s*11,ix=ex-s*9.5,L=k.line;
  if(expr==='happy'||expr==='closed'||(blink&&expr!=='surprise')){
    // Closed eyes: ^ for a smile, a soft downward curve for calm or blinking; a flick of lashes at the outer corner.
    if(expr==='happy'){line([ex-s*9,ey+4,ex-s*6,ey-4,ex+s*5,ey-5,ex+s*10,ey+3],L,3);line([ex+s*9.5,ey+2,ex+s*11,ey+3,ex+s*12.5,ey+4,ex+s*14,ey+5],L,2);}
    else{line([ex-s*9,ey+1,ex-s*5,ey+7,ex+s*5,ey+7,ex+s*10,ey],L,2.8);line([ex+s*9.5,ey+.5,ex+s*11,ey-.5,ex+s*12.5,ey-1.5,ex+s*14,ey-2.5],L,2);
      line([ex-s*2,ey+7,ex-s*2,ey+8,ex-s*2.5,ey+9,ex-s*3,ey+10],L,1,.7);line([ex+s*3,ey+6.5,ex+s*3,ey+7.5,ex+s*3.5,ey+8.5,ex+s*4,ey+9.5],L,1,.7);}
    return;
  }
  const surprise=expr==='surprise',d=EYE_SHAPE(s);
  ctx.save();if(surprise){ctx.translate(ex,ey);ctx.scale(1.04,1.1);ctx.translate(-ex,-ey);}
  shape(d,grad(0,ey-13,0,ey+13,[[0,k.eye[4]],[.35,'#ffffff'],[1,'#ffffff']]));
  within(d,()=>{
    const cx=ex+look-s*.5,cy=ey+(surprise?2:.5),rx=surprise?6.4:9.2,ry=surprise?8.6:12.5;
    ellipse(cx,cy,rx,ry,grad(0,cy-ry,0,cy+ry,[[0,k.eye[2]],[.45,k.eye[1]],[.85,k.eye[0]],[1,'#ffffff']]));
    // Iris detail: a ring, radial streaks, the pupil, the shadow of the upper lid and a glow at the bottom.
    ctx.save();ctx.globalAlpha=.35;ctx.strokeStyle=k.eye[2];ctx.lineWidth=.7;for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*rx*.38,cy+Math.sin(a)*ry*.38);ctx.lineTo(cx+Math.cos(a)*rx*.85,cy+Math.sin(a)*ry*.85);ctx.stroke();}ctx.restore();
    ellipse(cx,cy+.5,surprise?2.2:3.4,surprise?3.2:5.2,k.eye[3]);
    ellipse(cx,cy,rx,ry,null,k.eye[3],1.1);
    ellipse(ex,ey-14,14,6.5,k.eye[3]+'cc');ellipse(ex,ey-8,12,3,k.eye[2]+'55');
    ellipse(cx,cy+ry*.62,rx*.62,ry*.25,k.eye[0]+'b0');
    ellipse(cx-3.4,cy-4.4,surprise?2.4:3.3,surprise?3:4.2,'#ffffff',null,1,-.3);
    ellipse(cx+3.6,cy+5.4,1.5,1.5,'#ffffffee');ellipse(cx+3.2,cy-5.6,.9,.9,'#ffffffcc');
  });
  // Line art: thick upper lid, darker at the outer end, with lashes; a crease above; a thin lower lash line.
  line([ox+s,ey-4,ox-s*3,ey-13.5,ix+s*4,ey-14.5,ix-s*.6,ey-7],L,2.6);
  line([ox+s*1.5,ey-3.5,ox,ey-8,ox-s*3,ey-12,ox-s*7,ey-13.2],L,4.2);
  line([ox+s*.5,ey-5,ox+s*2,ey-6.5,ox+s*3.5,ey-7.5,ox+s*5,ey-8],L,1.6);
  line([ox-s*2.5,ey-14,ox-s*5,ey-17,ex-s*1,ey-18,ix+s*2,ey-15.5],L,.9,.4);
  line([ox-s*.5,ey+5,ox-s*1.5,ey+10,ex+s*5,ey+12.8,ex+s*1,ey+13],L,1.1,.6);
  ctx.restore();
  if(expr==='sleepy'){within(d,()=>{ctx.fillStyle=k.skin[0];ctx.fillRect(ex-14,ey-16,28,15);});line([ox+s,ey-1,ox-s*4,ey+1.5,ix+s*4,ey+1.5,ix-s*.6,ey-1],L,2.6);}
}

function mouth(k,expr,talking,open){
  const L=k.line,y=29;
  if(talking&&open>.15||expr==='happy'&&!talking){const h=talking?2+4.4*open:3.6,w=talking?4.2:5.6;
    ctx.beginPath();ctx.moveTo(-w,y-1);ctx.quadraticCurveTo(0,y+.5,w,y-1);ctx.quadraticCurveTo(w*.8,y+h,0,y+h);ctx.quadraticCurveTo(-w*.8,y+h,-w,y-1);ctx.closePath();
    ctx.fillStyle='#a82c4c';ctx.fill();ctx.save();ctx.clip();ellipse(0,y+h+1,w*.8,h*.55,'#ff8da6');ctx.fillStyle='#fff';ctx.fillRect(-w,y-1.5,w*2,1.6);ctx.restore();
    ctx.strokeStyle=L;ctx.lineWidth=1.3;ctx.stroke();return;}
  if(expr==='surprise'){ellipse(0,y+1.5,2.6,3.2,'#a82c4c',L,1.2);ellipse(0,y+3,1.6,1.2,'#ff8da6');return;}
  if(expr==='sleepy'){line([-2.5,y,-1,y+1,1,y+1,2.5,y],L,1.3);return;}
  line([-4,y-.5,-2,y+2,2,y+2,4,y-.5],L,1.5);
}

function face(k,n,t,still,talking){
  const blink=!still&&(t%3.7<.12||(t+1.3)%7.9<.1),look=still?0:Math.sin(t*.45)*1.4;
  shape(FACE,radial(-8,-12,4,46,[[0,k.skin[0]],[.7,k.skin[0]],[1,k.skin[1]]]),k.line,1.7);
  // Shadow the bangs cast on the forehead, and a soft shade under the side hair.
  within(FACE,()=>{ctx.fillStyle=grad(0,-16,0,8,[[0,k.skin[2]],[1,k.skin[1]+'00']]);ctx.fillRect(-40,-20,80,26);
    ellipse(-38,8,9,26,k.skin[1]+'aa');ellipse(38,8,9,26,k.skin[1]+'aa');});
  // Blush with a few hatch lines.
  ellipse(-24,22,9,5,radial(-24,22,0,9,[[0,'#ff8aa8aa'],[1,'#ff8aa800']]));ellipse(24,22,9,5,radial(24,22,0,9,[[0,'#ff8aa8aa'],[1,'#ff8aa800']]));
  for(const s of [-1,1])for(let i=0;i<3;i++)line([s*(20+i*3.4),24,s*(20.6+i*3.4),22.5,s*(21.4+i*3.4),21,s*(22+i*3.4),19.5],'#e0607e',.9,.6);
  eye(k,-1,n.expr,look,blink);eye(k,1,n.expr,look,blink);
  // Brows show through the bangs.
  const by=n.expr==='surprise'?-14:-11;ctx.save();ctx.globalAlpha=.45;for(const s of [-1,1])line([s*25,by+2,s*21,by-1.5,s*14,by-2,s*9,by],k.hairLine,1.2);ctx.restore();
  line([1.6,21.5,1.8,22.2,1.6,22.8,1,23.2],k.line,1.1,.7);
  const open=talking&&!still?.5+.5*Math.sin(t*22):talking?.6:0;mouth(k,n.expr,talking,open);
}

function hairFront(k){
  const H=k.hair,HL=k.hairLine;
  for(const s of [-1,1]){const d1=s<0?SIDE_LOCK:M(SIDE_LOCK),d2=s<0?SIDE_LOCK2:M(SIDE_LOCK2);
    shape(d1,grad(0,-14,0,78,[[0,H[1]],[.6,H[2]],[1,H[3]]]),HL,1.5);within(d1,()=>{line([s*38,-4,s*44,14,s*42,36,s*46,64],H[0],2.2,.7);});
    shape(d2,grad(0,0,0,56,[[0,H[1]],[1,H[2]]]),HL,1.3);}
  const fill=grad(0,-62,0,16,[[0,H[1]],[.5,H[1]],[.85,H[2]],[1,H[3]]]);shape(FRONT_HAIR,fill,HL,1.7);
  within(FRONT_HAIR,()=>{ctx.fillStyle=radial(-22,-48,2,40,[[0,'#ffffff66'],[1,'#ffffff00']]);ctx.fillRect(-60,-70,120,90);
    // Darker hair in the gaps between locks, and the glossy "angel ring" highlight across the crown.
    ctx.fillStyle=grad(0,-36,0,-14,[[0,H[2]+'00'],[1,H[2]+'88']]);ctx.fillRect(-50,-36,100,60);
    ellipse(-30,-26,18,28,H[2]+'55',null,1,.4);
    for(const x of [-31,-19,-7,6,18,30]){const y=-43+(x/34)**2*14;ellipse(x,y,5,1.6,H[0]+'ee',null,1,Math.atan(x/34*.8));}
    for(let i=1;i<TIPS.length-1;i++){const [tx,ty]=TIPS[i];line([tx,ty-1,tx*1.01,ty-7,tx*.96,ty-13,tx*.9,ty-19],HL,.9,.5);}
  });
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
  shape(SLEEVE,grad(-9,0,9,0,[[0,k.dress[1]],[.45,k.dress[0]],[1,k.dress[1]]]),k.line,1.4);
  within(SLEEVE,()=>{ellipse(0,25,10,4,k.dress[2]);ctx.fillStyle=k.trim;ctx.fillRect(-10,20,20,1.6);});
  line([-9,24,-3,28.5,3,28.5,9,24],k.line,1.4);
  ctx.restore();
}

function body(k,m,t,still){
  const D=k.dress,L=k.line;
  for(const s of [-1,1])shape(s<0?BOW_TAIL:M(BOW_TAIL),grad(0,-84,0,-46,[[0,D[2]],[1,D[3]]]),L,1.3);
  // Legs: white tights and small boots with a gold strap.
  for(const s of [-1,1]){ctx.lineCap='round';ctx.strokeStyle=L;ctx.lineWidth=8.6;ctx.beginPath();ctx.moveTo(s*6.5,-42);ctx.lineTo(s*7,-8);ctx.stroke();ctx.strokeStyle='#fbfbff';ctx.lineWidth=6.2;ctx.stroke();
    ctx.strokeStyle=k.skin[1];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(s*8.2,-36);ctx.lineTo(s*8.4,-12);ctx.stroke();
    ctx.beginPath();ctx.moveTo(s*2.5,-12);ctx.quadraticCurveTo(s*1.5,-1,s*4,0);ctx.lineTo(s*13.5,0);ctx.quadraticCurveTo(s*14,-6,s*11.5,-12);ctx.closePath();ctx.fillStyle=grad(0,-12,0,0,[[0,D[2]],[1,D[3]]]);ctx.fill();ctx.strokeStyle=L;ctx.lineWidth=1.3;ctx.stroke();
    ctx.fillStyle=k.trim;ctx.fillRect(s>0?3:-12,-9,9,1.8);ellipse(s*7.5,-3.5,2,1,'#ffffff88');}
  shape(SKIRT_UNDER,grad(0,-84,0,-34,[[0,D[0]],[.7,D[0]],[1,D[1]]]),L,1.4);
  within(SKIRT_UNDER,()=>{for(const x of [-18,-6,6,18])line([x*.35,-82,x*.6,-66,x*.85,-52,x,-38],D[1],1.6,.9);ctx.fillStyle=k.trim+'aa';ctx.fillRect(-40,-42,80,1.4);
    for(let i=-2;i<=2;i++)ellipse(i*7,-45+Math.abs(i)*.6,1.3,1.3,k.trim);if(k.accent==='star'){star(0,-58,5.4,k.trimDark,4,.35);star(0,-58.3,4.4,k.trim,4,.35);}else for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*2.6,-58+Math.sin(a)*2.6,2.2,1.6,D[2],null,1,a);}});
  for(const s of [-1,1]){const d=s<0?SKIRT_PANEL:M(SKIRT_PANEL);shape(d,grad(s*-36,-84,s*-6,-40,[[0,D[3]],[.5,D[2]],[1,D[2]]]),L,1.4);
    within(d,()=>{line([s*9,-82,s*16,-66,s*22,-54,s*26,-42],D[3],1.4,.7);line([s*12,-82,s*20,-66,s*26,-54,s*32,-42],'#ffffff',1,.25);});
    line([s*5,-84,s*10,-70,s*17,-54,s*21,-39],k.trim,1.8);line([s*21,-39,s*26,-37,s*31,-36,s*36,-41],k.trim,1.8);}
  shape(BODICE,grad(-15,0,15,0,[[0,D[1]],[.4,D[0]],[1,D[1]]]),L,1.5);
  within(BODICE,()=>{ctx.fillStyle=grad(0,-92,0,-82,[[0,D[2]],[1,D[3]]]);ctx.fillRect(-16,-92,32,10);ctx.fillStyle=k.trim;ctx.fillRect(-16,-93,32,1.6);ctx.fillRect(-16,-83.5,32,1.4);
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
// The figure is painted into an offscreen buffer first, then put on the LCD with a soft white halo, so it stands out
// from the busy background like the cut-out mini characters of a real machine.
let buf=null;
export function drawNavi(c,n,t,{x,y,scale=1,gentle=true,reduced=false,flip=false}){
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
  within(BACK_HAIR[n.kind],()=>{ellipse(0,44,32,34,k.hair[3]+'cc');for(const x of [-44,-30,30,44])line([x*.8,0,x,30,x*1.05,60,x*1.1,100],k.hairLine,1,.35);ctx.fillStyle=grad(-60,0,60,0,[[0,'#ffffff55'],[.2,'#ffffff00'],[.8,'#ffffff00'],[1,'#ffffff33']]);ctx.fillRect(-70,-40,140,170);});ctx.restore();
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
  else{ctx=c;ctx.save();ctx.shadowColor=gentle?'#ffffffaa':'#ffffffdd';ctx.shadowBlur=Math.max(3,5*scale)*px;const bw=W*f,bh=H*f;
    ctx.drawImage(buf,0,0,Math.ceil(bw*px),Math.ceil(bh*px),x-OX*f,y-OY*f,Math.ceil(bw*px)/px,Math.ceil(bh*px)/px);ctx.restore();}
  // Sparkles around a cheer (also for clap, smaller).
  if((n.pose==='cheer'||n.pose==='clap')&&t<n.poseUntil){
    const count=still?3:n.pose==='cheer'?9:4,alpha=gentle?.55:.95;ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<count;i++){const p=still?.5:(a*.9+i/count)%1,ang=i*2.4+(still?0:a*.6),r=(30+p*30)*scale;
      ctx.globalAlpha=alpha*Math.sin(p*Math.PI);star(x+Math.cos(ang)*r,y-50*scale+Math.sin(ang)*r*.8,(3+2*(i%3))*scale*(1-p*.4),i%2?'#fff6c8':k.wing);}
    ctx.restore();
  }
}

// Wraps a line into rows that fit maxW (Japanese has no spaces, so it breaks between characters).
export function wrap(measure,line,maxW){const rows=[];let row='';for(const ch of line){if(row&&measure(row+ch)>maxW){rows.push(row);row=ch.trim()?ch:'';}else row+=ch;}if(row)rows.push(row);return rows;}

// Speech bubble with the text typed out. box: [x,y,w] of the bubble; tail: [x,y] point it aims at.
export function drawBubble(c,n,t,{box:[bx,by,bw],tail:[tx,ty],size=14,reduced=false}){
  ctx=c;if(!n.line||t>=n.lineUntil)return;
  const age=t-n.lineAt,left=n.lineUntil-t,alpha=Math.min(1,age/.15,left/.3),pop=reduced?1:Math.min(1,.85+age/.15*.15);
  const font=`bold ${size}px "Hiragino Maru Gothic ProN","Rounded Mplus 1c","Noto Sans JP","Hiragino Sans",sans-serif`;ctx.font=font;
  const rows=wrap(s=>ctx.measureText(s).width,n.line,bw-24),lh=size*1.3,bh=rows.length*lh+16,shown=reduced?n.line.length:Math.min(n.line.length,Math.floor(age*CPS));
  ctx.save();ctx.globalAlpha=Math.max(0,alpha);ctx.translate(bx+bw/2,by+bh/2);ctx.scale(pop,pop);ctx.translate(-(bx+bw/2),-(by+bh/2));
  ctx.shadowColor='#0007';ctx.shadowBlur=8;ctx.shadowOffsetY=2;
  ctx.fillStyle=grad(0,by,0,by+bh,[[0,'#ffffff'],[1,'#f6f3fb']]);ctx.beginPath();ctx.roundRect(bx,by,bw,bh,12);ctx.fill();
  const cx=Math.max(bx+16,Math.min(bx+bw-16,tx)),edge=ty>by+bh/2?by+bh-1:ty<by?by+1:null;
  ctx.beginPath();if(edge!==null){ctx.moveTo(cx-7,edge);ctx.lineTo(tx,ty);ctx.lineTo(cx+7,edge);}else{const ex=tx<bx?bx+1:bx+bw-1,cy=Math.max(by+12,Math.min(by+bh-12,ty));ctx.moveTo(ex,cy-6);ctx.lineTo(tx,ty);ctx.lineTo(ex,cy+6);}ctx.fill();
  ctx.shadowColor='transparent';ctx.strokeStyle=KINDS[n.kind].ribbon;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(bx,by,bw,bh,12);ctx.stroke();ctx.strokeStyle=KINDS[n.kind].ribbon+'40';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(bx+3,by+3,bw-6,bh-6,9);ctx.stroke();
  ctx.fillStyle='#3a1d2e';ctx.textAlign='left';ctx.font=font;let left2=shown;
  rows.forEach((r,i)=>{const part=[...r].slice(0,Math.max(0,left2)).join('');left2-=[...r].length;ctx.fillText(part,bx+12,by+8+size+i*lh);});
  // Name tag on the top edge, like the speaker plate of a real machine's dialogue window.
  const tag=KINDS[n.kind].name,ts=Math.round(size*.7);ctx.font=`bold ${ts}px sans-serif`;const tw=ctx.measureText(tag).width+12;
  ctx.fillStyle=KINDS[n.kind].ribbon;ctx.beginPath();ctx.roundRect(bx+10,by-ts*.7,tw,ts+4,(ts+4)/2);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(tag,bx+10+tw/2,by-ts*.7+ts);
  ctx.restore();
}

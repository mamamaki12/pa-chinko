// LCD navigator characters: original chibi mascots that live on the LCD and react to what just happened, like the
// mini characters of a real machine. ハナ lives on AURORA (pink, flower), ソラ on ASTRAL (silver-blue, star).
// Rules: reactions come at or after a known result (spin start, reach, stop, payout); the lever / spin reactions are the
// same for every game, so they never hint at the outcome. No near-miss teasing and no lines that push for more play;
// gentle lines about breaks are fine. Gentle mode keeps the motion but dims sparkles; prefers-reduced-motion keeps poses still.

export const KINDS={
  hana:{name:'ハナ',pitch:1.15,hair:['#ffd0e6','#ff8cc0','#c8457f'],eye:['#ff7fc2','#a3206b'],dress:['#fffaf2','#f3d9a8'],trim:'#d9a441',ribbon:'#ff5fa8',wing:'#ffb6dc',accent:'flower'},
  sora:{name:'ソラ',pitch:.95,hair:['#f4f6ff','#c3cdf2','#7f8cc4'],eye:['#7fc6ff','#1f56b8'],dress:['#2a3f8f','#1a275c'],trim:'#e8c46a',ribbon:'#5fb6ff',wing:'#a9d4ff',accent:'star'},
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
let ctx;
function grad(x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function radial(x,y,r0,r1,stops){const g=ctx.createRadialGradient(x,y,r0,x,y,r1);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function ellipse(x,y,rx,ry,fill,stroke,lw=1.2,rot=0){ctx.beginPath();ctx.ellipse(x,y,rx,ry,rot,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
const LINE='#3a1d2e';
function star(x,y,r,fill,points=5,inner=.45){ctx.beginPath();for(let i=0;i<points*2;i++){const a=-Math.PI/2+i*Math.PI/points,rr=i%2?r*inner:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fillStyle=fill;ctx.fill();}

// Body motion for a pose at age a (seconds since the pose began). Arm angles: 0 = hanging down, π/2 = straight out, π = up;
// negative swings the hand toward the chest.
function motion(pose,a,still){
  const s=still?0:1,m={bob:Math.sin(a*2.4)*1.4*s,jump:0,tilt:Math.sin(a*.9)*.04*s,arms:[.22+Math.sin(a*2.4)*.05*s,.22-Math.sin(a*2.4)*.05*s],headDrop:0,lean:0,wing:Math.sin(a*5)*.12*s};
  if(pose==='wave'){m.arms[1]=2.5+Math.sin(a*11)*.35*s;m.tilt=.08;}
  else if(pose==='cheer'){m.arms=[2.6+Math.sin(a*12)*.15*s,2.6-Math.sin(a*12)*.15*s];m.jump=Math.abs(Math.sin(a*6.5))*9*s;m.wing=Math.sin(a*14)*.3*s;m.tilt=0;}
  else if(pose==='clap'){const c=Math.abs(Math.sin(a*9))*s;m.arms=[-.5-c*.45,-.5-c*.45];m.jump=Math.abs(Math.sin(a*9))*2*s;}
  else if(pose==='watch'){m.arms=[-.9,-.9];m.lean=2;m.bob=Math.sin(a*6)*.8*s;m.tilt=.06*Math.sin(a*1.5)*s;}
  else if(pose==='point'){m.arms[1]=1.15+Math.sin(a*8)*.08*s;m.arms[0]=.35;m.jump=a<.3?Math.sin(a/.3*Math.PI)*6*s:0;m.tilt=-.06;}
  else if(pose==='nod'){m.headDrop=Math.sin(Math.min(1,a/.4)*Math.PI)*3.5*s;}
  else if(pose==='bow'){const k=Math.min(1,a/.6);m.headDrop=6*k;m.lean=4*k;m.arms=[-.75,-.75];m.tilt=0;}
  else if(pose==='sleepy'){m.tilt=.22;m.arms=[.12,.12];m.bob=Math.sin(a*1.3)*1.2*s;m.wing=Math.sin(a*1.3)*.05*s;}
  return m;
}

function arm(side,angle,k){
  const sx=side*10.5,sy=-37,len=15,hx=sx+side*Math.sin(angle)*len,hy=sy+Math.cos(angle)*len;
  ctx.lineCap='round';ctx.strokeStyle=LINE;ctx.lineWidth=6.6;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(hx,hy);ctx.stroke();
  ctx.strokeStyle=k.dress[0];ctx.lineWidth=4.4;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(hx-sx)*.55,sy+(hy-sy)*.55);ctx.stroke();
  ctx.strokeStyle='#ffe9dc';ctx.beginPath();ctx.moveTo(sx+(hx-sx)*.55,sy+(hy-sy)*.55);ctx.lineTo(hx,hy);ctx.stroke();
  ellipse(hx,hy,3.4,3.4,'#ffe9dc',LINE,1);
}

function accent(k,x,y,t,still){
  ctx.save();ctx.translate(x,y);ctx.rotate(still?0:Math.sin(t*1.7)*.12);
  if(k.accent==='flower'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ellipse(Math.cos(a)*5,Math.sin(a)*5,4.2,3,grad(-6,-6,6,6,[[0,'#fff3fa'],[1,k.ribbon]]),'#a3306a',.8,a);}ellipse(0,0,2.6,2.6,'#ffd76a','#a8741c',.8);}
  else{star(0,0,8,'#a8741c');star(0,-.4,6.6,grad(-6,-6,6,6,[[0,'#fff6c8'],[.5,'#ffd34d'],[1,'#d99a1c']]));ellipse(-1.6,-2.4,1.2,.8,'#fff');}
  ctx.restore();
}

function eyes(k,expr,t,still,talking){
  const blink=!still&&(t%3.7<.12||(t+1.3)%7.9<.1),look=still?0:Math.sin(t*.45)*1.2;
  for(const side of [-1,1]){const ex=side*9.5,ey=-60;
    if(expr==='happy'||expr==='closed'||(blink&&expr!=='surprise')){ctx.strokeStyle=LINE;ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();if(expr==='happy')ctx.arc(ex,ey+2,4.6,Math.PI*1.15,Math.PI*1.85);else ctx.arc(ex,ey-2,4.6,Math.PI*.15,Math.PI*.85);ctx.stroke();continue;}
    const ry=expr==='sleepy'?3.4:expr==='surprise'?7.4:7,rx=expr==='surprise'?5.4:5.6;
    ellipse(ex,ey,rx,ry,'#fff');
    ctx.save();ctx.beginPath();ctx.ellipse(ex,ey,rx-.6,ry-.6,0,0,Math.PI*2);ctx.clip();
    const ir=expr==='surprise'?3.4:4.6;ellipse(ex+look,ey+.6,ir,ir*1.3,grad(0,ey-6,0,ey+6,[[0,k.eye[1]],[.6,k.eye[0]],[1,'#ffffff']]));
    ellipse(ex+look,ey+1,ir*.45,ir*.6,'#1a0b1c');ellipse(ex+look-1.6,ey-2.4,1.7,2,'#fff');ellipse(ex+look+1.6,ey+2.6,.9,.9,'#ffffffcc');
    if(expr==='sleepy'){ctx.fillStyle='#ffe9dc';ctx.fillRect(ex-rx,ey-ry,rx*2,ry*.9);}
    ctx.restore();
    // Thick upper lid with a small flick at the outer corner; thin soft lower line.
    ctx.lineCap='round';ctx.strokeStyle=LINE;ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(ex,ey,rx+.3,ry+.3,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
    ctx.beginPath();ctx.moveTo(ex+side*(rx-.5),ey-ry*.55);ctx.lineTo(ex+side*(rx+2),ey-ry*.8);ctx.stroke();
    ctx.strokeStyle='#8a4a5e';ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(ex,ey,rx,ry,0,Math.PI*.25,Math.PI*.75);ctx.stroke();
  }
  // Mouth: opens and closes while the line is being spoken.
  const open=talking&&!still?.5+.5*Math.sin(t*22):talking?.6:0;
  if(open>.15){ellipse(0,-49,2.6,1+2.6*open,'#b8304f',LINE,1);ellipse(0,-48+1.4*open,1.4,.8*open,'#ff8aa0');}
  else if(expr==='surprise')ellipse(0,-49,1.8,2.2,'#b8304f',LINE,1);
  else{ctx.strokeStyle=LINE;ctx.lineWidth=1.4;ctx.beginPath();if(expr==='sleepy')ctx.moveTo(-2,-49),ctx.lineTo(2,-49);else ctx.arc(0,-51,3,Math.PI*.2,Math.PI*.8);ctx.stroke();}
  ellipse(-15,-51,4,2.2,'#ff7aa866');ellipse(15,-51,4,2.2,'#ff7aa866');
}

// Draws the character with its feet at (x,y). t: the game clock in seconds.
export function drawNavi(c,n,t,{x,y,scale=1,gentle=true,reduced=false,flip=false}){
  ctx=c;const k=KINDS[n.kind],still=reduced,a=t-n.poseAt,m=motion(n.pose,a,still),talking=!!n.line&&t<n.lineUntil&&n.shown<n.line.length;
  // A payout cheer steps forward a little, like a cut-in.
  if(n.pose==='cheer'&&n.prio>=3)scale*=1+.22*(still?1:Math.min(1,a/.35))*Math.min(1,(n.poseUntil-t)/.4);
  ctx.save();ctx.translate(x,y);ctx.scale(flip?-scale:scale,scale);
  // Ground shadow stays put while the body jumps.
  ellipse(0,1,15-m.jump*.5,3,'#0006');
  ctx.translate(m.lean,-m.jump-m.bob);
  // Wings
  for(const side of [-1,1]){ctx.save();ctx.translate(side*7,-36);ctx.rotate(side*(.5+m.wing));ctx.globalAlpha=.85;
    ellipse(side*10,-6,11,6,grad(0,-12,side*20,0,[[0,'#ffffffee'],[1,k.wing+'99']]),'#ffffffaa',1,side*-.5);ellipse(side*8,4,8,4.4,grad(0,0,side*16,8,[[0,'#ffffffcc'],[1,k.wing+'77']]),'#ffffff88',1,side*.35);ctx.restore();}
  // Back hair
  ctx.save();ctx.translate(0,-62+m.headDrop);ctx.rotate(m.tilt);
  ctx.beginPath();ctx.moveTo(-24,-4);ctx.quadraticCurveTo(-30,22,-20,34);ctx.lineTo(20,34);ctx.quadraticCurveTo(30,22,24,-4);ctx.closePath();ctx.fillStyle=grad(0,-10,0,34,[[0,k.hair[1]],[1,k.hair[2]]]);ctx.fill();ctx.strokeStyle=LINE;ctx.lineWidth=1.3;ctx.stroke();
  ctx.restore();
  // Legs and dress
  for(const side of [-1,1]){ctx.lineCap='round';ctx.strokeStyle=LINE;ctx.lineWidth=6.4;ctx.beginPath();ctx.moveTo(side*5,-14);ctx.lineTo(side*5.5,-3);ctx.stroke();ctx.strokeStyle='#fff8f2';ctx.lineWidth=4.4;ctx.stroke();ellipse(side*6,-1.5,4.4,2.6,k.ribbon,LINE,1);}
  ctx.beginPath();ctx.moveTo(-9,-41);ctx.quadraticCurveTo(-11,-30,-17,-13);ctx.quadraticCurveTo(0,-9,17,-13);ctx.quadraticCurveTo(11,-30,9,-41);ctx.closePath();
  ctx.fillStyle=grad(-17,-41,17,-12,[[0,k.dress[0]],[.6,k.dress[0]],[1,k.dress[1]]]);ctx.fill();ctx.strokeStyle=LINE;ctx.lineWidth=1.4;ctx.stroke();
  ctx.strokeStyle=k.trim;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-16.2,-15);ctx.quadraticCurveTo(0,-11,16.2,-15);ctx.stroke();
  ellipse(-4,-38,4,2.6,k.ribbon,LINE,1,-.4);ellipse(4,-38,4,2.6,k.ribbon,LINE,1,.4);ellipse(0,-38,1.8,1.8,k.trim,LINE,.8);
  const up=m.arms.map(a=>a>1.6);m.arms.forEach((a,i)=>{if(!up[i])arm(i?1:-1,a,k);});
  // Head
  ctx.save();ctx.translate(0,m.headDrop);ctx.translate(0,-40);ctx.rotate(m.tilt);ctx.translate(0,40);
  ellipse(0,-60,22,20,radial(-6,-66,2,26,[[0,'#fff6ef'],[1,'#ffd9c8']]),LINE,1.5);
  eyes(k,n.expr,t,still,talking);
  // Bangs and side locks
  ctx.fillStyle=grad(0,-86,0,-60,[[0,k.hair[0]],[.5,k.hair[1]],[1,k.hair[2]]]);ctx.strokeStyle=LINE;ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(-24,-56);ctx.quadraticCurveTo(-27,-84,0,-85);ctx.quadraticCurveTo(27,-84,24,-56);
  ctx.quadraticCurveTo(20,-66,15,-68);ctx.lineTo(12,-62);ctx.lineTo(7,-70);ctx.lineTo(1,-63);ctx.lineTo(-4,-71);ctx.lineTo(-9,-63);ctx.lineTo(-14,-69);ctx.quadraticCurveTo(-20,-66,-24,-56);ctx.closePath();ctx.fill();ctx.stroke();
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*21,-66);ctx.quadraticCurveTo(side*27,-50,side*22,-36);ctx.quadraticCurveTo(side*19,-48,side*17,-58);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.strokeStyle='#ffffff99';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(-6,-76,9,Math.PI*1.1,Math.PI*1.45);ctx.stroke();
  accent(k,15,-80,t,still);
  if(n.pose==='sleepy'&&!still){for(let i=0;i<3;i++){const p=(t*.6+i/3)%1;ctx.globalAlpha=Math.sin(p*Math.PI);ctx.font='bold 9px Arial';ctx.fillStyle='#e8f0ff';ctx.fillText('z',22+p*14+i*2,-84-p*16);}ctx.globalAlpha=1;}
  ctx.restore();
  // Raised arms go in front of the hair.
  m.arms.forEach((a,i)=>{if(up[i])arm(i?1:-1,a,k);});
  ctx.restore();
  // Sparkles around a cheer (also for clap, smaller).
  if((n.pose==='cheer'||n.pose==='clap')&&t<n.poseUntil){
    const count=still?3:n.pose==='cheer'?9:4,alpha=gentle?.55:.95;ctx.save();ctx.globalCompositeOperation='lighter';
    for(let i=0;i<count;i++){const p=still?.5:(a*.9+i/count)%1,ang=i*2.4+(still?0:a*.6),r=(26+p*30)*scale;
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
  ctx.fillStyle='#fffdfa';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,12);ctx.fill();
  const cx=Math.max(bx+16,Math.min(bx+bw-16,tx)),edge=ty>by+bh/2?by+bh-1:ty<by?by+1:null;
  ctx.beginPath();if(edge!==null){ctx.moveTo(cx-7,edge);ctx.lineTo(tx,ty);ctx.lineTo(cx+7,edge);}else{const ex=tx<bx?bx+1:bx+bw-1,cy=Math.max(by+12,Math.min(by+bh-12,ty));ctx.moveTo(ex,cy-6);ctx.lineTo(tx,ty);ctx.lineTo(ex,cy+6);}ctx.fill();
  ctx.shadowColor='transparent';ctx.strokeStyle='#e6c9d8';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(bx,by,bw,bh,12);ctx.stroke();
  ctx.fillStyle='#3a1d2e';ctx.textAlign='left';ctx.font=font;let left2=shown;
  rows.forEach((r,i)=>{const part=[...r].slice(0,Math.max(0,left2)).join('');left2-=[...r].length;ctx.fillText(part,bx+12,by+8+size+i*lh);});
  // Name tag on the top edge, like the speaker plate of a real machine's dialogue window.
  const tag=KINDS[n.kind].name,ts=Math.round(size*.7);ctx.font=`bold ${ts}px sans-serif`;const tw=ctx.measureText(tag).width+12;
  ctx.fillStyle=KINDS[n.kind].ribbon;ctx.beginPath();ctx.roundRect(bx+10,by-ts*.7,tw,ts+4,(ts+4)/2);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(tag,bx+10+tw/2,by-ts*.7+ts);
  ctx.restore();
}

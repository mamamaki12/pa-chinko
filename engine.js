export const REELS=[
['bell','cherry','replay','seven','bell','watermelon','replay','bar','bell','cherry','replay','watermelon','bell','seven','replay','bar','bell','cherry','replay','watermelon','bar'],
['bell','seven','replay','watermelon','bell','bar','replay','cherry','bell','seven','replay','watermelon','bell','bar','replay','seven','bell','cherry','replay','watermelon','bar'],
['bell','watermelon','replay','bar','bell','seven','replay','cherry','bell','watermelon','replay','seven','bell','bar','replay','cherry','bell','watermelon','replay','seven','bar']];
export const STRIP=REELS[0];
// AURORA筐体画像（720×960）の盤面ガラスと中央液晶の位置に合わせた座標。button は中央手前のチャンスボタン（ガラスより手前のドーム）の上側を覆う楕円。ball は玉の半径、guide は玉の中心がガイドに近づける距離（guides の5つ目の数があればそのガイドだけその距離）。
export const BOARD={cx:360,cy:430,r:300,gravity:860,ball:4.5,guide:7,display:{x1:188,x2:532,y1:256,y2:504},button:{x:360,y:702,rx:98,ry:54},guides:[[182,258,360,226],[360,226,538,258],[349,599,349,618,6],[370,599,370,618,6]]};
// The clear lower apron is a playable surface, not a row of decorative nail heads.
// Traced on the 720×960 artwork. Leave the central drop open above the life nails.
export const START={x1:349,x2:370,y:606,bottom:626,rect:[338,600,44,34]};
export const PLASTIC=[
  [158,480,210,508],[210,508,268,538],[268,538,313,559],[313,559,347,568],
  [373,568,407,559],[407,559,452,538],[452,538,510,508],[510,508,562,480],
];
// 独自の役抽選テーブル（16384分の）。BIGは7揃い150枚の一回払い、リプレイは次ゲームのメダル不要。
export const ROLE_TABLE=[['big',40],['watermelon',200],['cherry',400],['bell',1800],['replay',2240]];
export const ROLE_RANGE=16384;
// 7揃いは実機のAタイプのようにBIGボーナスの開始（7揃い自体の払い出しはなし）。BIG中は毎ゲーム、どこで押しても揃う15枚のベルが成立し、合計 BIG.total 枚を払い出したら終了。
export const BIG={pay:15,total:150};
export const MAX_SLIP=4;
const LINE_SYMBOL={big:'seven',watermelon:'watermelon',bell:'bell',replay:'replay'};
export function drawRole(n){let edge=0;for(const [role,weight] of ROLE_TABLE){edge+=weight;if(n<edge)return role;}return 'none';}
export function judge(symbols){if(symbols.every(s=>s===symbols[0])){const role=Object.keys(LINE_SYMBOL).find(r=>LINE_SYMBOL[r]===symbols[0]);if(role)return role;}return symbols[0]==='cherry'?'cherry':'none';}
const PAY={big:150,watermelon:10,bell:8,cherry:2,replay:0,none:0};
// 有効ライン：MAX BET（3枚）で横3本・斜め2本の5ラインがすべて有効。数は各リールの段（0上・1中・2下）。
export const LINES=[[1,1,1],[0,0,0],[2,2,2],[0,1,2],[2,1,0]];
// stop（中段に止まったコマ）から見た上・中・下の図柄。リールは番号の大きいコマほど上に並ぶ。
export function column(reel,stop){const N=REELS[reel].length;return [1,0,-1].map(d=>REELS[reel][((stop+d)%N+N)%N]);}
export function lineSymbols(stops,line){return line.map((row,i)=>column(i,stops[i])[row]);}
// 止まった位置で5ラインを判定。wins：揃ったライン（line は LINES の番号）、hit：いちばん大きい役、pay：ラインごとの配当の合計（角チェリーは2ライン）。
const RANK=['big','watermelon','bell','cherry','replay'];
export function settle(stops){const wins=[];LINES.forEach((l,line)=>{const role=judge(lineSymbols(stops,l));if(role!=='none')wins.push({line,role,pay:PAY[role]});});
  return {wins,hit:RANK.find(r=>wins.some(w=>w.role===r))??'none',pay:wins.reduce((a,w)=>a+w.pay,0)};}
// 停止ボタンを押した位置baseから0〜4コマすべらせ、成立役はどれかのラインに引き込み、それ以外はどのラインにも揃えない。
// stops：各リールの止まるコマ（未停止はnull）。まだ止めていないリールはどこで押されるか分からないので、
// いちばん悪い押し方でも成立していない役が揃わない（worst）ことを先に、平均して成立役が揃いやすい（mean）ことを次に比べる。
// 成立役は1ラインだけに揃うほうを選ぶ（配当を増やさない）。外れでBARが3つ並ぶラインもなるべく避ける。
function rate(stops,role){const {wins}=settle(stops),mine=wins.filter(w=>w.role===role).length;if(wins.length>mine)return 0;
  const bars=LINES.filter(l=>lineSymbols(stops,l).every((s,_,a)=>s===a[0])).length-mine;return (mine?3-(mine-1)*.1:2)-bars*.05;}
const memo=new Map();
function value(role,stops){const key=role+':'+stops.join();let v=memo.get(key);if(v)return v;const open=[0,1,2].filter(i=>stops[i]===null);
  if(!open.length){const r=rate(stops,role);v=[r,r];}else{let worst=Infinity,sum=0,n=0;for(const reel of open)for(let p=0;p<REELS[reel].length;p++){const [w,m]=best(reel,p,role,stops).v;worst=Math.min(worst,w);sum+=m;n++;}v=[worst,sum/n];}
  memo.set(key,v);return v;}
function best(reel,base,role,stops){let slip=0,v=null;for(let s=0;s<=MAX_SLIP;s++){const next=stops.slice();next[reel]=(base+s)%REELS[reel].length;const x=value(role,next);if(!v||x[0]>v[0]||x[0]===v[0]&&x[1]>v[1]+1e-9){v=x;slip=s;}}return {slip,v};}
export function chooseSlip(reel,base,role,stops){return best(reel,base,role,stops.map(s=>s??null)).slip;}
// 役ごとの読み（数十ミリ秒）を前もって済ませ、最初の停止でもたつかないようにする。
export function warmSlips(role){value(role,[null,null,null]);}
export function randomInt(n){const a=new Uint32Array(1);const max=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=max);return a[0]%n;}
export function payout(symbols){return PAY[judge(symbols)];}
export function resolvePachinko(draw){return draw===0?300:0;}
// 大当たりは実機のようなラウンド制：右下の大入賞口（アタッカー）が開き、右打ちで入れた玉1つにつき BONUS.prize 玉を払い出す。
// 1ラウンドは BONUS.count 個入るか BONUS.open 秒で閉じ、BONUS.gap 秒あけて次のラウンド。最大 rounds×count×prize 玉。
export const BONUS={rounds:4,count:10,prize:8,open:30,gap:2};
export const ATTACKER={x1:548,x2:578,y1:640,y2:660};
export function inAttacker(b){return b.vy>0&&b.y>ATTACKER.y1&&b.y<ATTACKER.y2&&b.x>ATTACKER.x1&&b.x<ATTACKER.x2;}
// 釘：筐体画像（assets/aurora.webp）の盤面の釘。透明ステージ上面に重なる金の装飾は衝突から除く。
// 1本ずつの釘は画像から金色の丸い粒を拾ったもの。液晶の左下に斜めに並ぶ3本の釘の列（道釘）は、絵の列に沿って5ずつ並べた。
// 液晶の屋根（ガイド）に重なる飾りの粒、チャンスボタン・外周の際はのぞき、START入賞口の上の2本（命釘）は手で置いた。プログラムでは描かず、画像の釘に当たる。
// 1本ずつ id・位置・頭の半径 r を持つ部品。玉が当たるのは中心どうしが BOARD.ball + r より近いとき。
const NAIL_R=1.5,NAIL_XY=[312,152,317,154,332,154,386,154,405,154,374,155,294,156,364,156,428,156,401,157,292,160,376,164,327,165,392,166,416,167,238,168,273,171,313,173,482,174,397,178,370,183,502,185,308,187,498,190,278,191,425,191,506,193,217,196,487,197,535,202,328,203,516,203,187,207,409,207,294,209,312,211,389,211,541,213,485,214,524,217,168,219,172,223,273,223,443,223,561,225,454,226,192,227,548,228,556,231,157,232,138,244,567,244,157,247,581,251,132,261,158,261,562,261,127,262,595,266,166,272,163,278,565,279,541,284,172,285,563,289,177,290,608,292,160,301,563,303,612,306,549,307,122,310,166,314,595,315,611,321,177,322,167,323,542,324,162,325,141,326,561,326,552,328,90,330,121,330,167,336,577,338,564,340,547,341,599,343,135,344,563,344,552,345,167,348,85,350,135,350,628,351,611,352,136,354,550,356,136,362,575,368,618,368,138,369,111,370,149,371,172,374,136,375,117,376,78,378,95,382,126,382,145,389,92,392,73,393,550,398,96,401,158,401,167,405,94,406,177,408,619,408,126,410,115,411,145,414,131,415,163,419,566,422,614,423,133,424,179,424,103,431,171,433,135,436,120,439,127,439,590,439,84,441,145,441,92,444,147,445,114,447,137,449,577,449,560,454,129,455,622,455,75,456,116,456,609,456,137,457,617,460,117,462,634,462,102,466,544,466,570,467,607,467,146,470,90,474,145,475,74,477,543,480,93,481,591,485,112,487,575,487,151,494,124,496,132,496,591,500,156,501,560,502,565,503,556,504,87,506,137,508,141.4,510.2,145.9,512.5,581,513,106,514,129,514,150.3,514.8,570,515,154.8,517,424,517,471,518,476,518,297,519,159.2,519.2,163.7,521.5,137,522,552,523,168.2,523.8,274,524,447,524,117,525,127,525,311,525,414,525,419,525,172.6,526,566,526,296,528,177.1,528.2,431,529,411,530,181.5,530.5,494,532,582,532,185.9,532.8,124,533,556,533,566,533,96,534,190.4,535,384,535,132,536,260,536,330,536,194.8,537.2,519,539,539,539,199.3,539.5,138,541,203.8,541.8,618,543,142.6,543.1,208.2,544,441,545,147.2,545.2,297,546,212.7,546.2,397,547,151.8,547.4,504,548,217.1,548.5,313,549,156.4,549.5,126,550,466,550,221.6,550.8,372,551,160.9,551.6,268,552,226,553,165.5,553.7,201,554,601,554,230.5,555.2,170.1,555.8,105,556,140,556,206,557,330,557,235,557.4,174.7,557.9,600,559,239.5,559.6,280,560,605,560,179.3,560.1,315,561,244,561.8,183.9,562.2,283.8,562.6,248.5,563.9,225,564,188.5,564.3,116,565,157,565,287.6,565.2,392,566,253,566.1,193.1,566.4,470,567,291.4,567.8,136,568,257.5,568.3,197.6,568.5,177,569,237,569,451,570,510,570,603,570,295.2,570.4,262,570.5,202.2,570.6,532,572,266.5,572.7,206.8,572.8,114,573,120,573,299,573,412,573,211.4,574.9,271,574.9,244,575,592,575,371,576,566,576,191,577,216,577,521,577,602,577,275.5,577.1,117,578,320,578,347,578,401,579,220.6,579.1,280,579.2,196,580,448,580,225.1,581.2,284.5,581.4,203,582,249,583,229.7,583.3,289,583.6,259,584,209,585,234.2,585.4,293.5,585.8,480,586,582,586,535,587,238.8,587.6,298,588,437,589,565,589,243.3,589.7,217,590,588,590,302.8,590.2,201,591,287,591,463,591,247.9,591.8,121,592,225,592,307.6,592.4,252.4,593.9,312.4,594.6,349,595,370,595,408,595,584,595,257,596,317.2,596.8,399,597,261.1,598.1,191,599,322,599,265.3,600.3,135,601,186,601,509,602,269.4,602.4,145,603,177,604,495,604,273.6,604.6,431,605,249,606,441,606,277.7,606.7,281.9,608.9,312,609,407,609,546,609,286,611,191,615,470,618,519,618,191,619,433,619,515,619,568,619,563,620,533,621,150,622,304,622,414,622,451,622,519,622,555,622,292,624,273,625,437,625,316,627,570,627,348,631,298,632,488,632,333,633,373,633,288,634,507,634,544,634,169,636,275,639,313,641,502,642,248,644,407,645,450,645,471,647,206,649,424,650,187,651,294,652,522,653,534,653,493,662,256,670,460,670,216,680,241,685];
function onPlastic(x,y,gap=8){return PLASTIC.some(([x1,y1,x2,y2])=>{const t=((x-x1)*(x2-x1)+(y-y1)*(y2-y1))/((x2-x1)**2+(y2-y1)**2);return t>=0&&t<=1&&Math.hypot(x-x1-t*(x2-x1),y-y1-t*(y2-y1))<gap;});}
// rim：透明ステージの縁に近すぎて、ステージを転がる玉がくぐれない釘。ステージの上を転がる玉は手前を通るので当たらない（上から落ちてきた玉には当たる）。
export function onStageRim(x,y,r=NAIL_R){return onPlastic(x,y,2*BOARD.ball+r);}
export const NAILS=[];for(let i=0;i<NAIL_XY.length;i+=2){const x=NAIL_XY[i],y=NAIL_XY[i+1];if(onPlastic(x,y))continue;const n={id:`nail-${String(i/2+1).padStart(3,'0')}`,x,y,r:NAIL_R};if(onStageRim(x,y))n.rim=true;NAILS.push(n);}
export function makePins(){return NAILS.map(n=>({...n}));}
// 点がチャンスボタンの楕円（padだけ広げる）の内側か。
export function inButton(x,y,pad=0){const {x:bx,y:by,rx,ry}=BOARD.button;return ((x-bx)/(rx+pad))**2+((y-by)/(ry+pad))**2<1;}
// 発射された玉は外周レールを上って、強度に応じた角度で盤面へ出る（強いほど右寄り）。
export function launchBall(power,jitter=0){const a=Math.PI*(165/180);return {x:BOARD.cx+Math.cos(a)*(BOARD.r-7),y:BOARD.cy+Math.sin(a)*(BOARD.r-7),vx:0,vy:0,age:0,rail:{angle:a,end:Math.PI*((222+Math.max(0,(power-.25)/.75)**2*95+jitter*4)/180),speed:340+power*190+jitter*15}};}
export function advanceRail(b,dt){const R=BOARD.r-7,rail=b.rail;rail.angle=Math.min(rail.end,rail.angle+rail.speed/R*dt);b.x=BOARD.cx+Math.cos(rail.angle)*R;b.y=BOARD.cy+Math.sin(rail.angle)*R;if(rail.angle>=rail.end){b.vx=-Math.sin(rail.angle)*rail.speed;b.vy=Math.cos(rail.angle)*rail.speed;delete b.rail;}}
// START入賞口（ヘソ）は命釘の真下に左右の壁（guides の最後の2本）がある袋で、命釘の間から下向きに入った玉だけを数える。
export function inStart(b){return b.startEntered===true||(b.prevY===undefined&&b.y>START.y&&b.y<START.bottom&&b.x>START.x1+BOARD.ball&&b.x<START.x2-BOARD.ball&&b.vy>0);}
function crossStart(b,x,y){if(y>START.y||b.y<=START.y||b.vy<=0)return;const t=(START.y-y)/(b.y-y),at=x+(b.x-x)*t;if(at>START.x1+BOARD.ball&&at<START.x2-BOARD.ball)b.startEntered=true;}
// 実機のステージは手前に張り出した棚で、転がる玉の多くは中央の溝に届く前に手前へこぼれる。平面の盤ではそれを
// 「ステージに乗っている間、1秒あたり STAGE_SPILL の割合で手前に落ちる（以後この玉はステージを通り抜ける）」で表す。
// 3 で START入賞は実機並みの約5〜8%。ステージが無いと中央の落とし口が真下のヘソへ玉を運び、入賞が60〜75%になる。
export const STAGE_SPILL=3;
// One-sided top surfaces: balls below the apron are never pulled onto it.
export function collidePlastic(b,oldX=b.x,oldY=b.y,dt=0,rand=Math.random){
  b.stage=false;if(b.front)return;
  for(const [x1,y1,x2,y2] of PLASTIC){const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),nx=dy/len,ny=-dx/len;
    const before=(oldX-x1)*nx+(oldY-y1)*ny,d=(b.x-x1)*nx+(b.y-y1)*ny,t=((b.x-x1)*dx+(b.y-y1)*dy)/(len*len);
    if(before<0||t<0||t>1||d>=BOARD.ball)continue;
    if(dt>0&&rand()<STAGE_SPILL*dt){b.front=true;return;}
    b.stage=true;b.x+=nx*(BOARD.ball-d);b.y+=ny*(BOARD.ball-d);const vn=b.vx*nx+b.vy*ny;
    if(vn<0){const restitution=-vn>65?.18:0;b.vx-=(1+restitution)*vn*nx;b.vy-=(1+restitution)*vn*ny;}
  }
}
// 絵の金の釘はすべて当たるが、並びが実機ほど整っていないので、玉が釘の間に乗って止まることがある。
// STILL.time 秒のあいだ STILL.move より動かなかった玉は、そのとき触れている釘（b.pass）を STILL.slip 秒だけ通り抜けて、狭い間からこぼれ落ちる（実機の玉の揺れの代わり）。
// 玉を細くする方法だと、細いまま道釘の粒の間のくぼみにはまって抜けられなくなるので、触れている釘だけを外す。待ち時間が短いので、止まって見えない。
const STILL={move:4,time:.15,slip:.3};
function ballStep(b,dt,pins,rand){const oldX=b.x,oldY=b.y;let impact=0;const {cx,cy,r,gravity,ball,guide}=BOARD;b.vy+=gravity*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const dx=b.x-cx,dy=b.y-cy,d0=Math.hypot(dx,dy);if(d0>r){const nx=dx/d0,ny=dy/d0;const dot=b.vx*nx+b.vy*ny;b.x=cx+nx*(r-1);b.y=cy+ny*(r-1);if(dot>0){b.vx-=1.75*dot*nx;b.vy-=1.75*dot*ny;}}const body=ball;for(const p of pins){if(p.rim&&b.stage||b.slip>0&&b.pass?.includes(p))continue;const px=b.x-p.x,py=b.y-p.y,hit=body+(p.r??NAIL_R);if(px>hit||px<-hit||py>hit||py<-hit)continue;const d=Math.hypot(px,py);if(d<hit&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x=p.x+nx*hit;b.y=p.y+ny*hit;if(dot<0){impact=Math.max(impact,-dot);b.vx-=1.5*dot*nx;b.vy-=1.5*dot*ny;}b.vx+=nx*3;}}for(const [x1,y1,x2,y2,min=guide] of BOARD.guides){const ex=x2-x1,ey=y2-y1,t=Math.max(0,Math.min(1,((b.x-x1)*ex+(b.y-y1)*ey)/(ex*ex+ey*ey))),px=b.x-(x1+ex*t),py=b.y-(y1+ey*t),d=Math.hypot(px,py);if(d<min&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x+=nx*(min-d);b.y+=ny*(min-d);if(dot<0){b.vx-=1.3*dot*nx;b.vy-=1.3*dot*ny;}}}collidePlastic(b,oldX,oldY,dt,rand);collideDisplay(b);crossStart(b,oldX,oldY);b.slip=Math.max(0,(b.slip??0)-dt);const s=b.still??={x:b.x,y:b.y,t:0};if(Math.hypot(b.x-s.x,b.y-s.y)>STILL.move){s.x=b.x;s.y=b.y;s.t=0;}else if((s.t+=dt)>STILL.time){s.t=0;b.slip=STILL.slip;b.pass=pins.filter(p=>Math.hypot(b.x-p.x,b.y-p.y)<ball+(p.r??NAIL_R)+1);}return impact;}

// Limit both time and travel per substep so fast balls cannot skip thin pins/rails or the mouth.
export function advanceBall(b,dt,pins,rand=Math.random){
  b.prevY=b.y;let remaining=Math.max(0,dt),impact=0;
  while(remaining>1e-9&&!b.startEntered){const h=Math.min(remaining,1/240,BOARD.ball*.5/(Math.hypot(b.vx,b.vy)+BOARD.gravity*remaining+1));impact=Math.max(impact,ballStep(b,h,pins,rand));remaining-=h;}
  return impact;
}

// The lower LCD corners are chamfered in the art. A rectangle here blocks the clear apron.
export function collideDisplay(b){
  const {x1,x2,y1,y2}=BOARD.display;
  const points=[[x1,y1],[x2,y1],[x2,464],[456,y2],[264,y2],[x1,464]];
  let nearest=null;
  for(let i=0;i<points.length;i++){const [x,y]=points[i],[xx,yy]=points[(i+1)%points.length],dx=xx-x,dy=yy-y,len=Math.hypot(dx,dy),nx=dy/len,ny=-dx/len;
    const d=(b.x-x)*nx+(b.y-y)*ny;if(d>=0)return;
    if(!nearest||d>nearest.d)nearest={d,nx,ny};
  }
  const {d,nx,ny}=nearest;b.x-=nx*d;b.y-=ny*d;const dot=b.vx*nx+b.vy*ny;
  if(dot<0){b.vx-=1.65*dot*nx;b.vy-=1.65*dot*ny;}
}

// Pachinko hold (保留) and LCD spin plan. Holds never hint at the result; misses avoid one-step-off "near-miss" stops.
export const MAX_HOLDS=4;
// リーチの途中（最後の段階の半ば、push 秒）で液晶が「ボタンを押せ」と出し、押すか PUSH_WAIT 秒たつと中央の数字が止まる。ボタンはどのリーチでも出る（色はリーチの色）。
export const PUSH_WAIT=3.5;
export function addHold(holds){return holds<MAX_HOLDS?holds+1:holds;}
const wrap=n=>((n-1)%9+9)%9+1;
// Reach kinds, like the ノーマル → SP → SPSP reaches of a real machine: every reach starts as a normal reach and may develop
// (発展) into 流星リーチ and then 天空城リーチ, or straight into バトルリーチ (Hana fights an enemy; see BATTLE and battle-fx.js). The kind and the title colour are picked after the draw, from the tables below,
// so the jackpot odds (1/99) never change; only the presentation follows the result. Longer reaches and redder colours are
// picked more often for a win, which gives each kind its own 信頼度 (see reachTrust). variety:false keeps every reach normal and pink.
export const REACH_KINDS={normal:'ノーマルリーチ',sp:'流星リーチ',spsp:'天空城リーチ',battle:'バトルリーチ'};
export const REACH_PICK={win:{normal:10,sp:30,spsp:25,battle:35},miss:{normal:72,sp:20,spsp:5,battle:3}};
export const REACH_COLOR={win:{blue:15,green:30,red:55},miss:{blue:60,green:30,red:10}};
export const WIN_ODDS=1/99,MISS_REACH=1/15;
const pick=(table,rand)=>{let r=rand(100);for(const [k,w] of Object.entries(table)){if(r<w)return k;r-=w;}return Object.keys(table)[0];};
// Share of reaches showing this kind (and colour, if given) that win.
export function reachTrust(kind,color){const share=(o,c)=>(kind?REACH_PICK[o][kind]/100:1)*(color?REACH_COLOR[o][color]/100:1)*c;
  const w=share('win',WIN_ODDS),m=share('miss',(1-WIN_ODDS)*MISS_REACH);return w/(w+m);}
// バトルリーチ: the battle stage opens with the enemy and a VS title (intro s), then Hana and the enemy trade attacks every cycle s,
// the same for every draw, until the button. After the button the fight is settled on screen and the middle number stops hold s later:
// a win ends with Hana's special move, a loss with the enemy leaving. revive % of battle wins first play the loss (identical to a real
// loss up to reviveAt s, well before a real loss stops at hold.lose), then Hana glows, gets back up and wins (復活). A miss never
// revives, and nothing happens after the middle number has stopped, so a stopped miss is final.
export const BATTLE={intro:1.9,cycle:1.6,clash:.6,reviveAt:1,hold:{win:1.9,lose:1.8,revive:3.1},revive:10,enemies:{cloud:'雲のいたずら精 モクモ'}};
// Seconds of each stage: a plain reach is one stage; a developing one shortens the normal stage and adds the later ones.
// The button comes halfway through the last stage, so a battle gets one exchange of attacks (gentle) or two before it.
function reachStages(kind,gentle){const g=(a,b)=>gentle?a:b;return kind==='normal'?[['normal',g(2.5,4)]]:kind==='sp'?[['normal',g(1.6,2)],['sp',g(3,4.5)]]:kind==='battle'?[['normal',g(1.6,2)],['battle',2*(BATTLE.intro+BATTLE.cycle*g(1,2))]]:[['normal',g(1.6,2)],['sp',g(2,2.5)],['spsp',g(3.5,5.5)]];}
// force: {kind, revive} from the ?reach= page option, to check how a reach looks. It changes only the presentation, never the result.
// reach: whether a miss shows a reach, when it was already decided at the START entry (drawHold); left out, it is drawn here.
export function planSpin(win,holdsLeft,{gentle=true,rand=randomInt,variety=true,force=null,reach:missReach}={}){const reach=win||(missReach??rand(15)===0);let left=rand(9)+1,right=left,middle=left;if(!win){if(reach){const far=[1,2,3,4,5,6,7,8,9].filter(n=>n!==left&&n!==wrap(left-1)&&n!==wrap(left+1));middle=far[rand(far.length)];}else{right=wrap(left+1+rand(8));middle=rand(9)+1;}}
if(reach){const o=win?'win':'miss',picked=variety?pick(REACH_PICK[o],rand):'normal',kind=variety&&force?.kind in REACH_KINDS?force.kind:picked,color=variety?pick(REACH_COLOR[o],rand):'pink';let at=2.8;const stages=reachStages(kind,gentle).map(([k,len])=>{const s={kind:k,at,until:at+len};at+=len;return s;}),last=stages[stages.length-1];
  const plan={numbers:[left,middle,right],reach,kind,color,stages,stops:[2,at,2.8],duration:at,push:last.at+(last.until-last.at)/2};
  if(kind==='battle')plan.battle={enemy:'cloud',outcome:!win?'lose':force?.revive||rand(100)<BATTLE.revive?'revive':'win'};return plan;}
const duration=holdsLeft>=3?2.5:holdsLeft>=1?4:5;return {numbers:[left,middle,right],reach,stops:[duration-1.2,duration,duration-.6],duration};}
// 保留 (hold): like a real machine, the jackpot draw is made when the ball enters START (入賞時), and the hold lamp takes a colour
// (色保留) from the tables below: white (no hint), blue, green, red, gold, or rainbow (大当たり確定). The colour is picked after the draw,
// so the odds (1/99) never change; only how often each colour shows differs by outcome, which gives each one its 信頼度 (holdTrust),
// near real machines (青 5–15%, 緑 10–38%, 赤 40–60%, 金 77–96%, 虹 確定). Weights are per 10000. change % of coloured holds first
// show a lower colour and change to their own when their draw starts (当該保留の変化); trust is for the colour after any change.
// variety:false (the 「いつも同じ」 setting) keeps every hold white.
export const HOLD_COLORS=['white','blue','green','red','gold','rainbow'];
export const HOLD_PICK={win:{white:2500,blue:1000,green:1500,red:2500,gold:2000,rainbow:500},chance:{white:7846,blue:1200,green:600,red:300,gold:54,rainbow:0},miss:{white:9854,blue:122,green:18,red:6,gold:0,rainbow:0}};
export const HOLD_CHANGE=35;
// After a reach that misses, the stopped numbers stay on screen REACH_REST s before the next draw starts.
export const REACH_REST=1;
// One hold, drawn at the START entry: the result (prize, win), whether a miss shows a reach, and the colour shown now (shown) and at its draw (color).
export function drawHold({rand=randomInt,variety=true,force=null}={}){const prize=resolvePachinko(rand(99)),win=prize>0,reach=win||rand(15)===0,outcome=win?'win':reach?'chance':'miss';
  const color=!variety?'white':HOLD_COLORS.includes(force)?force:weighted(HOLD_PICK[outcome],rand),below=HOLD_COLORS.indexOf(color);
  const shown=variety&&below>0&&rand(100)<HOLD_CHANGE?HOLD_COLORS[rand(below)]:color;return {prize,win,reach,color,shown};}
// Share of holds ending in this colour that win.
export function holdTrust(color){const odds=NOTICE_ODDS.pachinko,share=o=>HOLD_PICK[o][color]/10000*odds[o];return share('win')/(share('win')+share('chance')+share('miss'));}
// Share of battles whose loss scene (the enemy starting to leave) turns into a revival.
export function reviveTrust(){const w=WIN_ODDS*REACH_PICK.win.battle/100*BATTLE.revive/100,m=(1-WIN_ODDS)*MISS_REACH*REACH_PICK.miss.battle/100;return w/(w+m);}
// The reach stage showing at time t of a draw (null before the reach; the last stage lasts until the button stops the middle number).
export function reachStage(plan,t){return plan?.reach?plan.stages.findLast(s=>t>=s.at)??null:null;}

// 予告（notice）: like a real machine, a short show at the start of a draw (群れが横切る・セリフ・カットイン・ステージチェンジ, each in
// blue / green / red / gold) hints at the outcome. It is picked after the draw from the tables below, so the odds never change; only
// how often each notice shows differs by outcome, which gives each one its 信頼度 (noticeTrust). outcome: 'win' (pachinko jackpot /
// slot BIG), 'chance' (pachinko reach that misses / slot watermelon or cherry) or 'miss'. Weights are per 1000.
export const NOTICE_KINDS={butterflies:'蝶の群れ',birds:'鳥の群れ',petals:'花吹雪',stars:'星の群れ',words:'セリフ予告',cutin:'カットイン',stage:'ステージチェンジ'};
export const NOTICE_COLORS=['blue','green','red','gold'];
export const NOTICE_PICK={win:{none:350,butterflies:80,birds:80,petals:100,stars:100,words:90,cutin:120,stage:80},chance:{none:700,butterflies:60,birds:60,petals:50,stars:40,words:40,cutin:30,stage:20},miss:{none:900,butterflies:25,birds:25,petals:20,stars:15,words:10,cutin:5,stage:0}};
export const NOTICE_COLOR={win:{blue:200,green:300,red:350,gold:150},chance:{blue:500,green:350,red:140,gold:10},miss:{blue:700,green:250,red:50,gold:0}};
// Share of draws with each outcome: pachinko (1/99, reaches on 1/15 of misses) and slot (BIG, watermelon + cherry, the rest).
export const NOTICE_ODDS={pachinko:{win:WIN_ODDS,chance:(1-WIN_ODDS)*MISS_REACH,miss:(1-WIN_ODDS)*(1-MISS_REACH)},slot:{win:40/ROLE_RANGE,chance:600/ROLE_RANGE,miss:1-640/ROLE_RANGE}};
const weighted=(table,rand)=>{const total=Object.values(table).reduce((a,b)=>a+b,0);let r=rand(total);for(const [k,w] of Object.entries(table)){if(r<w)return k;r-=w;}return Object.keys(table)[0];};
// The notice of one draw, or null. variety:false (the 「いつも同じ」 setting) never shows one.
export function pickNotice(outcome,{rand=randomInt,variety=true}={}){if(!variety)return null;const kind=weighted(NOTICE_PICK[outcome],rand);return kind==='none'?null:{kind,color:weighted(NOTICE_COLOR[outcome],rand)};}
// Share of draws showing this notice (kind and/or colour) that win.
export function noticeTrust(machine,kind,color){const odds=NOTICE_ODDS[machine],share=o=>(kind?NOTICE_PICK[o][kind]/1000:1-NOTICE_PICK[o].none/1000)*(color?NOTICE_COLOR[o][color]/1000:1)*odds[o];
  return share('win')/(share('win')+share('chance')+share('miss'));}

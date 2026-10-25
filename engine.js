export const REELS=[
['bell','cherry','replay','seven','bell','watermelon','replay','bar','bell','cherry','replay','watermelon','bell','seven','replay','bar','bell','cherry','replay','watermelon','bar'],
['bell','seven','replay','watermelon','bell','bar','replay','cherry','bell','seven','replay','watermelon','bell','bar','replay','seven','bell','cherry','replay','watermelon','bar'],
['bell','watermelon','replay','bar','bell','seven','replay','cherry','bell','watermelon','replay','seven','bell','bar','replay','cherry','bell','watermelon','replay','seven','bar']];
export const STRIP=REELS[0];
// AURORA筐体画像（720×960）の盤面ガラスと中央液晶の位置に合わせた座標。button は中央手前のチャンスボタン（ガラスより手前のドーム）の上側を覆う楕円。
export const BOARD={cx:360,cy:430,r:300,gravity:860,hit:9,display:{x1:188,x2:532,y1:256,y2:504},button:{x:360,y:702,rx:98,ry:54},guides:[[92,528,258,575],[182,258,360,226],[360,226,538,258]]};
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
// 停止ボタンを押した位置baseから0〜4コマすべらせ、成立役は引き込み、それ以外は中央ラインから外す。
// stopped：各リールの止まる図柄（未停止はnull）。
export function chooseSlip(reel,base,role,stopped){let best=0,bestScore=-1;for(let slip=0;slip<=MAX_SLIP;slip++){const line=stopped.slice();line[reel]=REELS[reel][(base+slip)%REELS[reel].length];const score=rateLine(line,role);if(score>bestScore){best=slip;bestScore=score;}}return best;}
function rateLine(line,role){const open=line.filter(s=>s===null).length;if(open===0){const result=judge(line);if(result===role&&role!=='none')return 2;if(result!=='none')return 0;return line.every(s=>s===line[0])?0:1;}if(line[0]==='cherry'&&role!=='cherry')return 0;if(role==='cherry')return line[0]==='cherry'?2:1;const target=LINE_SYMBOL[role];if(target&&line.every(s=>s===null||s===target))return 2;return 1;}
export function randomInt(n){const a=new Uint32Array(1);const max=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=max);return a[0]%n;}
export function payout(symbols){return PAY[judge(symbols)];}
export function resolvePachinko(draw){return draw===0?300:0;}
// 大当たりは実機のようなラウンド制：右下の大入賞口（アタッカー）が開き、右打ちで入れた玉1つにつき BONUS.prize 玉を払い出す。
// 1ラウンドは BONUS.count 個入るか BONUS.open 秒で閉じ、BONUS.gap 秒あけて次のラウンド。最大 rounds×count×prize 玉。
export const BONUS={rounds:4,count:10,prize:8,open:30,gap:2};
export const ATTACKER={x1:548,x2:578,y1:640,y2:660};
export function inAttacker(b){return b.vy>0&&b.y>ATTACKER.y1&&b.y<ATTACKER.y2&&b.x>ATTACKER.x1&&b.x<ATTACKER.x2;}
// 釘の配置：格子状の釘と、入賞口の左右の命釘。液晶の左下には玉を START 入賞口へ寄せる透明なガイド（BOARD.guides）がある。
export function makePins(){const {cx,cy,r,display:d}=BOARD,pins=[];for(let row=0;row<16;row++){for(let col=0;col<19;col++){const x=72+col*32+(row%2)*16,y=160+row*34;if(Math.hypot(x-cx,y-cy)>r-26||y>690)continue;if(x>d.x1-14&&x<d.x2+14&&y>d.y1-14&&y<d.y2+14)continue;if(y>560&&Math.abs(x-cx)<44)continue;if(inButton(x,y,8))continue;if(BOARD.guides.some(([x1,y1,x2,y2])=>x>Math.min(x1,x2)-16&&x<Math.max(x1,x2)+16&&y>y1+(x-x1)*(y2-y1)/(x2-x1)-22&&y<y1+(x-x1)*(y2-y1)/(x2-x1)+40))continue;pins.push({x,y});}}return pins.concat([{x:336,y:598},{x:384,y:598}]);}
// 点がチャンスボタンの楕円（padだけ広げる）の内側か。
export function inButton(x,y,pad=0){const {x:bx,y:by,rx,ry}=BOARD.button;return ((x-bx)/(rx+pad))**2+((y-by)/(ry+pad))**2<1;}
// 発射された玉は外周レールを上って、強度に応じた角度で盤面へ出る（強いほど右寄り）。
export function launchBall(power,jitter=0){const a=Math.PI*(165/180);return {x:BOARD.cx+Math.cos(a)*(BOARD.r-7),y:BOARD.cy+Math.sin(a)*(BOARD.r-7),vx:0,vy:0,age:0,rail:{angle:a,end:Math.PI*((222+Math.max(0,(power-.25)/.75)**2*95+jitter*4)/180),speed:340+power*190+jitter*15}};}
export function advanceRail(b,dt){const R=BOARD.r-7,rail=b.rail;rail.angle=Math.min(rail.end,rail.angle+rail.speed/R*dt);b.x=BOARD.cx+Math.cos(rail.angle)*R;b.y=BOARD.cy+Math.sin(rail.angle)*R;if(rail.angle>=rail.end){b.vx=-Math.sin(rail.angle)*rail.speed;b.vy=Math.cos(rail.angle)*rail.speed;delete b.rail;}}
export function inStart(b){return b.y>602&&b.y<626&&Math.abs(b.x-BOARD.cx)<19&&b.vy>0;}
export function advanceBall(b,dt,pins){let impact=0;const {cx,cy,r,gravity,hit}=BOARD;b.vy+=gravity*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const dx=b.x-cx,dy=b.y-cy,d0=Math.hypot(dx,dy);if(d0>r){const nx=dx/d0,ny=dy/d0;const dot=b.vx*nx+b.vy*ny;b.x=cx+nx*(r-1);b.y=cy+ny*(r-1);if(dot>0){b.vx-=1.75*dot*nx;b.vy-=1.75*dot*ny;}}for(const p of pins){const px=b.x-p.x,py=b.y-p.y,d=Math.hypot(px,py);if(d<hit&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x=p.x+nx*hit;b.y=p.y+ny*hit;if(dot<0){impact=Math.max(impact,-dot);b.vx-=1.5*dot*nx;b.vy-=1.5*dot*ny;}b.vx+=nx*3;}}for(const [x1,y1,x2,y2] of BOARD.guides){const ex=x2-x1,ey=y2-y1,t=Math.max(0,Math.min(1,((b.x-x1)*ex+(b.y-y1)*ey)/(ex*ex+ey*ey))),px=b.x-(x1+ex*t),py=b.y-(y1+ey*t),d=Math.hypot(px,py),min=hit-.5;if(d<min&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x+=nx*(min-d);b.y+=ny*(min-d);if(dot<0){b.vx-=1.3*dot*nx;b.vy-=1.3*dot*ny;}}}return impact;}

export function collideDisplay(b){const {x1,x2,y1,y2}=BOARD.display;if(b.x<=x1||b.x>=x2||b.y<=y1||b.y>=y2)return;const distances=[b.x-x1,x2-b.x,b.y-y1,y2-b.y];const side=distances.indexOf(Math.min(...distances));if(side===0){b.x=x1;b.vx=-Math.abs(b.vx)*.65;}if(side===1){b.x=x2;b.vx=Math.abs(b.vx)*.65;}if(side===2){b.y=y1;b.vy=-Math.abs(b.vy)*.6;b.vx+=(b.x<BOARD.cx?-1:1)*15;}if(side===3){b.y=y2;b.vy=Math.abs(b.vy)*.65;}}

// Pachinko hold (保留) and LCD spin plan. Holds never hint at the result; misses avoid one-step-off "near-miss" stops.
export const MAX_HOLDS=4;
// リーチの途中（push 秒）で液晶が「ボタンを押せ」と出し、押すか PUSH_WAIT 秒たつと中央の数字が止まる。リーチならどれでも同じように出るので、当たりの予告にはならない。
export const PUSH_WAIT=3.5;
export function addHold(holds){return holds<MAX_HOLDS?holds+1:holds;}
const wrap=n=>((n-1)%9+9)%9+1;
export function planSpin(win,holdsLeft,{gentle=true,rand=randomInt}={}){const reach=win||rand(15)===0;let left=rand(9)+1,right=left,middle=left;if(!win){if(reach){const far=[1,2,3,4,5,6,7,8,9].filter(n=>n!==left&&n!==wrap(left-1)&&n!==wrap(left+1));middle=far[rand(far.length)];}else{right=wrap(left+1+rand(8));middle=rand(9)+1;}}
if(reach){const tension=gentle?2.5:4;return {numbers:[left,middle,right],reach,stops:[2,2.8+tension,2.8],duration:2.8+tension,push:2.8+tension/2};}
const duration=holdsLeft>=3?2.5:holdsLeft>=1?4:5;return {numbers:[left,middle,right],reach,stops:[duration-1.2,duration,duration-.6],duration};}

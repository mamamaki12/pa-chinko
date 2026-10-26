export const REELS=[
['bell','cherry','replay','seven','bell','watermelon','replay','bar','bell','cherry','replay','watermelon','bell','seven','replay','bar','bell','cherry','replay','watermelon','bar'],
['bell','seven','replay','watermelon','bell','bar','replay','cherry','bell','seven','replay','watermelon','bell','bar','replay','seven','bell','cherry','replay','watermelon','bar'],
['bell','watermelon','replay','bar','bell','seven','replay','cherry','bell','watermelon','replay','seven','bell','bar','replay','cherry','bell','watermelon','replay','seven','bar']];
export const STRIP=REELS[0];
// AURORA筐体画像（720×960）の盤面ガラスと中央液晶の位置に合わせた座標。button は中央手前のチャンスボタン（ガラスより手前のドーム）の上側を覆う楕円。ball は玉の半径、guide は玉の中心がガイドに近づける距離（guides の5つ目の数があればそのガイドだけその距離）。
export const BOARD={cx:360,cy:430,r:300,gravity:860,ball:4.5,guide:7,display:{x1:188,x2:532,y1:256,y2:504},button:{x:360,y:702,rx:98,ry:54},guides:[[182,258,360,226],[360,226,538,258],[349,599,349,618,6],[370,599,370,618,6]]};
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
// 釘：筐体画像（assets/aurora.webp）に描かれた金色の釘。表示されている金の釘はすべて玉が当たる。
// 1本ずつの釘は画像から金色の丸い粒を拾ったもの。液晶の左下に斜めに並ぶ3本の釘の列（道釘）は、絵の列に沿って5ずつ並べた。
// 液晶の屋根（ガイド）に重なる飾りの粒、チャンスボタン・外周の際はのぞき、START入賞口の上の2本（命釘）は手で置いた。プログラムでは描かず、画像の釘に当たる。
// 1本ずつ id・位置・頭の半径 r を持つ部品。玉が当たるのは中心どうしが BOARD.ball + r より近いとき。
const NAIL_R=1.5,NAIL_XY=[312,152,317,154,332,154,386,154,405,154,374,155,294,156,364,156,428,156,401,157,292,160,376,164,327,165,392,166,416,167,238,168,273,171,313,173,482,174,397,178,370,183,502,185,308,187,498,190,278,191,425,191,506,193,217,196,487,197,535,202,328,203,516,203,187,207,409,207,294,209,312,211,389,211,541,213,485,214,524,217,168,219,172,223,273,223,443,223,561,225,454,226,192,227,548,228,556,231,157,232,138,244,567,244,157,247,581,251,132,261,158,261,562,261,127,262,595,266,166,272,163,278,565,279,541,284,172,285,563,289,177,290,608,292,160,301,563,303,612,306,549,307,122,310,166,314,595,315,611,321,177,322,167,323,542,324,162,325,141,326,561,326,552,328,90,330,121,330,167,336,577,338,564,340,547,341,599,343,135,344,563,344,552,345,167,348,85,350,135,350,628,351,611,352,136,354,550,356,136,362,575,368,618,368,138,369,111,370,149,371,172,374,136,375,117,376,78,378,95,382,126,382,145,389,92,392,73,393,550,398,96,401,158,401,167,405,94,406,177,408,619,408,126,410,115,411,145,414,131,415,163,419,566,422,614,423,133,424,179,424,103,431,171,433,135,436,120,439,127,439,590,439,84,441,145,441,92,444,147,445,114,447,137,449,577,449,560,454,129,455,622,455,75,456,116,456,609,456,137,457,617,460,117,462,634,462,102,466,544,466,570,467,607,467,146,470,90,474,145,475,74,477,543,480,93,481,591,485,112,487,575,487,151,494,124,496,132,496,591,500,156,501,560,502,565,503,556,504,87,506,137,508,141.4,510.2,145.9,512.5,581,513,106,514,129,514,150.3,514.8,570,515,154.8,517,424,517,471,518,476,518,297,519,159.2,519.2,163.7,521.5,137,522,552,523,168.2,523.8,274,524,447,524,117,525,127,525,311,525,414,525,419,525,172.6,526,566,526,296,528,177.1,528.2,431,529,411,530,181.5,530.5,494,532,582,532,185.9,532.8,124,533,556,533,566,533,96,534,190.4,535,384,535,132,536,260,536,330,536,194.8,537.2,519,539,539,539,199.3,539.5,138,541,203.8,541.8,618,543,142.6,543.1,208.2,544,441,545,147.2,545.2,297,546,212.7,546.2,397,547,151.8,547.4,504,548,217.1,548.5,313,549,156.4,549.5,126,550,466,550,221.6,550.8,372,551,160.9,551.6,268,552,226,553,165.5,553.7,201,554,601,554,230.5,555.2,170.1,555.8,105,556,140,556,206,557,330,557,235,557.4,174.7,557.9,600,559,239.5,559.6,280,560,605,560,179.3,560.1,315,561,244,561.8,183.9,562.2,283.8,562.6,248.5,563.9,225,564,188.5,564.3,116,565,157,565,287.6,565.2,392,566,253,566.1,193.1,566.4,470,567,291.4,567.8,136,568,257.5,568.3,197.6,568.5,177,569,237,569,451,570,510,570,603,570,295.2,570.4,262,570.5,202.2,570.6,532,572,266.5,572.7,206.8,572.8,114,573,120,573,299,573,412,573,211.4,574.9,271,574.9,244,575,592,575,371,576,566,576,191,577,216,577,521,577,602,577,275.5,577.1,117,578,320,578,347,578,401,579,220.6,579.1,280,579.2,196,580,448,580,225.1,581.2,284.5,581.4,203,582,249,583,229.7,583.3,289,583.6,259,584,209,585,234.2,585.4,293.5,585.8,480,586,582,586,535,587,238.8,587.6,298,588,437,589,565,589,243.3,589.7,217,590,588,590,302.8,590.2,201,591,287,591,463,591,247.9,591.8,121,592,225,592,307.6,592.4,252.4,593.9,312.4,594.6,349,595,370,595,408,595,584,595,257,596,317.2,596.8,399,597,261.1,598.1,191,599,322,599,265.3,600.3,135,601,186,601,509,602,269.4,602.4,145,603,177,604,495,604,273.6,604.6,431,605,249,606,441,606,277.7,606.7,281.9,608.9,312,609,407,609,546,609,286,611,191,615,470,618,519,618,191,619,433,619,515,619,568,619,563,620,533,621,150,622,304,622,414,622,451,622,519,622,555,622,292,624,273,625,437,625,316,627,570,627,348,631,298,632,488,632,333,633,373,633,288,634,507,634,544,634,169,636,275,639,313,641,502,642,248,644,407,645,450,645,471,647,206,649,424,650,187,651,294,652,522,653,534,653,493,662,256,670,460,670,216,680,241,685];
export const NAILS=[];for(let i=0;i<NAIL_XY.length;i+=2)NAILS.push({id:`nail-${String(i/2+1).padStart(3,'0')}`,x:NAIL_XY[i],y:NAIL_XY[i+1],r:NAIL_R});
export function makePins(){return NAILS.map(n=>({...n}));}
// 点がチャンスボタンの楕円（padだけ広げる）の内側か。
export function inButton(x,y,pad=0){const {x:bx,y:by,rx,ry}=BOARD.button;return ((x-bx)/(rx+pad))**2+((y-by)/(ry+pad))**2<1;}
// 発射された玉は外周レールを上って、強度に応じた角度で盤面へ出る（強いほど右寄り）。
export function launchBall(power,jitter=0){const a=Math.PI*(165/180);return {x:BOARD.cx+Math.cos(a)*(BOARD.r-7),y:BOARD.cy+Math.sin(a)*(BOARD.r-7),vx:0,vy:0,age:0,rail:{angle:a,end:Math.PI*((222+Math.max(0,(power-.25)/.75)**2*95+jitter*4)/180),speed:340+power*190+jitter*15}};}
export function advanceRail(b,dt){const R=BOARD.r-7,rail=b.rail;rail.angle=Math.min(rail.end,rail.angle+rail.speed/R*dt);b.x=BOARD.cx+Math.cos(rail.angle)*R;b.y=BOARD.cy+Math.sin(rail.angle)*R;if(rail.angle>=rail.end){b.vx=-Math.sin(rail.angle)*rail.speed;b.vy=Math.cos(rail.angle)*rail.speed;delete b.rail;}}
// START入賞口（ヘソ）は命釘の真下に左右の壁（guides の最後の2本）がある袋で、命釘の間から下向きに入った玉だけを数える。
export function inStart(b){return b.y>602&&b.y<626&&Math.abs(b.x-BOARD.cx)<10&&b.vy>0;}
// 絵の金の釘はすべて当たるが、並びが実機ほど整っていないので、玉が釘の間に乗って止まることがある。
// STILL.time 秒のあいだ STILL.move より動かなかった玉は STILL.slip 秒だけ釘に当たる太さを SLIP 倍に細め、狭い間からこぼれ落ちる（実機の玉の揺れの代わり）。
const SLIP=.3,STILL={move:4,time:.35,slip:.3};
export function advanceBall(b,dt,pins){let impact=0;const {cx,cy,r,gravity,ball,guide}=BOARD;b.vy+=gravity*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const dx=b.x-cx,dy=b.y-cy,d0=Math.hypot(dx,dy);if(d0>r){const nx=dx/d0,ny=dy/d0;const dot=b.vx*nx+b.vy*ny;b.x=cx+nx*(r-1);b.y=cy+ny*(r-1);if(dot>0){b.vx-=1.75*dot*nx;b.vy-=1.75*dot*ny;}}const body=b.slip>0?ball*SLIP:ball;for(const p of pins){const px=b.x-p.x,py=b.y-p.y,hit=body+(p.r??NAIL_R);if(px>hit||px<-hit||py>hit||py<-hit)continue;const d=Math.hypot(px,py);if(d<hit&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x=p.x+nx*hit;b.y=p.y+ny*hit;if(dot<0){impact=Math.max(impact,-dot);b.vx-=1.5*dot*nx;b.vy-=1.5*dot*ny;}b.vx+=nx*3;}}for(const [x1,y1,x2,y2,min=guide] of BOARD.guides){const ex=x2-x1,ey=y2-y1,t=Math.max(0,Math.min(1,((b.x-x1)*ex+(b.y-y1)*ey)/(ex*ex+ey*ey))),px=b.x-(x1+ex*t),py=b.y-(y1+ey*t),d=Math.hypot(px,py);if(d<min&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x+=nx*(min-d);b.y+=ny*(min-d);if(dot<0){b.vx-=1.3*dot*nx;b.vy-=1.3*dot*ny;}}}b.slip=Math.max(0,(b.slip??0)-dt);const s=b.still??={x:b.x,y:b.y,t:0};if(Math.hypot(b.x-s.x,b.y-s.y)>STILL.move){s.x=b.x;s.y=b.y;s.t=0;}else if((s.t+=dt)>STILL.time){s.t=0;b.slip=STILL.slip;}return impact;}

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

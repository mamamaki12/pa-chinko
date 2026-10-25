export const REELS=[
['bell','cherry','replay','seven','bell','watermelon','replay','bar','bell','cherry','replay','watermelon','bell','seven','replay','bar','bell','cherry','replay','watermelon','bar'],
['bell','seven','replay','watermelon','bell','bar','replay','cherry','bell','seven','replay','watermelon','bell','bar','replay','seven','bell','cherry','replay','watermelon','bar'],
['bell','watermelon','replay','bar','bell','seven','replay','cherry','bell','watermelon','replay','seven','bell','bar','replay','cherry','bell','watermelon','replay','seven','bar']];
export const STRIP=REELS[0];
// 独自の役抽選テーブル（16384分の）。BIGは7揃い150枚の一回払い、リプレイは次ゲームのメダル不要。
export const ROLE_TABLE=[['big',40],['watermelon',200],['cherry',400],['bell',1800],['replay',2240]];
export const ROLE_RANGE=16384;
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
export function advanceBall(b,dt,pins){let hit=0;b.vy+=620*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const dx=b.x-360,dy=b.y-370,r=Math.hypot(dx,dy);if(r>272){const nx=dx/r,ny=dy/r;const dot=b.vx*nx+b.vy*ny;b.x=360+nx*271;b.y=370+ny*271;if(dot>0){b.vx-=1.75*dot*nx;b.vy-=1.75*dot*ny;}}for(const p of pins){const px=b.x-p.x,py=b.y-p.y,d=Math.hypot(px,py);if(d<8&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x=p.x+nx*8;b.y=p.y+ny*8;if(dot<0){hit=Math.max(hit,-dot);b.vx-=1.65*dot*nx;b.vy-=1.65*dot*ny;}b.vx+=nx*5;}}return hit;}

export function collideDisplay(b){if(b.x<=214||b.x>=506||b.y<=230||b.y>=464)return;const distances=[b.x-214,506-b.x,b.y-230,464-b.y];const side=distances.indexOf(Math.min(...distances));if(side===0){b.x=214;b.vx=-Math.abs(b.vx)*.65;}if(side===1){b.x=506;b.vx=Math.abs(b.vx)*.65;}if(side===2){b.y=230;b.vy=-Math.abs(b.vy)*.6;b.vx+=(b.x<360?-1:1)*15;}if(side===3){b.y=464;b.vy=Math.abs(b.vy)*.65;}}

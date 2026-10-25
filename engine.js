export const STRIP = ['seven','bell','cherry','bar','bell','watermelon','seven','replay','cherry','bell','bar','watermelon','bell','replay','seven','cherry','bell','bar','replay','watermelon','bell'];
export function randomInt(n){const a=new Uint32Array(1);const max=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=max);return a[0]%n;}
export function payout(symbols){if(symbols.every(s=>s===symbols[0]))return ({seven:150,bell:15,cherry:8,bar:30,watermelon:10,replay:3})[symbols[0]]||0;return symbols[0]==='cherry'?2:0;}
export function resolvePachinko(draw){return draw===0?300:0;}
export function advanceBall(b,dt,pins){b.vy+=620*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;const dx=b.x-360,dy=b.y-370,r=Math.hypot(dx,dy);if(r>272){const nx=dx/r,ny=dy/r;const dot=b.vx*nx+b.vy*ny;b.x=360+nx*271;b.y=370+ny*271;if(dot>0){b.vx-=1.75*dot*nx;b.vy-=1.75*dot*ny;}}for(const p of pins){const px=b.x-p.x,py=b.y-p.y,d=Math.hypot(px,py);if(d<8&&d>0){const nx=px/d,ny=py/d,dot=b.vx*nx+b.vy*ny;b.x=p.x+nx*8;b.y=p.y+ny*8;if(dot<0){b.vx-=1.65*dot*nx;b.vy-=1.65*dot*ny;}b.vx+=nx*5;}}}

export function collideDisplay(b){if(b.x<=214||b.x>=506||b.y<=230||b.y>=464)return;const distances=[b.x-214,506-b.x,b.y-230,464-b.y];const side=distances.indexOf(Math.min(...distances));if(side===0){b.x=214;b.vx=-Math.abs(b.vx)*.65;}if(side===1){b.x=506;b.vx=Math.abs(b.vx)*.65;}if(side===2){b.y=230;b.vy=-Math.abs(b.vy)*.6;b.vx+=(b.x<360?-1:1)*15;}if(side===3){b.y=464;b.vy=Math.abs(b.vy)*.65;}}

// Pachinko hold (保留) and LCD spin plan. Holds never hint at the result; misses avoid one-step-off "near-miss" stops.
export const MAX_HOLDS=4;
export function addHold(holds){return holds<MAX_HOLDS?holds+1:holds;}
const wrap=n=>((n-1)%9+9)%9+1;
export function planSpin(win,holdsLeft,{gentle=true,rand=randomInt}={}){const reach=win||rand(15)===0;let left=rand(9)+1,right=left,middle=left;if(!win){if(reach){const far=[1,2,3,4,5,6,7,8,9].filter(n=>n!==left&&n!==wrap(left-1)&&n!==wrap(left+1));middle=far[rand(far.length)];}else{right=wrap(left+1+rand(8));middle=rand(9)+1;}}
if(reach){const tension=gentle?2.5:4;return {numbers:[left,middle,right],reach,stops:[2,2.8+tension,2.8],duration:2.8+tension};}
const duration=holdsLeft>=3?2.5:holdsLeft>=1?4:5;return {numbers:[left,middle,right],reach,stops:[duration-1.2,duration,duration-.6],duration};}

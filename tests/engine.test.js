import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STRIP,REELS,ROLE_TABLE,ROLE_RANGE,MAX_SLIP,drawRole,judge,chooseSlip,payout,resolvePachinko,advanceBall,randomInt,collideDisplay} from '../engine.js';
test('配当と外れ、左チェリー',()=>{assert.equal(payout(['seven','seven','seven']),150);assert.equal(payout(['bell','bell','bell']),8);assert.equal(payout(['watermelon','watermelon','watermelon']),10);assert.equal(payout(['cherry','cherry','cherry']),2);assert.equal(payout(['cherry','bell','bar']),2);assert.equal(payout(['replay','replay','replay']),0);assert.equal(judge(['replay','replay','replay']),'replay');assert.equal(payout(['bar','bar','bar']),0);assert.equal(payout(['bell','bar','seven']),0);});
test('パチンコの99通りに当たりは1つ',()=>{assert.equal(Array.from({length:99},(_,i)=>resolvePachinko(i)).filter(Boolean).length,1);assert.equal(resolvePachinko(0),300);});
test('釘との衝突で玉が反射する',()=>{const b={x:360,y:195,vx:0,vy:100};advanceBall(b,1/120,[{x:360,y:200}]);assert.ok(b.vy<0);assert.ok(Number.isFinite(b.x));});
test('盤面の外周から逸脱しない',()=>{const b={x:110,y:400,vx:60,vy:-800};for(let i=0;i<3000;i++){advanceBall(b,1/120,[]);assert.ok(Math.hypot(b.x-360,b.y-370)<=272.01);} });
test('リール配列と乱数の範囲',()=>{assert.equal(STRIP.length,21);for(const r of REELS)assert.equal(r.length,21);for(let i=0;i<1000;i++){const n=randomInt(99);assert.ok(n>=0&&n<99&&Number.isInteger(n));}});

test('中央液晶を玉が貫通しない',()=>{const b={x:300,y:231,vx:10,vy:100};collideDisplay(b);assert.equal(b.y,230);assert.ok(b.vy<0);});

test('役抽選の出現数が抽選表どおり',()=>{const count={};for(let n=0;n<ROLE_RANGE;n++){const r=drawRole(n);count[r]=(count[r]||0)+1;}let used=0;for(const [role,weight] of ROLE_TABLE){assert.equal(count[role],weight);used+=weight;}assert.equal(count.none,ROLE_RANGE-used);assert.equal(drawRole(0),'big');assert.equal(drawRole(ROLE_RANGE-1),'none');});
const ORDERS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
function play(role,presses,order){const stopped=[null,null,null],slips=[];for(const reel of order){const slip=chooseSlip(reel,presses[reel],role,stopped);slips.push(slip);stopped[reel]=REELS[reel][(presses[reel]+slip)%21];}return {line:stopped,slips};}
test('すべり制御：最大4コマ、成立していない役は揃わない',()=>{const roles=[...ROLE_TABLE.map(r=>r[0]),'none'];for(const role of roles)for(const order of ORDERS)for(let a=0;a<21;a++)for(let b=0;b<21;b++)for(let c=0;c<21;c+=2){const {line,slips}=play(role,[a,b,c],order);assert.ok(slips.every(s=>Number.isInteger(s)&&s>=0&&s<=MAX_SLIP));const result=judge(line);assert.ok(result===role||result==='none',`${role}なのに${result}：${line}`);if(result==='none')assert.ok(!line.every(s=>s===line[0]),`外れで3つ揃い：${line}`);}});
test('すべり制御：リプレイとベルはどこで押しても揃う',()=>{for(const role of ['replay','bell'])for(const order of ORDERS)for(let a=0;a<21;a++)for(let b=0;b<21;b++)for(let c=0;c<21;c++)assert.equal(judge(play(role,[a,b,c],order).line),role);});
test('すべり制御：チェリーは左リール、レア役は押す位置しだいで取りこぼす',()=>{let cherry=0,big=0,total=0;for(let a=0;a<21;a++)for(let b=0;b<21;b++)for(let c=0;c<21;c++){total++;if(judge(play('cherry',[a,b,c],[0,1,2]).line)==='cherry')cherry++;if(judge(play('big',[a,b,c],[0,1,2]).line)==='big')big++;}assert.equal(cherry,15*21*21);assert.ok(big>0&&big<total);});
test('釘に当たると衝突の強さを返す',()=>{const b={x:360,y:195,vx:0,vy:100};assert.ok(advanceBall(b,1/120,[{x:360,y:200}])>0);assert.equal(advanceBall({x:360,y:100,vx:0,vy:0},1/120,[]),0);});

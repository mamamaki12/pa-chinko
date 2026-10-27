import {STRIP,BOARD,launchBall,advanceRail,inStart,ROLE_RANGE,BIG,drawRole,settle,LINES,chooseSlip,warmSlips,randomInt,resolvePachinko,advanceBall,collideDisplay,MAX_HOLDS,addHold,planSpin,BONUS,inAttacker,inButton,PUSH_WAIT,reachStage,pickNotice} from './engine.js';
import {STAGE_AT,drawNotice,noticeAlpha} from './notice-fx.js';
import {REACH_COLORS,reachLayout,columnPlace,reachBackdrop,reachBanner,reachLabel} from './reach-fx.js';
import {play,music,fanfare} from './sound.js';
import {trackFor} from './music.js';
import {readReflection,appendReflection,renderWeek,renderWeekSummary} from './journal.js';
import {drawSlot,hitSlot,loadSlotFonts,symbol,LAYOUT,cellCenter} from './slot-view.js';
import {SHOWS,startShow,showOn,fanfareOn,showScene,drawShow,drawStage,drawWinCells,drawBonusPanel,goldText,PALETTES} from './celebration.js';
import {KINDS,createNavi,react,tick,drawNavi,drawBubble} from './lcd-character.js';
import {LED_PARTS,buildLeds,drawLeds,applyScene} from './cabinet-leds.js';
import {createParts,drawPartMap} from './cabinet-parts.js';
import {createBackdrop,stepBackdrop,drawBackdrop,stageChange} from './lcd-scenes.js';
import {readBuild,isNewer,versionLabel,formatBuiltAt,fetchLatest,refreshFiles,reloadUrl,cleanUrl} from './updater.js';
loadSlotFonts();
// Work out the reel control for each role in idle moments after the page opens, so the first stop of each role does not stutter.
['bell','replay','none','cherry','watermelon','big'].forEach((role,i)=>setTimeout(()=>warmSlips(role),1500+i*300));

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#machine'),ctx=canvas.getContext('2d'),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=720*dpr;canvas.height=960*dpr;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let mode='pachinko',sound=false,volume=.25,bgmVolume=.35,gentle=true,paused=false,ended=false,launching=false,elapsed=0,limit=600,breakAt=600,last=performance.now(),accumulator=0,launchClock=0,clock=0,active=false,saved=false;
const states={pachinko:{credit:1000,rounds:0,win:0,total:0,used:0},slot:{credit:1000,rounds:0,win:0,total:0,used:0}};
// bonus: the jackpot round play in progress (null when none). The attacker opens round by round; holds are not drawn meanwhile.
let bonus=null;
let balls=[],drawQueue=0,drawTime=0,drawResult=null,spinPlan=null,screen=[3,7,5],resultText='A U R O R A',resultUntil=0;
let positions=[0,3,6],velocities=[0,0,0],targets=[null,null,null],spinning=false,spinAge=0,role='none',replay=false;
// betPlaced: MAX BET has taken 3 medals for the next game (all 5 lines active). winLines: the lines (indexes into LINES) the last game won on.
// pressedAt/held drive the pressed look of the drawn lever and buttons.
let betPlaced=false,held=null,winLines=[];const pressedAt={};
// Like a real pachislot, a game lasts at least 4.1 s: the lever is accepted (and the role drawn) at once, but the reels wait until 4.1 s after the previous start.
// paying: medals still being counted out one by one onto CREDIT / PAYOUT after a win.
const GAME_WAIT=4.1;
// big: BIG BONUS in progress ({paid}), or null.
let big=null;let lastStart=-1e9,waitUntil=0,paying=null;
// show: the win show on screen (celebration.js): 'big' / 'jackpot' when a bonus starts, 'bigEnd' / 'jackpotEnd' when it ends.
let show=null;
let history=[];try{const h=JSON.parse(localStorage.getItem('reel-room-history')||'[]');if(Array.isArray(h))history=h.filter(r=>r&&typeof r.date==='string'&&Number.isFinite(r.seconds)&&typeof r.mode==='string').slice(0,50);}catch{}
let startedAt=null,sessionModes=new Set();
// LCD characters, one per machine. cue() makes the current machine's character react to something that has just happened.
const navis={pachinko:createNavi('hana'),slot:createNavi('sora')};let breakNoticed=false;
function cue(event,opts){react(navis[mode],event,clock,opts);}
function begin(){if(ended){elapsed=0;breakAt=limit;ended=false;saved=false;startedAt=null;sessionModes.clear();Object.values(states).forEach(s=>{s.rounds=0;s.total=0;s.used=0;s.win=0;});}if(!active){active=true;startedAt=new Date().toISOString();}sessionModes.add(mode);}
function tone(name,arg){if(!sound||paused||document.hidden)return;try{play(name,volume,arg);}catch{sound=false;$('#sound').setAttribute('aria-pressed','false');$('#sound span').textContent='サウンド利用不可';}}
function fanfareTone(machine){if(!sound||paused||document.hidden)return;try{fanfare(machine,volume);}catch{}}
// BGM follows what the machine shows (reach, jackpot rounds, BIG). It keeps playing while the settings are open so the volume can be heard.
// It waits while the fanfare of a bonus plays, then starts the bonus track from the top.
function bgm(){if(!sound||document.hidden||!bgmVolume||paused&&!$('#settings-dialog').open||fanfareOn(show,clock))return;try{music(trackFor({mode,reach:mode==='pachinko'&&reachOn(),bonus:mode==='pachinko'?!!bonus:!!big}),bgmVolume);}catch{}}
// Volumes are kept in this browser; sound itself always starts OFF.
try{const v=JSON.parse(localStorage.getItem('reel-room-volume')||'{}');if(v.se>=0&&v.se<=1)volume=v.se;if(v.bgm>=0&&v.bgm<=1)bgmVolume=v.bgm;}catch{}
function saveVolume(){try{localStorage.setItem('reel-room-volume',JSON.stringify({se:volume,bgm:bgmVolume}));}catch{}}
function say(s){$('#message').textContent=s;}
function update(){const s=states[mode];$('#credit').textContent=s.credit.toLocaleString();$('#rounds').textContent=s.rounds;$('#win').textContent=s.win;$('#launch').textContent=launching?'■ 発射を止める':'▶ 発射をはじめる';$('#launch').setAttribute('aria-pressed',String(launching));$('#launch').disabled=s.credit<1||paused;$('#spin').disabled=spinning||!!paying||(states.slot.credit<3&&!replay&&!betPlaced)||paused;$('#spin').textContent=replay?'↓ レバー ON（リプレイ）':'↓ レバー ON';$('#maxbet').disabled=!canBet();$$('[data-stop]').forEach((b,i)=>b.disabled=paused||!spinning||velocities[i]===0||targets[i]!==null);}
function timerUI(){$('#timer').textContent=$('#stage-timer').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(Math.floor(elapsed%60)).padStart(2,'0')}`;$('#progress').style.width=`${Math.min(100,elapsed%limit/limit*100)}%`;$('#limit-label').textContent=`${limit/60}分で自動休憩`;renderWeek(history,active&&!saved?elapsed:0);}
function pause(title='少し、台から離れて。'){launching=false;cue('rest');paused=true;$('#pause-title').textContent=title;$('#pause-summary').textContent=`今回の遊技時間 ${Math.floor(elapsed/60)}分${Math.floor(elapsed%60)}秒。発射とリールは停止しています。`;$('#settings-dialog').close();$('#history-dialog').close();if(!$('#pause').open)$('#pause').showModal();update();}
$('#break').onclick=()=>pause();$('#end').onclick=()=>pause('今日は、ここまで。');$('#pause').addEventListener('cancel',e=>{e.preventDefault();});
$('#resume').onclick=()=>{paused=false;breakAt=elapsed+limit;breakNoticed=false;cue('resume');$('#pause').close();last=performance.now();update();say('発射は手動で再開できます。自分のペースでどうぞ。');};
function persist(){try{localStorage.setItem('reel-room-history',JSON.stringify(history));$('#storage-message').textContent='このブラウザに保存しました。';return true;}catch{$('#storage-message').textContent='ブラウザへの保存ができません。JSONで保存してください。';return false;}}
function finishSession(){if(active&&!saved){history.unshift({date:startedAt,mode:[...sessionModes].map(m=>m==='slot'?'パチスロ':'パチンコ').join('・'),seconds:Math.floor(elapsed),pachinko:{...states.pachinko},slot:{...states.slot},...readReflection()});history=history.slice(0,50);persist();saved=true;}active=false;ended=true;paused=false;launching=false;balls=[];drawQueue=0;drawResult=null;bonus=null;big=null;show=null;spinning=false;if(paying){states.slot.credit+=paying.left;states.slot.win+=paying.left;paying=null;}velocities=[0,0,0];targets=[null,null,null];positions=positions.map(Math.round);$('#pause').close();cue('end');say('記録して終了しました。今日はおつかれさまでした。');update();showHistory();}
$('#finish').onclick=finishSession;
function showHistory(){launching=false;paused=true;update();$('#history-list').replaceChildren();renderWeekSummary(history);if(!history.length){const p=document.createElement('p');p.className='empty';p.textContent='まだ記録はありません。遊技後に「記録して終了」で残せます。';$('#history-list').append(p);}for(const r of history){const div=document.createElement('div');div.className='history-row';const strong=document.createElement('strong');strong.textContent=new Date(r.date).toLocaleString('ja-JP');div.append(strong,document.createTextNode(`${r.mode} · ${Math.floor(r.seconds/60)}分${r.seconds%60}秒`));appendReflection(div,r);$('#history-list').append(div);}$('#history-dialog').showModal();}
$('#history-button').onclick=showHistory;$('#close-history').onclick=()=>$('#history-dialog').close();$('#history-dialog').addEventListener('close',()=>{paused=false;last=performance.now();update();});$('#export').onclick=()=>{const blob=new Blob([JSON.stringify(history,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='reel-room-journal.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};$('#clear-history').onclick=()=>{if(confirm('このブラウザのプレイ記録をすべて削除しますか？')){history=[];persist();$('#history-dialog').close();showHistory();}};
$('#settings').onclick=()=>{launching=false;paused=true;update();$('#settings-dialog').showModal();checkUpdate(true);};$('#settings-dialog').addEventListener('close',()=>{if(!$('#pause').open)paused=false;last=performance.now();update();});$('#limit').onchange=e=>{limit=+e.target.value;breakAt=elapsed+limit;breakNoticed=false;timerUI();};$('#volume').value=Math.round(volume*100);$('#bgm-volume').value=Math.round(bgmVolume*100);$('#volume').oninput=e=>{volume=+e.target.value/100;saveVolume();if(sound)play('pin',volume,{impact:400,nail:randomInt(12)});};$('#bgm-volume').oninput=e=>{bgmVolume=+e.target.value/100;saveVolume();};$('#gentle').onchange=e=>gentle=e.target.checked;$('#leds').onchange=e=>ledSetting=e.target.value;$('#reach-variety').onchange=e=>reachVariety=e.target.value==='variety';
// Version in the settings: checks version.json on start, when the page comes back into view and when the settings open.
const build=readBuild();let latest=null,checkedAt=0,updateArmed=false;{const c=cleanUrl(location.href);if(c)window.history.replaceState(null,'',c);}
async function checkUpdate(force=false){if(!force&&Date.now()-checkedAt<6e5)return;checkedAt=Date.now();$('#version-now').textContent=versionLabel(build);if(force)$('#version-status').textContent='最新版を確認しています…';const l=await fetchLatest();if(l)latest=l;const fresh=isNewer(build,latest);$('#settings').classList.toggle('has-update',fresh);$('#update-app').classList.toggle('ready',fresh);$('#update-app').textContent=fresh?'今すぐ更新':'最新版に更新';
  $('#version-status').textContent=fresh?`新しい版があります（${formatBuiltAt(latest.builtAt)||latest.build} 公開）`:l?(build.build==='dev'?`公開中の版：${versionLabel(l)}`:'最新版です'):'公開中の版を確認できませんでした（オフラインかもしれません）';}
$('#update-app').onclick=async()=>{if(active&&!saved&&elapsed>=60&&!updateArmed){updateArmed=true;$('#version-status').textContent=`今回の遊技時間（${Math.floor(elapsed/60)}分）はまだ記録されていません。残すときは先に「記録して終了」、このまま更新するときはもう一度押してください。`;return;}
  const b=$('#update-app');b.disabled=true;b.textContent='更新中…';$('#version-status').textContent='新しいファイルを読み込んでいます…';const l=await fetchLatest();await refreshFiles(l?.files);location.replace(reloadUrl(location.href,l?.build));};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate();});checkUpdate();
$('#sound').onclick=()=>{sound=!sound;$('#sound').setAttribute('aria-pressed',String(sound));$('#sound span').textContent=`サウンド ${sound?'ON':'OFF'}`;tone('on');};$('#power').oninput=e=>$('#power-value').value=`${e.target.value}%`;
$('#launch').onclick=()=>{if(paused)return;begin();launching=!launching;cue(launching?'launch':'launchStop');update();say(launching?'発射中。もう一度押すと停止します。':'発射を停止しました。');};
function canBet(){return !paused&&!spinning&&!paying&&!betPlaced&&!replay&&states.slot.credit>=3;}
// MAX BET takes 3 virtual medals and lights the bet lamps. The lever bets automatically when nothing is bet yet.
function maxBet(){pressedAt.bet=performance.now();if(!canBet()){if(!spinning&&!betPlaced&&!replay&&states.slot.credit<3)say('メダルが足りません。リセットで1,000枚に戻せます。');return false;}begin();const s=states.slot;s.credit-=3;s.used+=3;betPlaced=true;cue('bet');tone('stop',2);update();say('レバーを叩くとリールが回ります。');return true;}
function lever(){pressedAt.lever=performance.now();if(paused||spinning||paying)return;if(!betPlaced&&!replay&&!maxBet())return;begin();const s=states.slot;betPlaced=false;replay=false;role=big?'bell':drawRole(randomInt(ROLE_RANGE));slotNotice=big?null:notice(role==='big'?'win':role==='watermelon'||role==='cherry'?'chance':'miss');if(slotNotice)slotNotice.at=clock+NOTICE_AT;s.win=0;s.rounds++;winLines=[];spinning=true;spinAge=0;targets=[null,null,null];cue('lever');waitUntil=Math.max(clock,lastStart+GAME_WAIT);if(waitUntil>clock){velocities=[0,0,0];say('ウェイト中です。実機と同じく、1ゲームは4.1秒より短くなりません。');}else startReels();update();}
function startReels(){lastStart=clock;velocities=[24,25,26];tone('spin');say('好きな順で停止ボタンを押してください。');update();}
$('#spin').onclick=lever;$('#maxbet').onclick=maxBet;
$$('[data-stop]').forEach((b,i)=>b.onclick=()=>{pressedAt['stop'+i]=performance.now();if(paused||!spinning||velocities[i]===0||targets[i]!==null)return;const stops=[0,1,2].map(j=>targets[j]!==null?targets[j]%STRIP.length:velocities[j]===0?Math.round(positions[j])%STRIP.length:null);const base=Math.ceil(positions[i]);targets[i]=base+chooseSlip(i,base%STRIP.length,role,stops);cue('stop');tone('stop',i);update();});
$('#reset').onclick=()=>{if(spinning||paying||bonus||big||balls.length||drawQueue||drawResult!==null||launching){say('発射を止め、玉と抽選・リールが止まってからリセットできます。');return;}states[mode].credit=1000;states[mode].win=0;update();say('仮想残高を1,000にリセットしました。');};
$$('[data-mode]').forEach(b=>b.onclick=()=>{if(mode===b.dataset.mode)return;if(spinning||paying||bonus||big||balls.length||drawQueue||drawResult!==null){launching=false;update();say('進行中の玉・抽選・リールが止まってから機種を変更できます。');return;}launching=false;mode=b.dataset.mode;try{localStorage.setItem('reel-room-machine',mode);}catch{}$$('[data-mode]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});const slot=mode==='slot';$('#pachinko-controls').hidden=slot;$('#slot-controls').hidden=true;$('#stage-name').textContent=$('#info-name').textContent=slot?'ASTRAL':'AURORA';$('.stage-top b').textContent=slot?'002':'001';$('.detail-title>span:last-child').textContent=slot?'02':'01';$('#model').textContent=slot?'ASTRAL / ORIGINAL PACHISLOT':'AURORA / ORIGINAL PACHINKO';$('#description').innerHTML=slot?'青と銀の筐体に、3つのリール。<br>回る図柄を、指先で止める。':'金とピンクの光、浮遊城の液晶。<br>釘を跳ねる玉の軌跡を。';$('#credit-label').textContent=slot?'持ちメダル':'持ち玉';$('#unit').textContent=slot?'MEDALS':'BALLS';$('#round-label').textContent=slot?'総ゲーム数':'スタート入賞';$('#instructions').innerHTML=slot?'<li><b>01</b> 右の銀のドーム（MAX BET）をタップして3枚を投入（レバーだけでも自動で投入）</li><li><b>02</b> 左の黒いノブ（レバー）をタップしてリールを回す</li><li><b>03</b> 青い3つの停止ボタンで止める。横3本・斜め2本の5ラインすべてが有効</li><li><b>04</b> キーボード：Space レバー、B MAX BET、1・2・3 停止</li>':'<li><b>01</b> スライダーで発射強度を調整</li><li><b>02</b> 発射ボタンで開始・停止</li><li><b>03</b> 中央下のSTART入賞で抽選</li><li><b>04</b> 大当たりは右打ちで右下の大入賞口へ</li>';$('#rules').textContent=slot?'MAX BETで3枚を投入し（未投入ならレバーで自動投入）、レバーONの時点で役を抽選し（独自の表：BIG 1/409.6、スイカ 1/81.9、チェリー 1/41、ベル 1/9.1、リプレイ 1/7.3）、停止ボタンから最大4コマすべらせて成立した役を5ライン（横3本・斜め2本、MAX BETですべて有効）のどれかに引き込みます。成立していない役は揃いません。レバーONのときに「予告」が出ることがあり（群れ・セリフ・カットイン・ステージチェンジ、色は青・緑・赤・金）、出たときのBIGの割合は予告全体で約1.5%、赤約8%・金約68%です（スイカ・チェリーのときにも出やすい）。予告は役の抽選のあとに選ぶだけで、確率は変わりません。設定の「リーチ・予告演出」を「いつも同じ」にすると出ません。ベルとリプレイはどこで押しても揃い、7・スイカ・左チェリーは押す位置によって取りこぼします（次ゲームへの持ち越しなし）。配当：7揃いでBIGボーナス（毎ゲーム15枚のベルが揃い、合計150枚で終了）、スイカ10枚、ベル8枚、左チェリー2枚（ラインごと。上段・下段の角チェリーは2ライン分で4枚）、リプレイは次ゲームのメダル不要。BARは配当なし。実機の抽選・リール制御とは異なるオリジナル仕様です。':'START入賞ごとに1/99で当たり。当たると右下の大入賞口が開き、右打ち（発射強度を強く）で入れた玉1つにつき8玉を払い出します（1ラウンド10個まで・30秒で閉じる、4ラウンドで最大320玉）。大当たり中は保留の抽選を待ちます。入賞時に3玉。抽選は最大4つまで保留し、液晶左下に表示します。保留が多いと外れの変動は短くなります。リーチは当たりと一部の外れで出ます。リーチは途中で「流星リーチ」「天空城リーチ」に発展することがあり、リーチの種類と、文字・ボタンの色（青・緑・赤）で当たりやすさが変わります（当たる割合はノーマル約2%・流星約21%・天空城約63%、青約4%・緑約13%・赤約46%）。演出は抽選結果が決まったあとに選ぶだけで、当たる確率（1/99）は変わりません。変動の最初に「予告」が出ることがあり（蝶・鳥・花吹雪・星の群れ、セリフ、カットイン、ステージチェンジ。色は青・緑・赤・金）、出たときの当たる割合は予告全体で約6%、青約2%・緑約6%・赤約24%・金約83%、ステージチェンジ約38%です。予告も抽選のあとに選ぶだけです。設定の「リーチ・予告演出」で「いつも同じ」にすると、リーチはノーマル・ピンクだけになり予告も出ません。保留の表示や外れ方で当たりを予告することはありません。実機の釘配置・確率・性能とは異なるオリジナル仕様です。';say(slot?'レバーを押して、リールを回してみましょう。':'発射強度を調整して、玉を打ち出してみましょう。');update();});
// 前回遊んだ台で開く。
try{if(localStorage.getItem('reel-room-machine')==='slot')$('[data-mode="slot"]').click();}catch{}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused)pause('画面を離れたので、一時停止しました。');last=performance.now();});
window.addEventListener('keydown',e=>{if(e.target.matches('input,select,button')||paused||e.repeat)return;if(e.code==='Space'){e.preventDefault();if(mode==='slot')$('#spin').click();else $('#launch').click();}if(mode==='slot'&&['1','2','3'].includes(e.key))$$('[data-stop]')[+e.key-1].click();if(mode==='slot'&&e.key.toLowerCase()==='b')maxBet();if(mode==='pachinko'&&e.key==='Enter'&&pushReady()){e.preventDefault();pressPush();}});
// Nails come from the machine parts, so a nail switched off there (parts.aurora.set('nail-012',{visible:false})) stops deflecting balls.
let pins=[],pinsAt=-1;function boardPins(){const P=parts.aurora;if(pinsAt!==P.version){pins=P.nails();pinsAt=P.version;}return pins;}
// Index of the nail a ball has just hit, so each nail keeps its own tuning.
function nearestPin(b){let best=0,d=Infinity;boardPins().forEach((p,i)=>{const e=(p.x-b.x)**2+(p.y-b.y)**2;if(e<d){d=e;best=i;}});return best;}
// 予告 (notice-fx.js): picked with the draw (pachinko) or the role (slot), shown NOTICE_AT s after the start. When it begins it sounds
// and the character looks surprised; the ステージチェンジ switches the background behind its wipe (gold to a bonus scene).
const NOTICE_AT=.2;let slotNotice=null;
// ?notice=<kind>-<colour> (e.g. ?notice=cutin-red) shows that notice on every draw, to check how it looks.
function notice(outcome){const [kind,color]=(query.get('notice')??'').split('-');return kind?{kind,color:color||'blue'}:pickNotice(outcome,{variety:reachVariety});}
// While a セリフ予告 is up, the character's own line waits so the two do not overlap.
function wordsOn(n,age){return n?.kind==='words'&&noticeAlpha(age,reduced)>0;}
function noticeTick(n,age,machine){if(!n||age<0)return;if(!n.shown){n.shown=true;tone('notice',n.color);if(mode===(machine==='slot'?'slot':'pachinko'))cue('notice');}
if(n.kind==='stage'&&!n.staged&&age>=(reduced?0:STAGE_AT)){n.staged=true;stageChange(backdrops[machine],bgT,n.color==='gold'?'bonus':'reach');}}
function step(dt){if(paused||document.hidden)return;clock+=dt;if(slotNotice)noticeTick(slotNotice,clock-slotNotice.at,'slot');if(active){elapsed+=dt;if(elapsed>=breakAt){pause('休憩の時間になりました。');return;}if(!breakNoticed&&breakAt-elapsed<=20){breakNoticed=true;cue('soonBreak');}}if(mode==='pachinko'){launchClock+=dt;if(launching&&launchClock>.6){launchClock=0;if(states.pachinko.credit>0){states.pachinko.credit--;states.pachinko.used++;const power=+$('#power').value/100;const ball=launchBall(power,(randomInt(201)-100)/100);balls.push(ball);tone('launch',{roll:(ball.rail.end-ball.rail.angle)*(BOARD.r-7)/ball.rail.speed});update();}else{launching=false;cue('empty');update();say('持ち玉がなくなりました。玉が止まったらリセットできます。');}}for(let i=balls.length-1;i>=0;i--){const b=balls[i];b.age+=dt;if(b.rail){advanceRail(b,dt);continue;}const hit=advanceBall(b,dt,boardPins());if(hit)tone('pin',{impact:hit,nail:nearestPin(b),x:b.x});const vx=b.vx,vy=b.vy;collideDisplay(b);const knock=Math.hypot(b.vx-vx,b.vy-vy);if(knock>40)tone('frame',{impact:knock,x:b.x});if(bonus?.open&&inAttacker(b)){balls.splice(i,1);states.pachinko.credit+=BONUS.prize;bonus.count++;bonus.paid+=BONUS.prize;update();tone('start');tone('payout',BONUS.prize);continue;}if(inStart(b)){balls.splice(i,1);states.pachinko.credit+=3;drawQueue=addHold(drawQueue);cue('enter');update();tone('start');tone('payout',3);continue;}if(b.y>705||b.age>13){if(b.y>705)tone('drain',{x:b.x});balls.splice(i,1);}}if(bonus)stepBonus();if(!bonus&&drawResult===null&&drawQueue>0){drawQueue--;drawResult=resolvePachinko(randomInt(99));spinPlan=planSpin(drawResult>0,drawQueue,{gentle:gentle||reduced,variety:reachVariety});spinPlan.notice=notice(drawResult>0?'win':spinPlan.reach?'chance':'miss');drawTime=0;states.pachinko.rounds++;cue('spin');update();}if(drawResult!==null){drawTime+=dt;tone('lcd');noticeTick(spinPlan.notice,drawTime-NOTICE_AT,'pachinko');if(spinPlan.reach&&!spinPlan.announced&&drawTime>=spinPlan.stops[2]){spinPlan.announced=true;cue('reach');tone('lcdStop');}if(spinPlan.reach){const st=reachStage(spinPlan,drawTime);if(st&&st.kind!=='normal'&&spinPlan.shown!==st.kind){spinPlan.shown=st.kind;cue(st.kind);tone('develop',st.kind);}}if(spinPlan.push&&!spinPlan.asked&&drawTime>=spinPlan.push)askPush();if(pushReady()&&drawTime>=spinPlan.push+PUSH_WAIT)pressPush();if(drawTime>=spinPlan.duration){const win=drawResult;screen=spinPlan.numbers;resultText='A U R O R A';resultUntil=clock+3;drawResult=null;if(win){bonus={round:1,count:0,paid:0,open:true,until:clock+BONUS.open};states.pachinko.win=0;say('大当たり。発射強度を強くして（右打ち）、右下の大入賞口に入れてください。');cue('bonus');}else say('抽選が終了しました。');if(!win)cue('miss',spinPlan.reach?{chance:1}:undefined);tone('lcdStop');if(win){show=startShow('jackpot',clock);fanfareTone('aurora');}update();}}}if(paying&&clock>=paying.next){const s=states.slot;s.win++;s.credit++;paying.left--;paying.next=clock+1/12;if(!paying.left)paying=null;update();}
if(spinning&&waitUntil>clock){}else if(spinning&&velocities.every(v=>v===0)&&targets.every(t=>t===null)&&spinAge===0){startReels();}else if(spinning){spinAge+=dt;tone('reel');let moving=false;for(let i=0;i<3;i++){if(velocities[i]===0)continue;if(targets[i]!==null){positions[i]+=velocities[i]*dt;if(positions[i]>=targets[i]){positions[i]=targets[i]%STRIP.length;velocities[i]=0;targets[i]=null;update();}}else positions[i]=(positions[i]+velocities[i]*dt)%STRIP.length;if(velocities[i])moving=true;}if(!moving){spinning=false;const {wins,hit,pay}=settle(positions.map(p=>Math.round(p)%STRIP.length)),win=hit==='big'?0:big&&hit==='bell'?BIG.pay:pay;winLines=wins.filter(w=>w.role===hit).map(w=>w.line);replay=hit==='replay';let note='';if(hit==='big'){big={paid:0};note='BIGボーナス開始。ベルが毎ゲーム揃い、合計150枚を払い出すと終わります。';cue('big');show=startShow('big',clock);fanfareTone('astral');}else if(big){big.paid+=win;if(big.paid>=BIG.total){note=`BIGボーナス終了。合計${big.paid}枚でした。いつでも休憩できます。`;cue('bigEnd',{count:big.paid});show=startShow('bigEnd',clock,{count:big.paid});big=null;}else{note=`BIGボーナス中（${big.paid} / ${BIG.total}枚）。`;cue('bell',{count:win});}}else cue(hit==='none'?'slotMiss':hit,{count:win});states.slot.total+=win;if(reduced||!win){states.slot.win=win;states.slot.credit+=win;}else{states.slot.win=0;paying={left:win,next:clock};}resultUntil=clock+3;say(note?(win?`${win}枚。`:'')+note:win?`${win}枚の仮想払出です。`:replay?'リプレイです。次のゲームはメダルを使いません。':'今回は揃いませんでした。ここで休憩してもOK。');if(win)tone('medal',win);update();}}}
// Canvas rendering: the original ASTRAL / AURORA cabinet artwork (assets/) has transparent LCD and reel windows,
// so the screen and reels are drawn first and the cabinet is laid over them. Pins and balls sit on top as the play surface.
function rr(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function grad(x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach(([p,c])=>g.addColorStop(p,c));return g;}
function text(t,x,y,size,color,font='Arial',align='center'){ctx.textAlign=align;ctx.font=`${size}px ${font}`;ctx.fillStyle=color;ctx.fillText(t,x,y);}
function circle(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
const art={},ledLayers={};for(const [key,src] of [['aurora','assets/aurora.webp'],['astral','assets/astral.webp'],['lcd','assets/lcd-illustration.jpg']]){const img=new Image();img.onload=()=>{art[key]=img;if(LED_PARTS[key])ledLayers[key]=buildLeds(img,LED_PARTS[key]);if(key==='aurora')buildArtBlur(img);};img.src=src;}
// Machine parts (cabinet-parts.js): every element of each machine with its state. The cabinet LEDs follow the scene of the moment
// (idle / draw / reach / push / bonus / win …, see cabinet-leds.js) unless the room setting keeps them all on or all off.
// Page options: ?parts draws the part map, ?leds=<scene> keeps the LEDs on one scene (e.g. ?leds=reach) to check a lamp program.
const query=new URLSearchParams(location.search),parts={aurora:createParts('aurora'),astral:createParts('astral')},ledScene={},showParts=query.has('parts'),ledForce=query.get('leds');let ledSetting='auto',reachVariety=true;
function cabinetLeds(key,scene){const leds=parts[key].leds,name=ledSetting==='on'?'lit':ledSetting==='off'?'dark':ledForce||scene,id=`${name}/${gentle}`;if(ledScene[key]!==id){applyScene(leds,name,{gentle,reduced});ledScene[key]=id;}drawLeds(ctx,ledLayers[key],leds.frame(clock),{gain:gentle?.3:.5});}
function partMap(){if(showParts)drawPartMap(ctx,parts[mode==='slot'?'astral':'aurora']);}
function cabinetArt(key){const img=art[key];if(img){ctx.drawImage(img,0,0,720,960);return;}rr(20,10,680,940,40,'#1b1d2a','#555');text('LOADING',360,480,14,'#99a');}
// Pre-rendered sprites (offscreen canvases at device resolution) keep per-frame drawing cheap.
function sprite(w,h,paint){const c=document.createElement('canvas');c.width=Math.ceil(w*dpr);c.height=Math.ceil(h*dpr);const g=c.getContext('2d');g.scale(dpr,dpr);paint(g);return c;}
function stops(g,list){list.forEach(([p,c])=>g.addColorStop(p,c));return g;}
// Pachinko ball: a small chrome mirror sphere (radius BOARD.ball). Like a real steel ball it shows almost no colour of its own: the top half
// reflects the bright hall lights, a dark band marks the horizon, the centre mirrors the dim room in front of the glass and the rim picks up
// the colours of the board around it (drawn per ball from a blurred copy of the cabinet art, see drawBall). Sharp specular point, soft contact shadow.
const BR=BOARD.ball,BS=16,BC=8;
const BALL_BACK=sprite(BS,BS,g=>{const x=BC,y=BC,r=BR;g.fillStyle=stops(g.createRadialGradient(x+1.1,y+1.9,0,x+1.1,y+1.9,r+1.6),[[0,'#000a'],[.55,'#0005'],[1,'#0000']]);g.fillRect(0,0,BS,BS);
g.fillStyle=stops(g.createRadialGradient(x-.8,y-.8,0,x,y,r),[[0,'#a9b1ba'],[.7,'#6b737d'],[1,'#30363d']]);g.beginPath();g.arc(x,y,r,0,7);g.fill();});
const BALL_FRONT=sprite(BS,BS,g=>{const x=BC,y=BC,r=BR;g.save();g.beginPath();g.arc(x,y,r,0,7);g.clip();
g.fillStyle=stops(g.createRadialGradient(x-.5,y-.3,0,x,y,r),[[0,'#b9c1c8f0'],[.45,'#8d96a0b0'],[.75,'#4d555f30'],[1,'#0000']]);g.fillRect(0,0,BS,BS);
g.fillStyle=stops(g.createLinearGradient(0,y-r,0,y+r),[[0,'#ffffffee'],[.3,'#f1f5f8a0'],[.46,'#dfe6ec30'],[.5,'#1a2027a0'],[.6,'#1a202740'],[.7,'#1a202700'],[1,'#0000']]);g.fillRect(0,0,BS,BS);
g.fillStyle=stops(g.createRadialGradient(x+.6,y+r*.85,0,x+.6,y+r*.85,r*.8),[[0,'#ffe9d0a0'],[1,'#ffe9d000']]);g.fillRect(0,0,BS,BS);
g.strokeStyle='#ffffff70';g.lineWidth=.45;g.beginPath();g.arc(x,y,r-.45,Math.PI*.1,Math.PI*.75);g.stroke();g.restore();
g.fillStyle=stops(g.createRadialGradient(x-1.5,y-1.8,0,x-1.5,y-1.8,2.3),[[0,'#ffffff'],[.35,'#ffffffd0'],[1,'#ffffff00']]);g.beginPath();g.arc(x-1.5,y-1.8,2.3,0,7);g.fill();
g.fillStyle='#ffffff';g.beginPath();g.ellipse(x-1.5,y-1.9,.85,.6,-.5,0,7);g.fill();
g.fillStyle='#ffffffb0';g.beginPath();g.arc(x+1.7,y+1.6,.5,0,7);g.fill();
g.strokeStyle='#0a0e13b0';g.lineWidth=.5;g.beginPath();g.arc(x,y,r,0,7);g.stroke();});
// Blurred quarter-size copy of the cabinet art: the board colours that each ball mirrors around its rim.
let artBlur=null;function buildArtBlur(img){try{const c=document.createElement('canvas');c.width=180;c.height=240;const g=c.getContext('2d');g.filter='blur(1.5px) saturate(1.4)';g.drawImage(img,0,0,180,240);artBlur=c;}catch{artBlur=null;}}
function drawBall(b){ctx.drawImage(BALL_BACK,b.x-BC,b.y-BC,BS,BS);if(artBlur){ctx.save();ctx.beginPath();ctx.arc(b.x,b.y,BR,0,7);ctx.clip();ctx.globalAlpha=.85;ctx.drawImage(artBlur,(b.x-26)/4,(b.y-26)/4,13,13,b.x-BR,b.y-BR,BR*2,BR*2);ctx.restore();}ctx.drawImage(BALL_FRONT,b.x-BC,b.y-BC,BS,BS);}
// The front panel (ball tray dome and the lower trim) sits physically in front of the glass, so balls are clipped to the glass area and never drawn over it.
function glassClip(){ctx.beginPath();ctx.arc(BOARD.cx,BOARD.cy,BOARD.r,0,7);ctx.clip();ctx.beginPath();ctx.rect(0,0,720,688);ctx.clip();buttonCut();}
// Cuts the chance button dome out of the clip: it sits in front of the glass, so pins, balls and reflections go behind it.
function buttonCut(){const {x,y,rx,ry}=BOARD.button;ctx.beginPath();ctx.rect(0,0,720,960);ctx.ellipse(x,y,rx+2,ry+2,0,0,Math.PI*2);ctx.clip('evenodd');}
// LCD numerals: chunky italic figures with an extruded edge, dark outline, gold rim and glossy fill, one sprite per digit.
const DIGIT_W=96,DIGIT_H=104,DIGITS=[1,2,3,4,5,6,7,8,9].map(n=>sprite(DIGIT_W,DIGIT_H,g=>{const x=DIGIT_W/2,y=86;g.font='italic 900 82px "Arial Black","Helvetica Neue",Arial,sans-serif';g.textAlign='center';g.lineJoin='round';
for(let d=6;d>0;d--){g.fillStyle=d>1?'#3a0b2c':'#5a1442';g.fillText(n,x+d*.6,y+d);}
g.lineWidth=11;g.strokeStyle='#14040f';g.strokeText(n,x,y);g.lineWidth=5;g.strokeStyle=stops(g.createLinearGradient(0,18,0,90),[[0,'#fff6d6'],[.45,'#e6b85a'],[.55,'#9c6a1e'],[1,'#ffe4a0']]);g.strokeText(n,x,y);
g.fillStyle=stops(g.createLinearGradient(0,18,0,90),[[0,'#ffffff'],[.4,'#ffd3ec'],[.55,'#ff6fb8'],[1,'#b81f72']]);g.fillText(n,x,y);
g.save();g.globalCompositeOperation='source-atop';g.fillStyle=stops(g.createLinearGradient(0,18,0,60),[[0,'#ffffffcc'],[.6,'#ffffff33'],[.61,'#ffffff00']]);g.fillRect(0,0,DIGIT_W,58);g.restore();}));
const COL_H=124,CELL=96,colCanvas=document.createElement('canvas');colCanvas.width=DIGIT_W*dpr;colCanvas.height=COL_H*dpr;const colCtx=colCanvas.getContext('2d');
// Scroll position (in cells) of one LCD column at time t of the current draw. Columns accelerate from the previous number, cruise
// (the middle one runs at half speed during a reach), decelerate evenly and land on the drawn number. The cruise speed is nudged per column
// so the landing is exact; nothing here depends on whether the draw won, and there is no slow crawl past a matching number.
function columnMotion(i,t){const s=spinPlan,base=reduced?4:gentle?10:14,Ta=reduced?0:.25,D=reduced?0:gentle?.6:.45,stop=s.stops[i],tr=s.reach&&i===1?s.stops[2]:Infinity,t0=stop-D;
const run=x=>{const a=x<Ta?x*x/(2*Ta):Ta/2+(Math.min(x,tr)-Ta);return x>tr?a+.5*(x-tr):a;},rate=x=>(x<Ta?x/Ta:1)*(x>tr?.5:1),f0=rate(t0),K=run(t0)+f0*D/2;
const prev=screen[i]-1,need=((s.numbers[i]-1-prev)%9+9)%9,v=(need+9*Math.max(1,Math.round((base*K-need)/9)))/K;
let u,vel;if(t>=stop){u=K;vel=0;}else if(t>=t0){const q=t-t0;u=run(t0)+f0*(q-q*q/(2*D));vel=f0*(1-q/D);}else{u=run(t);vel=rate(t);}
return {p:prev+v*u,v:v*vel,since:t-stop};}
function drawColumn(cx,cy,p,v,since,scale=1){const g=colCtx,blur=reduced?0:Math.min(CELL*.85,v*CELL/60),n=blur>2?6:1,settle=reduced||since<0?0:(gentle?.05:.09)*Math.exp(-9*since)*Math.sin(20*since);
const pos=reduced?Math.round(p):p+settle,k=Math.floor(pos),f=pos-k;g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,DIGIT_W,COL_H);
for(let j=0;j<n;j++){g.globalAlpha=n>1?1.7/n:1;const o=n>1?-blur/2+blur*j/(n-1):0;for(const d of [-1,0,1]){const y=COL_H/2-DIGIT_H/2+(f-d)*CELL+o;if(y>-DIGIT_H&&y<COL_H)g.drawImage(DIGITS[((k+d)%9+9)%9],0,y,DIGIT_W,DIGIT_H);}}
g.globalAlpha=1;g.globalCompositeOperation='destination-in';g.fillStyle=stops(g.createLinearGradient(0,0,0,COL_H),[[0,'#0000'],[.2,'#000'],[.8,'#000'],[1,'#0000']]);g.fillRect(0,0,DIGIT_W,COL_H);g.globalCompositeOperation='source-over';
const pop=reduced||since<0||since>.25?1:1+.07*(1-since/.25);ctx.save();ctx.translate(cx,cy);ctx.scale(pop*scale,pop*scale);ctx.drawImage(colCanvas,-DIGIT_W/2,-COL_H/2,DIGIT_W,COL_H);ctx.restore();}
// LCD background (lcd-scenes.js): hundreds of scenes (45 drawn stages of the sky kingdom × time of day, with a weather and a sky event), one deck
// per machine. They cycle while idle, change at the start of a draw, turn dramatic for a reach and festive for a bonus, and everything
// speeds up while a draw is spinning, the same for every draw. ?scene=<number> keeps one scene on screen to check it.
const backdrops={pachinko:createBackdrop('aurora'),slot:createBackdrop('astral')},scenePin=+query.get('scene')||null;
let bgT=0,bgClock=0,bgRate=1;
function lcdArt(x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
const target=big||bonus?2.4:drawResult===null?1:reachOn()?2.6:2.1;bgRate+=(target-bgRate)*Math.min(1,(clock-bgClock)*2);bgT+=Math.max(0,Math.min(.1,clock-bgClock))*bgRate*(gentle?.8:1);bgClock=clock;
const slot=mode==='slot',phase=slot?(big?'bonus':spinning?'draw':'idle'):bonus?'bonus':reachOn()?'reach':drawResult!==null?'draw':'idle',b=stepBackdrop(backdrops[mode],bgT,{phase,draw:slot?lastStart:spinPlan,timed:!reduced,pin:scenePin});
drawBackdrop(ctx,art.lcd,b,{x,y,w,h,t:bgT,level:{idle:.8,draw:1,reach:1.3,bonus:1.4}[phase],gentle,reduced,dpr});ctx.restore();}
function digits(label,value,x,y){text(label,x,y,9,'#c9d6f2');ctx.save();ctx.shadowColor='#ff9c55';ctx.shadowBlur=gentle?2:8;text(String(value).padStart(4,'0'),x,y+22,21,'#ffc27d','monospace');ctx.restore();}
function sheen(x,y,w,h){ctx.fillStyle=grad(x,y,x+w,y+h,[[0,'#ffffff1c'],[.32,'#ffffff05'],[.33,'#ffffff14'],[.45,'#ffffff00'],[1,'#ffffff00']]);ctx.fillRect(x,y,w,h);}
function renderPachinko(){const {x1,x2,y1,y2}=BOARD.display,box=[x1-8,y1-8,x2-x1+16,y2-y1+16],sh=show?.kind.startsWith('jackpot')?show:null;lcdArt(...box);if(bonus)drawStage(ctx,box,clock,{machine:'aurora',gentle,reduced});
ctx.fillStyle=grad(0,y1+90,0,y2,[[0,'#06081200'],[.5,'#060812aa'],[1,'#060812dd']]);ctx.fillRect(x1,y1+90,x2-x1,y2-y1-90);
const drawing=drawResult!==null,reach=reachOn(),stage=reach?reachStage(spinPlan,drawTime):null,navi=navis.pachinko,fx={x:x1,y:y1,w:x2-x1,h:y2-y1,t:drawTime,gentle,reduced};naviTick(navi,drawing,!!bonus);
reachBackdrop(ctx,stage,fx);
drawNavi(ctx,navi,clock,{x:236,y:360,scale:.92,gentle,reduced});
if(reach&&stage.kind!=='spsp'&&!gentle&&!reduced){ctx.save();ctx.shadowColor=REACH_COLORS[spinPlan.color].glow;ctx.shadowBlur=10+Math.sin(clock*2)*4;rr(x1+4,y1+4,x2-x1-8,y2-y1-8,14,null,'#ffc2e688');ctx.restore();}
const lay=reachLayout(spinPlan,drawTime,drawing);[0,1,2].forEach(i=>{const {x:cx,y:cy,scale}=columnPlace(i,lay);if(!drawing){drawColumn(cx,cy,screen[i]-1,0,spinPlan?clock-(resultUntil-3)+spinPlan.duration-spinPlan.stops[i]:9);return;}const m=i===1&&spinPlan.asked?pushMotion(drawTime):columnMotion(i,drawTime);drawColumn(cx,cy,m.p,m.v,m.since,scale);});
if(drawing)drawNotice(ctx,spinPlan.notice,drawTime-NOTICE_AT,{...fx,gentle,reduced});
drawWinCells(ctx,sh,clock,[0,1,2].map(i=>[216+i*98,362,92,96]),{machine:'aurora',gentle,reduced});
reachBanner(ctx,stage,spinPlan?.color,fx);
if(bonus){if(!showOn(sh,clock)){goldText(ctx,`ROUND ${bonus.round} / ${BONUS.rounds}`,360,464,19,clock,{pal:PALETTES.aurora,glow:gentle||reduced?.3:.7});text(bonus.open?`COUNT ${bonus.count} / ${BONUS.count}`:'NEXT ROUND',360,490,11,'#f6e7f2');}rr(x2-108,y2-48,98,30,8,'#2a0d24d0','#ffb6dc');text('右打ち ▶',x2-59,y2-27,17,'#ffffff','bold sans-serif');}
else if(launching&&+$('#power').value>=70){rr(x2-108,y2-48,98,30,8,'#2a0d24d0','#ffb6dc');text('◀ 左打ち',x2-59,y2-27,17,'#ffffff','bold sans-serif');}
const asking=pushReady(),label=reach&&reachLabel(stage,spinPlan.color);if(asking)pushPrompt();else if(!bonus) text(reach?label.text:drawing?'抽 選 中':clock<resultUntil?resultText:'A U R O R A',360,482,reach?16:12,reach?label.color:'#f6e7f2',reach?'bold Arial':'Arial');
drawShow(ctx,sh,clock,box,{machine:'aurora',at:[360,404],delay:.5,gentle,reduced,lines:sh?.kind==='jackpot'?[{text:'大当たり',size:66,font:JP},{text:'JACKPOT',size:22,dy:48}]:[{text:'大当たり終了',size:30,dy:-34,font:JP},{text:`${sh?.count??0}玉`,size:50,dy:16,font:JP}]});
const flash=clock-(pressedAt.push??-9);if(flash<.35&&!reduced){ctx.fillStyle=`rgba(255,240,250,${(gentle?.25:.6)*(1-flash/.35)})`;ctx.fillRect(x1,y1,x2-x1,y2-y1);}
const P=parts.aurora;P.find('hold').forEach((h,i)=>{h.lit=i<drawQueue;if(h.visible)circle(...h.shape.circle,h.lit?'#fff2fa':'#2a1630','#d78fbf');});
if(!wordsOn(spinPlan?.notice,drawTime-NOTICE_AT))drawBubble(ctx,navi,clock,{box:[284,272,236],size:14,reduced});
cabinetArt('aurora');cabinetLeds('aurora',showScene(sh,clock)??(asking?'push':bonus?'bonus':states.pachinko.win>0&&clock<resultUntil?'win':reach?(stage.kind==='normal'?'reach':`reach-${stage.kind}`):drawing?'draw':'idle'));buttonGlow(asking,flash);
ctx.save();buttonCut();ctx.beginPath();ctx.arc(BOARD.cx,BOARD.cy,BOARD.r,0,7);ctx.rect(x2+8,y1-8,-(x2-x1+16),y2-y1+16);ctx.fillStyle='#0a061033';ctx.fill('evenodd');ctx.restore();
ctx.save();ctx.lineCap='round';for(const {shape:{line:[gx1,gy1,gx2,gy2]}} of P.find('rail').filter(g=>g.visible)){ctx.shadowColor='#b9e2ff';ctx.shadowBlur=gentle?3:8;ctx.lineWidth=8;ctx.strokeStyle='#d8ecffa0';ctx.beginPath();ctx.moveTo(gx1,gy1);ctx.lineTo(gx2,gy2);ctx.stroke();ctx.shadowBlur=0;ctx.lineWidth=2;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.moveTo(gx1,gy1-2);ctx.lineTo(gx2,gy2-2);ctx.stroke();}ctx.restore();
if(P.shown('start')){const [sx,sy,sw,sh]=P.get('start').shape.rect;ctx.save();ctx.shadowColor='#ff74c4';ctx.shadowBlur=gentle?2:10;rr(sx,sy,sw,sh,5,grad(sx,sy,sx+sw,sy+sh,[[0,'#f7eccb'],[.5,'#b88d3c'],[1,'#f2d891']]),'#5b3b17');ctx.restore();rr(sx+7,sy+3,sw-14,sh-8,3,'#1a0b17');text('START',sx+sw/2,sy+32,9,'#fff0f6');}
// Attacker (大入賞口) on the right of the board: a gold door that tilts open during the jackpot rounds.
{const at=P.get('attacker');at.open=!!bonus?.open;const [ax1,ay1,aw]=at.shape.rect,ax2=ax1+aw,open=at.open,ay=ay1+4;if(at.visible){ctx.save();if(open){ctx.shadowColor='#ff5fae';ctx.shadowBlur=gentle||reduced?3:12;}rr(ax1-6,ay-2,ax2-ax1+10,14,4,open?'#1a0b17':grad(ax1,ay,ax1,ay+12,[[0,'#f7eccb'],[.5,'#b88d3c'],[1,'#f2d891']]),open?'#ff9fd2':'#5b3b17');ctx.restore();if(open){rr(ax1-6,ay-9,ax2-ax1+10,6,3,grad(ax1,ay-9,ax1,ay-3,[[0,'#f7eccb'],[1,'#b88d3c']]),'#5b3b17');}text('ATTACKER',(ax1+ax2)/2-1,ay+24,7,'#fff0f6');}}
ctx.save();glassClip();for(const b of balls)drawBall(b);ctx.restore();
ctx.save();ctx.beginPath();ctx.arc(BOARD.cx,BOARD.cy,BOARD.r,0,7);ctx.clip();buttonCut();sheen(60,130,600,600);ctx.restore();
const power=(+$('#power').value-25)/75;ctx.save();ctx.lineCap='round';ctx.lineWidth=5;ctx.strokeStyle='#0008';ctx.beginPath();ctx.arc(628,826,44,Math.PI*.75,Math.PI*2.25);ctx.stroke();ctx.strokeStyle='#ffd27a';ctx.shadowColor='#ffb347';ctx.shadowBlur=gentle?0:8;ctx.beginPath();ctx.arc(628,826,44,Math.PI*.75,Math.PI*(.75+1.5*power));ctx.stroke();ctx.restore();
partMap();text('FREE PLAY · NO CASH VALUE',360,944,9,'#b9b2c8');}
function renderSlot(){const s=states.slot,now=performance.now(),stopReady=[0,1,2].map(i=>spinning&&velocities[i]!==0&&targets[i]===null);
const leverAge=(now-(pressedAt.lever??-1e9))/1000,leverPull=held==='lever'?1:leverAge<.32?Math.sin(Math.min(1,leverAge/.32)*Math.PI):0;
const box=[156,102,394,196],sh=show?.kind.startsWith('big')?show:null,on=showOn(sh,clock);lcdArt(...box);if(big)drawStage(ctx,box,clock,{machine:'astral',gentle,reduced});const navi=navis.slot;naviTick(navi,spinning,!!big);
drawNavi(ctx,navi,clock,{x:226,y:290,scale:1.6,gentle,reduced});
if(slotNotice)drawNotice(ctx,slotNotice,clock-slotNotice.at,{x:box[0],y:box[1],w:box[2],h:box[3],gentle,reduced});
if(s.win>0&&clock<resultUntil&&!big&&!on){ctx.save();ctx.shadowColor='#5fb6ff';ctx.shadowBlur=gentle?4:16;ctx.lineWidth=5;ctx.strokeStyle='#0d1d45';ctx.font='bold 34px Georgia';ctx.textAlign='center';ctx.strokeText(`${s.win} MEDALS`,420,262);text(`${s.win} MEDALS`,420,262,34,'#eef6ff','bold Georgia');ctx.restore();}
else if(replay)text('REPLAY',420,282,16,'#d8ecff','bold Georgia');
// The BIG panel comes in as the opening show fades out.
if(big)drawBonusPanel(ctx,[366,222,172,66],clock,{machine:'astral',title:'BIG BONUS',count:`${big.paid} / ${BIG.total} 枚`,progress:big.paid/BIG.total,alpha:on&&sh.kind==='big'?Math.max(0,Math.min(1,(clock-sh.at-SHOWS.big.len+.2)/.4)):1,gentle:gentle||reduced});
drawShow(ctx,sh,clock,box,{machine:'astral',at:[424,226],gentle,reduced,symbols:sh?.kind==='big'?sevens:null,lines:sh?.kind==='big'?[{text:'BIG',size:52,dy:6},{text:'BONUS',size:25,dy:44}]:[{text:'BIG BONUS 終了',size:24,dy:-30,font:JP},{text:`${sh?.count??0}枚`,size:52,dy:20,font:JP}]});
// While the show is on, the character's line moves to the top row of the LCD, clear of the title.
if(!wordsOn(slotNotice,clock-slotNotice?.at))drawBubble(ctx,navi,clock,{box:on?[184,124,360]:[296,142,262],size:15,reduced});
cabinetArt('astral');cabinetLeds('astral',showScene(sh,clock)??(big?'big':s.win>0&&clock<resultUntil?'win':replay?'replay':spinning?'spin':'idle'));
const P=parts.astral,bet=spinning||betPlaced||replay?3:0,canLever=!paused&&!spinning&&!paying&&(betPlaced||replay||s.credit>=3);[1,2,3].forEach(n=>P.set(`bet${n}`,{lit:bet>=n}));P.set('start',{lit:canLever});P.set('replay',{lit:replay});P.set('wait',{lit:spinning&&waitUntil>clock});
drawSlot(ctx,{gentle:gentle||reduced,cabinet:art.astral,lit:P.lit,wait:spinning&&waitUntil>clock,positions,velocities,stopReady,credit:s.credit,win:s.win,bet,replay,canBet:canBet(),canLever,showResult:clock<resultUntil,lines:winLines,resultLeft:resultUntil-clock,leverPull,pressed:name=>held===name||now-(pressedAt[name]??-1e9)<140});
// The 7s on the winning line glow while the opening show runs.
drawWinCells(ctx,sh,clock,LINES[winLines[0]??0].map((row,i)=>{const [x,y]=cellCenter(i,row),w=LAYOUT.reels[i][1];return [x-w/2+2,y-27,w-4,54];}),{machine:'astral',gentle,reduced});
partMap();text('FREE PLAY · NO CASH VALUE',360,944,9,'#b6c2dc');}
// Advances the character's timers and plays its voice blips while a line is being typed out. party: a bonus is running (it dances).
function naviTick(n,busy,party){if(tick(n,clock,{busy,party,reduced})>0)tone('voice',KINDS[n.kind].pitch);}
// Win show pieces: Japanese lettering, and the three 7s of the ASTRAL show popping in one after another above the title.
const JP='900 {s}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif JP","Noto Serif CJK JP",serif';
function sevens(c,age){for(let i=0;i<3;i++){const p=reduced?1:Math.max(0,Math.min(1,(age-.15-i*.14)/.18));if(p>0){c.save();c.globalAlpha*=p;symbol(c,'seven',346+i*78,176,.8*(1+.5*(1-p)));c.restore();}}}
function render(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,720,960);ctx.save();mode==='pachinko'?renderPachinko():renderSlot();ctx.restore();}
// Jackpot round play: a round closes after BONUS.count balls or BONUS.open seconds; after the last round the payout is shown.
function stepBonus(){if(bonus.open&&(bonus.count>=BONUS.count||clock>=bonus.until)){bonus.open=false;bonus.until=clock+BONUS.gap;tone('lcdStop');if(bonus.round>=BONUS.rounds){const paid=bonus.paid,s=states.pachinko;s.win=paid;s.total+=paid;bonus=null;resultText=`${paid} BALLS`;resultUntil=clock+3;show=startShow('jackpotEnd',clock,{count:paid});say(`大当たり終了。${paid}玉の仮想払出でした。発射強度を戻すと、また中央のSTARTをねらえます。いつでも休憩できます。`);cue('win',{count:paid});update();}}
else if(!bonus.open&&clock>=bonus.until){bonus.round++;bonus.count=0;bonus.open=true;bonus.until=clock+BONUS.open;tone('start');}}
function reachOn(){return drawResult!==null&&spinPlan.reach&&drawTime>=spinPlan.stops[2]&&drawTime<spinPlan.stops[1];}
// Chance button (ボタン演出): every reach, win or miss, asks for the button at spinPlan.push. The middle number keeps rolling at the reach speed
// until the button is pressed (or PUSH_WAIT passes), then stops on its planned number. The result was already drawn, so the button only reveals it.
function pushReady(){return drawResult!==null&&!!spinPlan?.asked&&spinPlan.pressed==null;}
function askPush(){const s=spinPlan,m=columnMotion(1,s.push);s.asked=true;s.p0=m.p;s.v0=m.v;s.stops[1]=s.duration=Infinity;tone('push');say('ボタンを押してください（台の中央手前のボタンをタップ、またはEnterキー）。押さなくても少したつと止まります。');}
function pressPush(){if(!pushReady())return;const s=spinPlan,t=drawTime,p=s.p0+s.v0*(t-s.push),need=((s.numbers[1]-1-p)%9+9)%9;s.pressed=t;s.from=p;s.dist=need<1?need+9:need;s.D=gentle||reduced?.55:.4;s.stops[1]=s.duration=t+s.D;pressedAt.push=clock;tone('press');say('抽選中です。');}
function pushMotion(t){const s=spinPlan;if(s.pressed==null)return {p:s.p0+s.v0*(t-s.push),v:s.v0,since:-1};const k=1-Math.min(t-s.pressed,s.D)/s.D;return {p:s.from+s.dist*(1-k*k),v:2*s.dist/s.D*k,since:t-s.pressed-s.D};}
// LCD prompt: a button icon, "PUSH!" and a gauge of the time left before it stops by itself.
function pushPrompt(){const left=Math.max(0,1-(drawTime-spinPlan.push)/PUSH_WAIT),beat=reduced?1:1+.06*Math.sin(clock*(gentle?5:9)),c=REACH_COLORS[spinPlan.color]??REACH_COLORS.pink,[b0,b1,b2]=c.button;ctx.save();ctx.shadowColor=c.glow;ctx.shadowBlur=gentle||reduced?4:14;rr(268,446,184,48,24,'#2a0d24e6',c.rim);ctx.restore();
ctx.save();ctx.translate(296,470);ctx.scale(beat,beat);circle(0,0,16,grad(-6,-8,8,10,[[0,b0],[.45,b1],[1,b2]]),'#fff3c7');circle(-4,-5,4,'#ffffffcc');ctx.restore();
text('PUSH!',382,468,22,'#ffffff','bold Georgia');rr(322,478,120,6,3,'#ffffff26');if(left>0)rr(322,478,120*left,6,3,c.rim);}
// The painted chance button lights up while it can be pressed and flashes when pressed.
function buttonGlow(asking,flash){const {x,y,rx}=BOARD.button;if(!asking&&!(flash<.5))return;ctx.save();ctx.globalCompositeOperation='lighter';
const a=asking?(reduced?.45:gentle?.35+.12*Math.sin(clock*4):.45+.3*Math.sin(clock*9)):(gentle?.35:.8)*(1-flash/.5),g=ctx.createRadialGradient(x,y-24,8,x,y-14,rx+16);g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(.45,`rgba(255,120,200,${a*.7})`);g.addColorStop(1,'rgba(255,90,180,0)');
ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y-10,rx+16,72,0,0,Math.PI*2);ctx.fill();ctx.restore();}
// Tapping the drawn lever, MAX BET and stop buttons on the canvas works like the buttons below it.
function canvasPoint(e){const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width*720,(e.clientY-r.top)/r.height*960];}
canvas.style.touchAction='manipulation';
// iOS Safari can still take quick taps on the drawn lever, MAX BET and stop buttons as a double-tap zoom, so a short tap on the board cancels the browser's default (scrolling and pinch zoom still work).
let tapStart=null;canvas.addEventListener('touchstart',e=>{const t=e.touches[0];tapStart=e.touches.length===1?{x:t.clientX,y:t.clientY,at:e.timeStamp}:null;},{passive:true});
canvas.addEventListener('touchend',e=>{const t=e.changedTouches[0];if(tapStart&&!e.touches.length&&e.cancelable&&e.timeStamp-tapStart.at<500&&Math.hypot(t.clientX-tapStart.x,t.clientY-tapStart.y)<12)e.preventDefault();tapStart=null;});
canvas.addEventListener('dblclick',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{if(paused)return;if(mode==='pachinko'){if(pushReady()&&inButton(...canvasPoint(e),8)){e.preventDefault();pressPush();}return;}if(mode!=='slot')return;const hit=hitSlot(...canvasPoint(e));if(!hit)return;e.preventDefault();held=hit;if(hit==='lever')lever();else if(hit==='bet')maxBet();else $$('[data-stop]')[+hit.slice(4)].onclick();});
window.addEventListener('pointerup',()=>held=null);window.addEventListener('pointercancel',()=>held=null);
canvas.addEventListener('pointermove',e=>{const pt=canvasPoint(e);canvas.style.cursor=(mode==='slot'?hitSlot(...pt):mode==='pachinko'&&pushReady()&&inButton(...pt,8))?'pointer':'';});
let uiClock=0;function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;accumulator+=dt;while(accumulator>=1/120){step(1/120);accumulator-=1/120;}uiClock+=dt;if(uiClock>.25){timerUI();uiClock=0;}bgm();render();requestAnimationFrame(frame);}update();timerUI();requestAnimationFrame(frame);

// Reflection (urge level and memo), weekly play-time summary, the break countdown rule and the room settings.
// Everything stays in this browser's localStorage.
const LIMIT_KEY='reel-room-weekly-limit',NOTICE_KEY='reel-room-weekly-notice',DAY=864e5;
const $=s=>document.querySelector(s);
export const WEEK_NOTICE='今週の目安の時間を超えました。休憩や「今日はここまで」をいつでも選べます。';
// Room settings kept in this browser (the volumes and the weekly target have their own keys; sound itself always starts OFF).
// Anything unknown or broken falls back to the default, so old or damaged data never stops the room from opening.
export const SETTINGS={limit:600,leds:'auto',variety:'variety',gentle:true};
const CHOICES={limit:[300,600,900],leds:['auto','on','off'],variety:['variety','plain']};
export function normalizeSettings(v){const s={...SETTINGS};if(v&&typeof v==='object'){for(const k of Object.keys(CHOICES))if(CHOICES[k].includes(v[k]))s[k]=v[k];if(typeof v.gentle==='boolean')s.gentle=v.gentle;}return s;}
// A pause ends the break countdown (the next break comes a full break time later) unless it only came from leaving the screen
// and the player was back within AWAY_BREAK seconds: a quick look at another app is not a break.
export const AWAY_BREAK=60;
export function restartsBreak(kind,seconds){return kind!=='away'||seconds>=AWAY_BREAK;}
// File name of the JSON export, with the local date so several exports do not get mixed up.
export function exportName(d=new Date()){const p=n=>String(n).padStart(2,'0');return `reel-room-journal-${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.json`;}
export function weekStart(d=new Date()){const s=new Date(d);s.setHours(0,0,0,0);s.setDate(s.getDate()-(s.getDay()+6)%7);return s;}
export function weekSeconds(history,now=new Date()){const from=weekStart(now),to=new Date(from);to.setDate(to.getDate()+7);return history.reduce((t,r)=>{const at=new Date(r.date);return at>=from&&at<to?t+r.seconds:t;},0);}
export function formatDuration(seconds){const m=Math.floor(seconds/60);return m>=60?`${Math.floor(m/60)}時間${m%60?`${m%60}分`:''}`:`${m}分`;}
export function normalizeReflection(urge,memo=''){const u=Number(urge),text=String(memo).trim().slice(0,200);return {...(Number.isInteger(u)&&u>=1&&u<=5?{urge:u}:{}),...(text?{memo:text}:{})};}
export function weeklySummary(history,weeks=4,now=new Date()){return Array.from({length:weeks},(_,i)=>{const from=weekStart(new Date(weekStart(now).getTime()-i*7*DAY+DAY/2)),to=new Date(from);to.setDate(to.getDate()+7);const rows=history.filter(r=>{const at=new Date(r.date);return at>=from&&at<to;}),urges=rows.map(r=>r.urge).filter(u=>Number.isInteger(u)&&u>=1&&u<=5);return {from,seconds:rows.reduce((t,r)=>t+r.seconds,0),count:rows.length,urge:urges.length?urges.reduce((a,b)=>a+b,0)/urges.length:null};});}
let weeklyLimit=0;
export function readReflection(){const checked=document.querySelector('input[name="urge"]:checked'),memo=$('#memo'),value=normalizeReflection(checked?.value,memo.value);if(checked)checked.checked=false;memo.value='';return value;}
export function appendReflection(row,r){const parts=[];if(Number.isInteger(r.urge))parts.push(`続けたい気持ち ${r.urge}/5`);if(typeof r.memo==='string'&&r.memo)parts.push(r.memo);if(!parts.length)return;const p=document.createElement('span');p.className='history-memo';p.textContent=parts.join(' · ');row.append(p);}
export function renderWeek(history,live=0){const total=weekSeconds(history)+live,over=weeklyLimit>0&&total>=weeklyLimit;$('#week-time').textContent=formatDuration(total);$('#week-progress').style.width=weeklyLimit?`${Math.min(100,total/weeklyLimit*100)}%`:'0';$('#week-box').classList.toggle('over',over);$('#week-label').textContent=over?'今週の目安を超えました。今日はここで区切っても大丈夫です。':weeklyLimit?`目安 ${formatDuration(weeklyLimit)}／週`:'週の目安は設定で決められます';$('#pause-week').textContent=`今週の遊技時間 ${formatDuration(total)}${weeklyLimit?`（目安 ${formatDuration(weeklyLimit)}）`:''}${over?'。今週の目安を超えています。':''}`;return over&&live>0&&noticeOnce();}
// Shows the weekly notice once a week. Returns true when it has just been shown. noticed keeps it to once in this page too,
// for browsers that cannot store anything (otherwise it would be shown again every moment and hide every other message).
let noticed=null;
function noticeOnce(){const key=weekStart().toISOString().slice(0,10);if(noticed===key)return false;noticed=key;try{if(localStorage.getItem(NOTICE_KEY)===key)return false;localStorage.setItem(NOTICE_KEY,key);}catch{}$('#message').textContent=WEEK_NOTICE;return true;}
export function renderWeekSummary(history){const list=$('#week-summary');list.replaceChildren();for(const w of weeklySummary(history)){const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('b');label.textContent=`${w.from.getMonth()+1}/${w.from.getDate()}〜の週`;value.textContent=w.count?`${formatDuration(w.seconds)} · ${w.count}回${w.urge===null?'':` · 気持ち平均 ${w.urge.toFixed(1)}`}`:'記録なし';if(weeklyLimit&&w.seconds>=weeklyLimit)li.className='over';li.append(label,value);list.append(li);}}
if(typeof document!=='undefined'&&$('#weekly-limit')){try{weeklyLimit=Math.max(0,+localStorage.getItem(LIMIT_KEY)||0);}catch{}const select=$('#weekly-limit');select.value=String(weeklyLimit);if(!select.value){weeklyLimit=0;select.value='0';}select.onchange=()=>{weeklyLimit=+select.value;noticed=null;try{localStorage.setItem(LIMIT_KEY,select.value);localStorage.removeItem(NOTICE_KEY);}catch{}};}

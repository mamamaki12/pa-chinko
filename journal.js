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
// Date and time of one record, short enough to share a line with the machine and the play time: 11/11 5:20 (the year only when it is not this year).
export function recordWhen(date,now=new Date()){const d=new Date(date);if(Number.isNaN(d.getTime()))return '';const md=`${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;return d.getFullYear()===now.getFullYear()?md:`${d.getFullYear()}/${md}`;}
export function appendReflection(row,r){const parts=[];if(Number.isInteger(r.urge))parts.push(`続けたい気持ち ${r.urge}/5`);if(typeof r.memo==='string'&&r.memo)parts.push(r.memo);const p=document.createElement('span');p.className=parts.length?'history-memo':'history-memo none';p.textContent=parts.length?parts.join(' · '):'ふりかえりなし';
  // メモのある行は2行で畳み、右の「開く」ボタンで全部見せる。ボタンは2行に収まらないときだけ出す（syncMemoFolds）。
  if(typeof r.memo==='string'&&r.memo){const wrap=document.createElement('div'),b=document.createElement('button'),id=`memo-${++memoSeq}`;wrap.className='history-reflect';p.classList.add('clamp');p.id=id;b.type='button';b.className='memo-more icon-only';b.hidden=true;b.setAttribute('aria-controls',id);b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','メモを全部見る');b.title='メモを全部見る';b.innerHTML='<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>';
    b.onclick=()=>{const open=p.classList.toggle('open');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'メモを畳む':'メモを全部見る');b.title=b.getAttribute('aria-label');};wrap.append(b,p);row.append(wrap);return;}
  row.append(p);}
let memoSeq=0;
// 畳んだメモが2行に収まっているか見て、収まらない行だけ「開く」ボタンを出す（画面に出ているときに呼ぶ）。
export function syncMemoFolds(root){for(const p of root.querySelectorAll('.history-memo.clamp')){const b=p.previousElementSibling;if(!b)continue;if(p.classList.contains('open')){b.hidden=false;continue;}b.hidden=!(p.scrollHeight>p.clientHeight+1);}}
// Balls / medals of one record, from what the record already keeps (used = put in, total = paid out). Pachinko total counts only
// jackpot payouts (the 3 balls back from START are not kept), so pachinko shows no difference; pachislot total is every payout.
const TALLY={pachinko:{name:'パチンコ',unit:'玉',paid:'大当たりの払出',diff:false},slot:{name:'パチスロ',unit:'枚',paid:'払出',diff:true}};
const num=n=>n.toLocaleString('ja-JP');
export function sessionTally(r){const played=Object.keys(TALLY).filter(k=>{const s=r?.[k];return s&&typeof s==='object'&&Number.isFinite(s.used)&&Number.isFinite(s.total)&&s.used>=0&&s.total>=0&&(s.used>0||s.total>0);});return played.map(k=>{const t=TALLY[k],{used,total}=r[k],d=total-used,items=[`使った${num(used)}${t.unit}`,`${t.paid}${num(total)}${t.unit}`];if(t.diff)items.push(`差 ${d>0?'+':d<0?'\u2212':''}${num(Math.abs(d))}${t.unit}`);return {name:played.length>1?t.name:'',items};});}
export function appendTally(row,r){for(const {name,items} of sessionTally(r)){const p=document.createElement('span');p.className='history-tally';if(name){const b=document.createElement('b');b.textContent=`${name}：`;p.append(b);}items.forEach((t,i)=>{if(i)p.append(' · ');const s=document.createElement('span');s.textContent=t;p.append(s);});row.append(p);}}
export function renderWeek(history,live=0){const total=weekSeconds(history)+live,over=weeklyLimit>0&&total>=weeklyLimit;$('#week-time').textContent=formatDuration(total);$('#week-progress').style.width=weeklyLimit?`${Math.min(100,total/weeklyLimit*100)}%`:'0';$('#week-box').classList.toggle('over',over);$('#week-label').textContent=over?'今週の目安を超えました。今日はここで区切っても大丈夫です。':weeklyLimit?`目安 ${formatDuration(weeklyLimit)}／週`:'週の目安は設定で決められます';$('#pause-week').textContent=`今週の遊技時間 ${formatDuration(total)}${weeklyLimit?`（目安 ${formatDuration(weeklyLimit)}）`:''}${over?'。今週の目安を超えています。':''}`;return over&&live>0&&noticeOnce();}
// Shows the weekly notice once a week. Returns true when it has just been shown. noticed keeps it to once in this page too,
// for browsers that cannot store anything (otherwise it would be shown again every moment and hide every other message).
let noticed=null;
function noticeOnce(){const key=weekStart().toISOString().slice(0,10);if(noticed===key)return false;noticed=key;try{if(localStorage.getItem(NOTICE_KEY)===key)return false;localStorage.setItem(NOTICE_KEY,key);}catch{}$('#message').textContent=WEEK_NOTICE;return true;}
export function renderWeekSummary(history){const list=$('#week-summary');list.replaceChildren();for(const w of weeklySummary(history)){const li=document.createElement('li'),label=document.createElement('span'),value=document.createElement('b');label.textContent=`${w.from.getMonth()+1}/${w.from.getDate()}〜の週`;value.textContent=w.count?`${formatDuration(w.seconds)} · ${w.count}回`:'記録なし';if(w.count&&w.urge!==null){const urge=document.createElement('span'),sep=document.createElement('span');urge.className='week-urge';sep.className='sep';sep.textContent=' · ';urge.append(sep,`気持ち平均 ${w.urge.toFixed(1)}`);value.append(urge);}if(weeklyLimit&&w.seconds>=weeklyLimit)li.className='over';li.append(label,value);list.append(li);}
  // たたんだ週の欄の1行（今週の分）。開くと4週分が出る。
  const now=$('#week-now');if(now){const w=weeklySummary(history,1)[0];now.textContent=w.count?`${formatDuration(w.seconds)} · ${w.count}回`:'記録なし';$('#week-fold').classList.toggle('over',weeklyLimit>0&&w.seconds>=weeklyLimit);}}
if(typeof document!=='undefined'&&$('#weekly-limit')){try{weeklyLimit=Math.max(0,+localStorage.getItem(LIMIT_KEY)||0);}catch{}const select=$('#weekly-limit');select.value=String(weeklyLimit);if(!select.value){weeklyLimit=0;select.value='0';}select.onchange=()=>{weeklyLimit=+select.value;noticed=null;try{localStorage.setItem(LIMIT_KEY,select.value);localStorage.removeItem(NOTICE_KEY);}catch{}};}

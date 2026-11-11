import {test} from 'node:test';
import assert from 'node:assert/strict';
import {weekStart,weekSeconds,formatDuration,normalizeReflection,weeklySummary,normalizeSettings,SETTINGS,restartsBreak,AWAY_BREAK,exportName,sessionTally} from '../journal.js';
test('週は月曜0時から始まる',()=>{const s=weekStart(new Date(2026,9,25,15));assert.equal(s.getDay(),1);assert.equal(s.getDate(),19);assert.equal(s.getHours(),0);assert.equal(weekStart(new Date(2026,9,19,0,5)).getDate(),19);});
test('今週の記録だけを合計する',()=>{const now=new Date(2026,9,25,12),h=[{date:new Date(2026,9,25,10).toISOString(),seconds:600},{date:new Date(2026,9,19,1).toISOString(),seconds:300},{date:new Date(2026,9,18,23).toISOString(),seconds:900}];assert.equal(weekSeconds(h,now),900);});
test('ふりかえりの値を整える',()=>{assert.deepEqual(normalizeReflection('3','  雨で暇だった '),{urge:3,memo:'雨で暇だった'});assert.deepEqual(normalizeReflection(undefined,''),{});assert.deepEqual(normalizeReflection('9','x'.repeat(300)),{memo:'x'.repeat(200)});});
test('時間の表示と週ごとのまとめ',()=>{assert.equal(formatDuration(59),'0分');assert.equal(formatDuration(3600),'1時間');assert.equal(formatDuration(5460),'1時間31分');const now=new Date(2026,9,25,12),h=[{date:new Date(2026,9,24).toISOString(),seconds:600,urge:2},{date:new Date(2026,9,23).toISOString(),seconds:60,urge:5},{date:new Date(2026,9,14).toISOString(),seconds:120}];const w=weeklySummary(h,4,now);assert.equal(w.length,4);assert.equal(w[0].seconds,660);assert.equal(w[0].urge,3.5);assert.equal(w[1].seconds,120);assert.equal(w[1].urge,null);assert.equal(w[1].from.getDate(),12);assert.equal(w[3].count,0);});
test('設定は決まった値だけを使い、壊れた値や古い値は初期値に戻す',()=>{assert.deepEqual(normalizeSettings(null),SETTINGS);assert.deepEqual(normalizeSettings('x'),SETTINGS);assert.deepEqual(normalizeSettings({limit:300,leds:'off',variety:'plain',gentle:false}),{limit:300,leds:'off',variety:'plain',gentle:false});assert.deepEqual(normalizeSettings({limit:'300',leds:'constructor',variety:1,gentle:'false',extra:1}),SETTINGS);assert.deepEqual(normalizeSettings({limit:1e9}),SETTINGS);assert.equal(SETTINGS.limit,600);assert.equal(SETTINGS.gentle,true);});
test('休憩・今日はここまでは次の休憩を数え直し、画面を離れただけなら1分以上離れたときだけ数え直す',()=>{assert.equal(restartsBreak('break',0),true);assert.equal(restartsBreak('away',5),false);assert.equal(restartsBreak('away',AWAY_BREAK-1),false);assert.equal(restartsBreak('away',AWAY_BREAK),true);assert.equal(AWAY_BREAK,60);});
test('書き出すファイル名にその日の日付が入る',()=>{assert.equal(exportName(new Date(2026,10,4,23,59)),'reel-room-journal-2026-11-04.json');assert.equal(exportName(new Date(2027,0,9)),'reel-room-journal-2027-01-09.json');});
test('記録の行に使った数・払出・差を出す（パチスロは差も、パチンコは大当たりの払出だけ）',()=>{
const zero={credit:1000,rounds:0,win:0,total:0,used:0};
assert.deepEqual(sessionTally({mode:'パチスロ',slot:{credit:982,rounds:10,win:0,total:12,used:30},pachinko:zero}),[{name:'',items:['使った30枚','払出12枚','差 \u221218枚']}]);
assert.deepEqual(sessionTally({mode:'パチスロ',slot:{credit:2120,rounds:40,win:15,total:1240,used:120},pachinko:zero}),[{name:'',items:['使った120枚','払出1,240枚','差 +1,120枚']}]);
assert.deepEqual(sessionTally({mode:'パチスロ',slot:{...zero,total:9,used:9}}),[{name:'',items:['使った9枚','払出9枚','差 0枚']}]);
assert.deepEqual(sessionTally({mode:'パチンコ',pachinko:{credit:700,rounds:5,win:0,total:0,used:300},slot:zero}),[{name:'',items:['使った300玉','大当たりの払出0玉']}]);
assert.deepEqual(sessionTally({mode:'パチンコ・パチスロ',pachinko:{...zero,used:200,total:320},slot:{...zero,used:3}}).map(t=>t.name),['パチンコ','パチスロ']);
// 古い記録や壊れた値は何も足さない
assert.deepEqual(sessionTally({mode:'パチンコ',seconds:60}),[]);
assert.deepEqual(sessionTally({mode:'パチンコ',pachinko:{used:'5',total:null}}),[]);
assert.deepEqual(sessionTally({mode:'パチスロ',slot:zero,pachinko:zero}),[]);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EVENTS,KINDS,createNavi,react,tick,lineFor,wrap} from '../lcd-character.js';

const seq=(...v)=>{let i=0;return ()=>v[i++%v.length];};
const all=Object.values(EVENTS).flatMap(e=>e.lines);

test('セリフに遊技の継続をあおる言葉や、惜しさを強調する言葉がない',()=>{
  for(const word of ['もう一回','もう1回','もっと','次こそ','続け','チャンス','アツ','惜し','おしい','あと少しで当た','取り返'])for(const line of all)assert.ok(!line.includes(word),`${word}: ${line}`);
});

test('レバー・変動開始・リーチの反応は結果を受け取らない（どのゲームでも同じ候補から選ぶ）',()=>{
  for(const ev of ['lever','spin','reach']){const n=createNavi('hana');n.greeted=true;react(n,ev,5,{rand:()=>0});assert.ok(EVENTS[ev].lines.includes(n.line)||n.line==='');assert.ok(!/\{n\}|\d/.test(EVENTS[ev].lines.join('')));}
});

test('払出のセリフに枚数が入り、名前も差し込まれる',()=>{
  const n=createNavi('sora');assert.equal(lineFor(n,'watermelon',()=>0,10),'スイカ！ 10枚');assert.match(lineFor(n,'hello',()=>0),/ソラ/);
  for(const kind of Object.keys(KINDS))assert.ok(KINDS[kind].name);
});

test('優先度の低い反応は、表示中の高いセリフをさえぎらない',()=>{
  const n=createNavi('hana');n.greeted=true;react(n,'win',10,{rand:()=>0,count:300});const line=n.line;
  react(n,'stop',10.5,{rand:()=>0});react(n,'miss',10.6,{rand:()=>0});assert.equal(n.line,line);assert.equal(n.pose,'cheer');
  react(n,'end',11,{rand:()=>0});assert.equal(n.pose,'bow');
});

test('大当たりのあとは休憩を勧める一言が続く',()=>{
  const n=createNavi('hana');n.greeted=true;react(n,'win',0,{rand:()=>0,count:300});
  for(let t=0;t<12;t+=.05)tick(n,t,{rand:()=>0});
  assert.equal(n.pose,'idle');
  const n2=createNavi('hana');n2.greeted=true;react(n2,'win',0,{rand:()=>0,count:300});let saw=false;for(let t=0;t<9;t+=.05){tick(n2,t,{rand:()=>.99});if(EVENTS.afterWin.lines.includes(n2.line))saw=true;}assert.ok(saw);
});

test('はじめにあいさつし、抽選中は雑談しない',()=>{
  const n=createNavi('hana');tick(n,0);assert.equal(n.line,'');tick(n,1.3,{rand:()=>0});assert.match(n.line,/ハナ/);
  const b=createNavi('sora');b.greeted=true;for(let t=0;t<60;t+=.1)tick(b,t,{busy:true,rand:()=>.5});assert.equal(b.line,'');assert.equal(b.pose,'watch');
  const c=createNavi('sora');c.greeted=true;let chatted=false;for(let t=0;t<60;t+=.1){tick(c,t,{rand:()=>.5});if(EVENTS.chat.lines.includes(c.line))chatted=true;}assert.ok(chatted);
});

test('文字送りで増えた文字数を返し、動きを減らす設定では一度に全部出す',()=>{
  const n=createNavi('hana');n.greeted=true;react(n,'reach',0,{rand:seq(0,0)});let total=0;for(let t=0;t<3;t+=.05)total+=tick(n,t,{busy:true});assert.equal(total,n.line.length||[...EVENTS.reach.lines[0]].length);
  const r=createNavi('hana');r.greeted=true;react(r,'resume',0,{rand:()=>0});assert.equal(tick(r,0,{reduced:true}),r.line.length);
});

test('吹き出しの折り返しは幅に収まる',()=>{
  const rows=wrap(s=>s.length*14,'今日はおつかれさま。またね',100);assert.ok(rows.every(r=>r.length*14<=100));assert.equal(rows.join(''),'今日はおつかれさま。またね');
});

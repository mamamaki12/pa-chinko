import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NOTICE_KINDS,NOTICE_COLORS,NOTICE_PICK,NOTICE_COLOR,pickNotice,noticeTrust} from '../engine.js';
import {NOTICE_LEN,NOTICE_TINTS,NOTICE_WORDS,CUTIN_WORDS,noticeAlpha} from '../notice-fx.js';
import {createBackdrop,stepBackdrop,stageChange,MIN_SHOW} from '../lcd-scenes.js';

const seq=()=>{let a=12345;return n=>{a=(a*1103515245+12345)%2147483648;return Math.floor(a/2147483648*n);};};

test('予告の表は1000ずつで、種類7つ・色4つ（全28通り）にすべて絵と言葉がある',()=>{
  for(const t of [NOTICE_PICK,NOTICE_COLOR])for(const o of ['win','chance','miss'])assert.equal(Object.values(t[o]).reduce((a,b)=>a+b,0),1000,o);
  assert.equal(Object.keys(NOTICE_KINDS).length*NOTICE_COLORS.length,28);
  for(const c of NOTICE_COLORS){assert.ok(NOTICE_TINTS[c]);assert.ok(NOTICE_WORDS[c]);assert.ok(CUTIN_WORDS[c]);}
  for(const o of ['win','chance','miss'])for(const k of Object.keys(NOTICE_KINDS))assert.ok(k in NOTICE_PICK[o],`${o}/${k}`);
});

test('予告は抽選の結果から選ぶだけで、「いつも同じ」では出ない。外れで金やステージチェンジは出ない',()=>{
  assert.equal(pickNotice('win',{variety:false}),null);
  const rand=seq(),seen={win:0,miss:0};
  for(let i=0;i<5000;i++){const w=pickNotice('win',{rand}),m=pickNotice('miss',{rand});if(w){seen.win++;assert.ok(NOTICE_KINDS[w.kind]);assert.ok(NOTICE_COLORS.includes(w.color));}
    if(m){seen.miss++;assert.notEqual(m.color,'gold');assert.notEqual(m.kind,'stage');}}
  assert.ok(seen.win/5000>.55&&seen.win/5000<.75,String(seen.win));assert.ok(seen.miss/5000>.05&&seen.miss/5000<.15,String(seen.miss));
});

test('色が熱いほど、群れよりセリフ・カットイン・ステージチェンジのほうが当たりやすい（信頼度）',()=>{
  for(const m of ['pachinko','slot']){const c=NOTICE_COLORS.map(col=>noticeTrust(m,null,col));for(let i=1;i<c.length;i++)assert.ok(c[i]>c[i-1],`${m} ${NOTICE_COLORS[i]}`);
    assert.ok(noticeTrust(m,'butterflies')<noticeTrust(m,'words'));assert.ok(noticeTrust(m,'words')<noticeTrust(m,'cutin'));assert.ok(noticeTrust(m,'cutin')<noticeTrust(m,'stage'));
    assert.ok(noticeTrust(m)>0&&noticeTrust(m)<1);}
  assert.ok(Math.abs(noticeTrust('pachinko',null,'gold')-.833)<.01);
});

test('予告は決まった時間だけ出て消え、動きを減らす設定では途中から出ていても最初から見える',()=>{
  assert.equal(noticeAlpha(-.1),0);assert.equal(noticeAlpha(NOTICE_LEN),0);assert.equal(noticeAlpha(.5),1);assert.ok(noticeAlpha(.05)<1);assert.equal(noticeAlpha(.01,true),1);
});

test('ステージチェンジでは、その変動のあいだだけリーチ用・お祭りの背景になる',()=>{
  const b=createBackdrop('aurora');stepBackdrop(b,0,{phase:'draw',draw:1});stageChange(b,1,'bonus');assert.ok(b.scene.party);
  for(let t=1;t<30;t+=.5){stepBackdrop(b,t,{phase:t<10?'draw':'reach',draw:1});assert.ok(b.scene.party,String(t));}
  stepBackdrop(b,30+MIN_SHOW,{phase:'draw',draw:2});assert.equal(b.pool,'normal');assert.equal(b.stage,null);
});

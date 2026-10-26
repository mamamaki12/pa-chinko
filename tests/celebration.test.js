import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SHOWS,FLASH,startShow,showOn,fanfareOn,showScene,flashAlpha,titleScale,showAlpha} from '../celebration.js';
import {SCENES} from '../cabinet-leds.js';
import {FANFARE,FANFARES,fanfareLength,noteNumber} from '../music.js';
import {createNavi,react,tick} from '../lcd-character.js';
import {portraitMotion,rigPose} from '../navigator-art.js';

test('当たりの演出は始まってから決まった時間だけ出て、LEDの場面も合わせて切り替わる',()=>{
  for(const kind of Object.keys(SHOWS)){const s=startShow(kind,10,{count:150}),len=SHOWS[kind].len;
    assert.equal(s.count,150);assert.ok(!showOn(s,9.99));assert.ok(showOn(s,10));assert.ok(showOn(s,10+len-.01));assert.ok(!showOn(s,10+len+.001));
    assert.equal(showScene(s,10.5),kind.endsWith('End')?'finale':'fanfare');assert.equal(showScene(s,10+len+.001),null);}
  assert.ok(!showOn(null,0));assert.equal(showScene(null,0),null);
  for(const machine of ['aurora','astral'])for(const name of ['fanfare','finale'])assert.ok(SCENES[machine][name],`${machine}/${name}`);
});

test('白いフラッシュは最初の1回だけで、だんだん消える（控えめでは弱く、動きを減らす設定と終了の演出では出さない）',()=>{
  const s=startShow('big',0);let prev=Infinity;
  for(let t=0;t<SHOWS.big.len;t+=.01){const a=flashAlpha(s,t,{gentle:false});assert.ok(a<=prev+1e-9,String(t));assert.ok(a>=0&&a<=.8);prev=a;if(t>=FLASH)assert.equal(a,0);}
  assert.ok(flashAlpha(s,.05,{gentle:true})<flashAlpha(s,.05,{gentle:false}));
  assert.equal(flashAlpha(s,.05,{reduced:true}),0);assert.equal(flashAlpha(startShow('bigEnd',0),.05,{gentle:false}),0);
});

test('タイトルは大きく出てから弾んで1倍に落ち着き、最後にふわっと消える',()=>{
  assert.ok(titleScale(0)>2);assert.ok(Math.abs(titleScale(1.5)-1)<.01);assert.ok([...Array(40)].some((_,i)=>titleScale(i*.02)<1));assert.equal(titleScale(0,true),1);
  const s=startShow('jackpot',0);assert.equal(showAlpha(s,1),1);assert.ok(showAlpha(s,SHOWS.jackpot.len-.1)<.5);
});

test('ファンファーレは音域内で、演出のあいだ（BGMを止めている間）に鳴り終わる',()=>{
  const notes=[...FANFARE.brass.map(n=>n[2]),...FANFARE.chords.flatMap(c=>c[2]),...FANFARE.bass.map(n=>n[2]),...FANFARE.bells.map(b=>b[1])];
  for(const [name,{key}] of Object.entries(FANFARES)){for(const n of notes){const m=noteNumber(n)+key;assert.ok(m>=36&&m<=104,n);}
    assert.ok(fanfareLength(name)<=SHOWS.big.fanfare+.05&&fanfareLength(name)>2.5,name);}
  const end=Math.max(...FANFARE.brass.map(([b,l])=>b+l),...FANFARE.chords.map(([b,l])=>b+l));assert.ok(end<=8);
  const s=startShow('big',0);assert.ok(fanfareOn(s,1));assert.ok(!fanfareOn(s,SHOWS.big.fanfare));assert.ok(!fanfareOn(startShow('bigEnd',0),.5));
});

test('ボーナス中はミニキャラが踊り、反応のあとは踊りに戻り、終わると止まる。雑談はしない',()=>{
  const n=createNavi('sora');n.greeted=true;n.chatAt=0;
  for(let t=0;t<5;t+=.05)tick(n,t,{party:true,rand:()=>.5});assert.equal(n.pose,'dance');assert.equal(n.line,'');assert.ok(n.poseUntil>4.9);
  react(n,'bell',5,{rand:()=>0,count:15});assert.equal(n.pose,'clap');
  for(let t=5;t<12;t+=.05)tick(n,t,{party:true,rand:()=>.99});assert.equal(n.pose,'dance');
  for(let t=12;t<14;t+=.05)tick(n,t,{party:false,rand:()=>.99});assert.equal(n.pose,'idle');
});

test('踊りは動きを減らす設定では止まる',()=>{
  const n={...createNavi('hana'),greeted:true,pose:'dance',poseAt:0,poseUntil:5,prio:0};
  assert.notEqual(portraitMotion(n,.3,{gentle:false}).dx,0);
  const m=portraitMotion(n,.3,{reduced:true});assert.equal(m.dx,0);assert.equal(m.lift,0);
  const p=rigPose(n,.3,{pose:'down'},{reduced:true});assert.deepEqual(p.arms,[0,0]);
});

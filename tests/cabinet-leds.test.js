import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LED_PARTS,SCENES,MAX_HZ,ledLevel,createLeds,applyScene,select} from '../cabinet-leds.js';
import {BOARD} from '../engine.js';
import {LAYOUT} from '../slot-view.js';
const inside=([x,y],[rx,ry,rw,rh])=>x>rx&&x<rx+rw&&y>ry&&y<ry+rh;
test('LED部品は台の中に収まり、idは機種ごとに重ならない',()=>{for(const parts of Object.values(LED_PARTS)){assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);for(const p of parts){assert.ok(p.poly.length>=3);for(const [x,y] of p.poly)assert.ok(x>=0&&x<=720&&y>=0&&y<=960,p.id);}}});
test('LED部品は液晶・リール窓・ボタン類に掛からない',()=>{const d=BOARD.display,lcd=[d.x1,d.y1,d.x2-d.x1,d.y2-d.y1];for(const p of LED_PARTS.aurora)for(const q of p.poly)assert.ok(!inside(q,lcd),p.id);
const {window:w,lever,bet,stops}=LAYOUT,slotLcd=[182,132,362,156];for(const p of LED_PARTS.astral)for(const q of p.poly){assert.ok(!inside(q,w),p.id);assert.ok(!inside(q,slotLcd),p.id);for(const [x,y,r] of [[lever.x,lever.y,lever.r],[bet.x,bet.y,bet.r],...stops.x.map(x=>[x,stops.y,stops.r])])assert.ok(Math.hypot(q[0]-x,q[1]-y)>r,p.id);}});
test('点灯・消灯・点滅・呼吸・流れる光の明るさは0〜1',()=>{for(const mode of ['off','on','blink','breathe','chase'])for(let t=0;t<4;t+=.05)for(let k=0;k<5;k++){const v=ledLevel({mode,level:1,speed:1,min:.2},t,k,5);assert.ok(v>=0&&v<=1,mode);}
assert.equal(ledLevel({mode:'off'},1),0);assert.equal(ledLevel({mode:'on',level:.7},1),.7);});
test('点滅は1秒に3回より速くならない',()=>{let changes=0,prev=null;for(let t=0;t<1;t+=.001){const v=ledLevel({mode:'blink',speed:20,min:0},t);if(prev!==null&&v!==prev)changes++;prev=v;}assert.ok(changes<=MAX_HZ*2,String(changes));});
test('部品・グループ・allで点灯と消灯を切り替えられる',()=>{const leds=createLeds('aurora');leds.off('all');assert.ok(leds.frame(0).every(l=>l.level===0));leds.on('top');for(const l of leds.frame(0))assert.equal(l.level,LED_PARTS.aurora.find(p=>p.id===l.id).group==='top'?1:0);leds.set('wingL',{mode:'blink',speed:1});assert.equal(leds.get('wingL').mode,'blink');assert.equal(select(LED_PARTS.aurora,['wingL','side']).length,1+LED_PARTS.aurora.filter(p=>p.group==='side').length);});
test('どの場面でも全部品の状態が決まり、控えめでは点滅しない・動きを減らす設定では止まる',()=>{for(const [machine,scenes] of Object.entries(SCENES))for(const name of Object.keys(scenes)){const leds=applyScene(createLeds(machine),name,{gentle:true});for(const p of LED_PARTS[machine])assert.notEqual(leds.get(p.id).mode,'blink',`${machine}/${name}`);
const still=applyScene(createLeds(machine),name,{reduced:true});for(const p of LED_PARTS[machine])assert.ok(['on','off'].includes(still.get(p.id).mode));}
const leds=applyScene(createLeds('aurora'),'dark');assert.ok(leds.frame(3).every(l=>l.level===0));});
test('虹色は決まった色の中から選ばれる',()=>{const leds=createLeds('astral').set('all',{color:'rainbow'}),colors=new Set();for(let t=0;t<10;t+=.1)for(const l of leds.frame(t))colors.add(l.color);assert.ok(colors.size>1&&colors.size<=12);for(const c of colors)assert.match(c,/^#[0-9a-f]{6}$/);});

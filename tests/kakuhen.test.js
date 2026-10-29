import test from 'node:test';
import assert from 'node:assert/strict';
import {KAKUHEN,ST_LIFT,drawHold,liftHold,kakuhenAfter,planSpin,stContinue} from '../engine.js';
import {trackFor} from '../music.js';
import {SCENES} from '../cabinet-leds.js';
import {EVENTS} from '../lcd-character.js';
import {SHOWS} from '../celebration.js';

test('確変中（ST）に入った玉は1/25で当たる',()=>{let win=0,n=200000;for(let i=0;i<n;i++){const h=drawHold({st:true});assert.ok(h.st);if(h.win){win++;assert.equal(h.prize,300);assert.ok(h.reach);}}
  assert.ok(Math.abs(win/n-1/KAKUHEN.odds)<.003,String(win/n));});
test('確変の前にたまった保留も、確変中に抽選すると全体で1/25になる',()=>{assert.ok(ST_LIFT>0);let win=0,n=300000;for(let i=0;i<n;i++)if(liftHold(drawHold()).win)win++;
  assert.ok(Math.abs(win/n-1/KAKUHEN.odds)<.003,String(win/n));const w={prize:300,win:true,reach:true,st:false};assert.equal(liftHold(w,{rand:()=>0}),w);});
test('通常の大当たりの半分が確変、確変中の大当たりはいつも確変（上限なし）',()=>{let k=0,n=20000;for(let i=0;i<n;i++)if(kakuhenAfter())k++;assert.ok(Math.abs(k/n-KAKUHEN.rate/100)<.02);
  assert.equal(KAKUHEN.limit,Infinity);for(let c=2;c<60;c++)assert.ok(kakuhenAfter({inSt:true,chain:c}));
  assert.ok(Math.abs(stContinue()-.706)<.01);});
test('確変は奇数か昇格つきの偶数でそろい、通常はいつも偶数',()=>{let odd=0,n=6000;for(let i=0;i<n;i++){const k=planSpin(true,0,{kakuhen:true}),[a,b,c]=k.numbers;assert.ok(a===b&&b===c);assert.equal(k.kakuhen,true);assert.equal(k.promote,a%2===0);if(a%2)odd++;
    const p=planSpin(true,0,{kakuhen:false});assert.equal(p.numbers[0]%2,0);assert.equal(p.promote,false);}
  assert.ok(Math.abs(odd/n-KAKUHEN.odd/100)<.03);assert.equal(planSpin(true,0).kakuhen,undefined);});
test('確変中はリーチなしの外れの変動が短い',()=>{const noReach={rand:n=>n===15?1:0};assert.ok(planSpin(false,0,{...noReach,st:true}).duration<planSpin(false,3,noReach).duration);});
test('確変中の音楽・ランプ・セリフ・演出がある',()=>{assert.equal(trackFor({mode:'pachinko',st:true}),'aurora-st');assert.equal(trackFor({mode:'pachinko',st:true,reach:true}),'aurora-reach');assert.equal(trackFor({mode:'pachinko',st:true,bonus:true}),'aurora-bonus');
  assert.ok(SCENES.aurora.st);assert.ok(EVENTS.kakuhen.lines.length&&EVENTS.kakuhenEnd.lines.length);assert.ok(SHOWS.kakuhen&&SHOWS.kakuhenEnd);});

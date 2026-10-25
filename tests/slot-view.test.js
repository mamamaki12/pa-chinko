import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LAYOUT,hitSlot} from '../slot-view.js';
test('盤面のレバー・MAX BET・停止ボタンの当たり判定',()=>{const {lever,bet,stops}=LAYOUT;assert.equal(hitSlot(lever.x,lever.y),'lever');assert.equal(hitSlot(lever.x+16,lever.y-44),'lever');assert.equal(hitSlot(bet[0]+bet[2]/2,bet[1]+bet[3]/2),'bet');stops.x.forEach((x,i)=>{assert.equal(hitSlot(x,stops.y),`stop${i}`);assert.equal(hitSlot(x,stops.y+stops.r),`stop${i}`);});assert.equal(hitSlot(360,440),null);assert.equal(hitSlot(360,150),null);});
test('停止ボタンはリールの真下にある',()=>{LAYOUT.reels.forEach(([x,w],i)=>assert.equal(LAYOUT.stops.x[i],x+w/2));});

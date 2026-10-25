import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LAYOUT,hitSlot} from '../slot-view.js';
test('盤面のレバー・MAX BET・停止ボタンの当たり判定',()=>{const {lever,bet,stops}=LAYOUT;assert.equal(hitSlot(lever.x,lever.y),'lever');assert.equal(hitSlot(bet.x,bet.y),'bet');stops.x.forEach((x,i)=>{assert.equal(hitSlot(x,stops.y),`stop${i}`);assert.equal(hitSlot(x,stops.y+stops.r),`stop${i}`);});assert.equal(hitSlot(360,424),null);assert.equal(hitSlot(360,200),null);});
test('リールは窓の中に収まり、3コマ見える',()=>{const [wx,wy,ww,wh]=LAYOUT.window;for(const [x,w] of LAYOUT.reels)assert.ok(x>=wx&&x+w<=wx+ww);assert.ok(LAYOUT.reelY>=wy&&LAYOUT.reelY+LAYOUT.reelH<=wy+wh);assert.equal(Math.round(LAYOUT.reelH/LAYOUT.pitch),3);});

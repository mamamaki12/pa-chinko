import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LAYOUT,hitSlot,SYMBOL_SHEET} from '../slot-view.js';
import {REELS} from '../engine.js';
import {readFileSync} from 'node:fs';
test('盤面のレバー・MAX BET・停止ボタンの当たり判定',()=>{const {lever,bet,stops}=LAYOUT;assert.equal(hitSlot(lever.x,lever.y),'lever');assert.equal(hitSlot(bet.x,bet.y),'bet');stops.x.forEach((x,i)=>{assert.equal(hitSlot(x,stops.y),`stop${i}`);assert.equal(hitSlot(x,stops.y+stops.r),`stop${i}`);});assert.equal(hitSlot(360,424),null);assert.equal(hitSlot(360,200),null);});
test('リールは窓の中に収まり、3コマ見える',()=>{const [wx,wy,ww,wh]=LAYOUT.window;for(const [x,w] of LAYOUT.reels)assert.ok(x>=wx&&x+w<=wx+ww);assert.ok(LAYOUT.reelY>=wy&&LAYOUT.reelY+LAYOUT.reelH<=wy+wh);assert.equal(Math.round(LAYOUT.reelH/LAYOUT.pitch),3);});
test('図柄のイラストのシートに、リールの全図柄が並び、公開用にもある',()=>{
  for(const name of new Set(REELS.flat()))assert.ok(SYMBOL_SHEET.order.includes(name),name);
  for(const file of [SYMBOL_SHEET.path,`dist/${SYMBOL_SHEET.path}`]){const b=readFileSync(new URL(`../${file}`,import.meta.url));assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(b.toString('ascii',12,16),'VP8X');
    assert.equal(1+b.readUIntLE(24,3),SYMBOL_SHEET.w*3);assert.equal(1+b.readUIntLE(27,3),SYMBOL_SHEET.h*2);}
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {NAVIGATOR_ATLAS,FADE,portraitCell,portraitLayers} from '../navigator-art.js';
import {EVENTS,createNavi} from '../lcd-character.js';

test('ミニキャラの画像があり、すべての反応の表情に絵がある',()=>{
  assert.ok(existsSync(new URL('../'+NAVIGATOR_ATLAS.path,import.meta.url)));
  assert.ok(existsSync(new URL('../dist/'+NAVIGATOR_ATLAS.path,import.meta.url)));
  for(const e of Object.values(EVENTS))assert.ok(e.expr in NAVIGATOR_ATLAS.expressions,e.expr);
  assert.deepEqual(portraitCell('sora','surprise'),{column:2,row:0});assert.deepEqual(portraitCell('hana','sleepy'),{column:3,row:1});
});

test('表情は切り替えのときだけ短く重ねて入れ替わり、動きを減らす設定ではすぐ切り替わる',()=>{
  const n=createNavi('hana');assert.equal(portraitLayers(n,1).length,1);
  n.expr='happy';const start=portraitLayers(n,2);assert.equal(start.length,2);assert.equal(start[0].column,0);assert.equal(start[1].alpha,0);
  const mid=portraitLayers(n,2+FADE/2);assert.ok(mid[0].alpha>0&&mid[1].alpha>0);
  assert.deepEqual(portraitLayers(n,2+FADE),[{column:1,row:1,alpha:1}]);
  const r=createNavi('sora');portraitLayers(r,0,true);r.expr='surprise';assert.deepEqual(portraitLayers(r,1,true),[{column:2,row:0,alpha:1}]);
});

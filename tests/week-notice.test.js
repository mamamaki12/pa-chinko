import {test} from 'node:test';
import assert from 'node:assert/strict';
// The weekly notice on a small stand-in page, with a browser that cannot store anything (localStorage throws).
const el=()=>({textContent:'',value:'',style:{},classList:{toggle(){}},onchange:null});
const page={'#week-time':el(),'#week-progress':el(),'#week-box':el(),'#week-label':el(),'#pause-week':el(),'#message':el(),'#weekly-limit':el()};
globalThis.document={querySelector:s=>page[s]??null};
Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('storage blocked');}});
const {renderWeek,WEEK_NOTICE}=await import('../journal.js?week-notice');
test('今週の目安を超えたお知らせは1回だけ出し、保存できないブラウザでもくり返さない',()=>{const select=page['#weekly-limit'];select.value='3600';select.onchange();
  assert.equal(renderWeek([],1800),false);assert.equal(page['#message'].textContent,'');
  assert.equal(renderWeek([],3600),true);assert.equal(page['#message'].textContent,WEEK_NOTICE);assert.match(page['#week-label'].textContent,/超えました/);
  page['#message'].textContent='抽選が終了しました。';for(let i=0;i<5;i++)assert.equal(renderWeek([],3700+i),false);assert.equal(page['#message'].textContent,'抽選が終了しました。');
  select.value='7200';select.onchange();assert.equal(renderWeek([],7300),true);});
test('遊技していないとき（今回の時間が0）はお知らせを出さない',()=>{const select=page['#weekly-limit'];select.value='3600';select.onchange();page['#message'].textContent='';assert.equal(renderWeek([{date:new Date().toISOString(),seconds:4000,mode:'パチンコ'}],0),false);assert.equal(page['#message'].textContent,'');});

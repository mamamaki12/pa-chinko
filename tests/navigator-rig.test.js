import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {RIGS,REST,rigWeights,deform} from '../navigator-rig.js';
import {rigPose} from '../navigator-art.js';
import {createNavi} from '../lcd-character.js';

const near=(W,x,y)=>{let best=0,bd=1e9;for(let i=0;i<W.x.length;i++){const d=Math.hypot(W.x[i]-x,W.y[i]-y);if(d<bd){bd=d;best=i;}}return best;};

test('2人の4表情すべてに、首・腕・足・羽の位置が絵の中にある',()=>{
  assert.ok(existsSync(new URL('../dist/navigator-rig.js',import.meta.url)));
  for(const kind of ['sora','hana']){assert.equal(RIGS[kind].length,4);
    for(const r of RIGS[kind]){const pts=[r.head,...r.arms,...r.legs,...r.wings].flatMap(a=>[[a[0],a[1]],[a[2],a[3]]]);
      for(const [x,y] of pts)assert.ok(x>0&&x<384&&y>0&&y<512);assert.ok(['down','wave','chest'].includes(r.pose));}}
});

test('パーツの重みは0〜1で、重なっても合計が1を超えない',()=>{
  const W=rigWeights(RIGS.hana[0]);
  for(let i=0;i<W.x.length;i++){let s=0;for(const k of ['head','arm0','arm1','leg0','leg1','wing0','wing1']){assert.ok(W[k][i]>=0&&W[k][i]<=1);s+=W[k][i];}assert.ok(s<=1.0001);}
});

test('腕を上げると手が上がり、足は動かない。足を振ると足先が外へ出る',()=>{
  const rig=RIGS.sora[0],W=rigWeights(rig),rest=deform(rig,W,REST);
  for(let i=0;i<W.x.length;i++){assert.ok(Math.abs(rest[i*2]-W.x[i])<1e-3&&Math.abs(rest[i*2+1]-W.y[i])<1e-3);}
  const hand=near(W,rig.arms[0][2],rig.arms[0][3]),foot=near(W,rig.legs[0][2],rig.legs[0][3]);
  const up=deform(rig,W,{...REST,arms:[.6,0]});assert.ok(up[hand*2+1]<W.y[hand]-15);assert.equal(up[foot*2],W.x[foot]);
  const kick=deform(rig,W,{...REST,legs:[.3,0]});assert.ok(kick[foot*2]<W.x[foot]-8);
  const tilt=deform(rig,W,{...REST,head:[.1,0,0]}),top=near(W,rig.head[2],rig.head[3]-60);assert.ok(tilt[top*2]>W.x[top]+5);
});

test('反応ごとに腕・足・頭が動き、動きを減らす設定では止まる',()=>{
  const at=(pose,kind='hana')=>({...createNavi(kind),greeted:true,pose,poseAt:0,poseUntil:5,prio:3});
  const span=(n,rig,f)=>{let lo=1e9,hi=-1e9;for(let t=.3;t<2;t+=.01){const v=f(rigPose(n,t,rig,{gentle:false}));lo=Math.min(lo,v);hi=Math.max(hi,v);}return hi-lo;};
  assert.ok(span(at('wave'),RIGS.hana[1],p=>p.arms[0])>.4,'手を振る');
  assert.ok(span(at('cheer'),RIGS.hana[1],p=>p.legs[0])>.25,'跳ねて足が出る');
  assert.ok(span(at('watch'),RIGS.sora[0],p=>p.legs[0])>.2,'足をぶらぶら');
  assert.ok(span(at('clap'),RIGS.sora[1],p=>p.arms[1])>.25,'拍手');
  assert.ok(rigPose(at('watch'),1,RIGS.sora[0]).head[0]>.03,'画面のほうへ首をかしげる');
  assert.deepEqual(rigPose(at('cheer'),1,RIGS.hana[1],{reduced:true}),REST);
});

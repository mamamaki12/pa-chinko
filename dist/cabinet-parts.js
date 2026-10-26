// Machine parts: every element of AURORA and ASTRAL as a named part in one list — LEDs, nails, rails, pockets, the chance button,
// the LCD, reels, lamps, lever and buttons. Each part has a kind, a Japanese label, its shape on the 720×960 cabinet and a state
// (visible, lit, open), so the program finds, switches and draws elements part by part instead of treating the cabinet as one picture.
// painted: the element is part of the cabinet art and only its state is drawn over it (an LED lighting up, a glow, a pressed look).
// Shapes: {circle:[x,y,r]}, {ellipse:[x,y,rx,ry]}, {rect:[x,y,w,h]}, {line:[x1,y1,x2,y2]}, {poly:[[x,y],…]}.
import {BOARD,ATTACKER,makePins} from './engine.js';
import {LAYOUT} from './slot-view.js';
import {LED_PARTS,createLeds} from './cabinet-leds.js';

export const KINDS={glass:'ガラス',lcd:'液晶',led:'LED',nail:'釘',rail:'ガイドレール',pocket:'入賞口',attacker:'アタッカー',button:'ボタン',handle:'ハンドル',hold:'保留ランプ',reelWindow:'リール窓',reel:'リール',lamp:'ランプ',counter:'表示器',lever:'レバー',stop:'停止ボタン'};

function pachinkoParts(){const {cx,cy,r,display:d,button:b}=BOARD;return [
  {id:'glass',kind:'glass',label:'盤面ガラス',painted:true,shape:{circle:[cx,cy,r]}},
  {id:'lcd',kind:'lcd',label:'液晶',shape:{rect:[d.x1,d.y1,d.x2-d.x1,d.y2-d.y1]}},
  ...LED_PARTS.aurora.map(ledPart),
  // Nails are the gold nails painted on the board (engine.js NAILS); the ball bounces off the visible ones.
  ...makePins().map((p,i)=>({id:p.id??`nail-${String(i+1).padStart(3,'0')}`,kind:'nail',label:`釘 ${i+1}`,group:'nails',painted:true,shape:{circle:[p.x,p.y,p.r]}})),
  ...BOARD.guides.map((g,i)=>({id:`guide${i+1}`,kind:'rail',label:['液晶上のガイド左','液晶上のガイド右','ヘソの左の壁','ヘソの右の壁'][i]??`ガイド ${i+1}`,shape:{line:g}})),
  {id:'start',kind:'pocket',label:'START入賞口',shape:{rect:[338,606,44,16]}},
  {id:'attacker',kind:'attacker',label:'大入賞口',shape:{rect:[ATTACKER.x1,ATTACKER.y1,ATTACKER.x2-ATTACKER.x1,ATTACKER.y2-ATTACKER.y1]},open:false},
  {id:'button',kind:'button',label:'チャンスボタン',painted:true,shape:{ellipse:[b.x,b.y,b.rx,b.ry]}},
  {id:'handle',kind:'handle',label:'発射ハンドル',painted:true,shape:{circle:[628,826,44]}},
  ...[0,1,2,3].map(i=>({id:`hold${i+1}`,kind:'hold',label:`保留 ${i+1}`,shape:{circle:[d.x1+24+i*16,d.y2-20,5]}})),
];}

function slotParts(){const {window:w,reels,reelY,reelH,lamps,plates,lever,bet,stops}=LAYOUT;return [
  {id:'lcd',kind:'lcd',label:'液晶',shape:{rect:[156,102,394,196]}},
  ...LED_PARTS.astral.map(ledPart),
  {id:'reelWindow',kind:'reelWindow',label:'リール窓',painted:true,shape:{rect:w}},
  ...reels.map(([x,rw],i)=>({id:`reel${i+1}`,kind:'reel',label:['左リール','中リール','右リール'][i],shape:{rect:[x,reelY,rw,reelH]}})),
  ...lamps.left.map((c,k)=>({id:`bet${3-k}`,kind:'lamp',label:`ベットランプ ${3-k}`,painted:true,shape:{circle:c}})),
  ...[['start','STARTランプ'],['replay','REPLAYランプ'],['wait','WAITランプ']].map(([id,label],i)=>({id,kind:'lamp',label,painted:true,shape:{circle:lamps.right[i]}})),
  {id:'credit',kind:'counter',label:'クレジット',painted:true,shape:{rect:plates.credit}},
  {id:'payout',kind:'counter',label:'払い出し',painted:true,shape:{rect:plates.payout}},
  {id:'lever',kind:'lever',label:'レバー',painted:true,shape:{circle:[lever.x,lever.y,lever.r]}},
  {id:'maxbet',kind:'button',label:'MAX BET',painted:true,shape:{circle:[bet.x,bet.y,bet.r]}},
  ...stops.x.map((x,i)=>({id:`stop${i+1}`,kind:'stop',label:`停止ボタン ${i+1}`,painted:true,shape:{circle:[x,stops.y,stops.r]}})),
];}
function ledPart(p){return {id:`led-${p.id}`,kind:'led',label:p.label,group:p.group,painted:true,shape:{poly:p.poly}};}

export const MACHINES={aurora:pachinkoParts,astral:slotParts};

// The part list of one machine with its states. Targets: a part id, a kind, a group, 'all', or a list of those.
export function createParts(machine){
  const list=MACHINES[machine]().map(p=>({visible:true,lit:false,...p})),byId=new Map(list.map(p=>[p.id,p]));
  const pick=target=>{const t=[].concat(target);return list.filter(p=>t.includes('all')||t.includes(p.id)||t.includes(p.kind)||t.includes(p.group));};
  // version goes up on every set(), so callers can tell when to re-read derived lists such as the nails.
  return {machine,list,version:0,
    // LED patterns (on / off / blink / breathe / chase, colour) per LED part: leds.set('led id or group',{mode:'blink'}) — see cabinet-leds.js.
    leds:createLeds(machine),
    get:id=>byId.get(id),
    find:target=>pick(target),
    // Changes the state of the targeted parts, e.g. set('attacker',{open:true}), set('nail',{visible:false}).
    set(target,patch){for(const p of pick(target))Object.assign(p,patch);this.version++;return this;},
    // The visible nails as {id,x,y,r}, the form advanceBall() takes.
    nails:()=>list.filter(p=>p.kind==='nail'&&p.visible).map(p=>{const [x,y,r]=p.shape.circle;return {id:p.id,x,y,r};}),
    lit:id=>!!byId.get(id)?.lit,
    shown:id=>byId.get(id)?.visible!==false,
  };
}

// Bounding box [x,y,w,h] of a shape.
export function bounds(s){
  if(s.circle){const [x,y,r]=s.circle;return [x-r,y-r,r*2,r*2];}
  if(s.ellipse){const [x,y,rx,ry]=s.ellipse;return [x-rx,y-ry,rx*2,ry*2];}
  if(s.rect)return s.rect;
  const pts=s.line?[[s.line[0],s.line[1]],[s.line[2],s.line[3]]]:s.poly,xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  return [Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];
}

// Traces a part's shape as the current path.
export function tracePart(ctx,s){ctx.beginPath();
  if(s.circle){const [x,y,r]=s.circle;ctx.arc(x,y,r,0,Math.PI*2);}
  else if(s.ellipse){const [x,y,rx,ry]=s.ellipse;ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);}
  else if(s.rect)ctx.rect(...s.rect);
  else if(s.line){ctx.moveTo(s.line[0],s.line[1]);ctx.lineTo(s.line[2],s.line[3]);}
  else{s.poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
}

// Part map (open the page with ?parts): outlines every part in its kind's colour, with its id, to check where each one sits.
const COLORS={glass:'#7fd4ff',lcd:'#9fffa0',led:'#ff7ad0',nail:'#ffe066',rail:'#7fd4ff',pocket:'#ffffff',attacker:'#ff9a3c',button:'#ffffff',handle:'#c0c0ff',hold:'#ffffff',reelWindow:'#9fffa0',reel:'#ffffff',lamp:'#ffb43a',counter:'#ff5a3c',lever:'#7fc0ff',stop:'#ff6060'};
export function drawPartMap(ctx,parts){ctx.save();ctx.font='9px sans-serif';ctx.textBaseline='top';
  for(const p of parts.list){const c=COLORS[p.kind]??'#fff';ctx.strokeStyle=c;ctx.lineWidth=p.kind==='nail'?1:1.5;ctx.setLineDash(p.visible?[]:[3,3]);tracePart(ctx,p.shape);ctx.stroke();
    if(p.kind!=='nail'){const [x,y]=bounds(p.shape);ctx.fillStyle='#000a';ctx.fillRect(x,y,ctx.measureText(p.id).width+4,11);ctx.fillStyle=c;ctx.fillText(p.id,x+2,y+1);}}
  ctx.restore();}

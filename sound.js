// Original synthesized cabinet sounds and music (Web Audio only, no recorded audio). Small wins stay short and quiet; only the start
// of a bonus gets a fanfare.
import {createMusic,stepLength,STEPS} from './music.js';
let ctx,master,bgm,noise,nails=[],pinVoices=0,lastTick=0,lastVoice=0,lastDrain=0,lastFrame=0,hum=null,humSeen=0;
const now=()=>ctx.currentTime;
function init(){if(ctx)return;ctx=new AudioContext();const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;master=ctx.createGain();master.gain.value=0;master.connect(comp);bgm=ctx.createGain();bgm.gain.value=0;bgm.connect(comp);comp.connect(ctx.destination);noise=ctx.createBuffer(1,ctx.sampleRate*.5,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;for(let k=0;k<12;k++)nails.push(nailRing(1900*2**(((k*7)%12)/12*.5)));}
// What you hear of a ball hitting a nail is mostly the board, not the nail. The brass nail (about 1.8 mm thick) is far too thin to
// push much air itself; its ring travels into the board, which radiates it, and the sound reaches you through the double glass,
// which takes the edge off the highs. So each hit is a short wooden "kotsu" from a few damped board resonances (about 0.5–2.3 kHz),
// with the nail's ring (about 1.9–2.7 kHz, two bending directions slightly apart) underneath and a contact click softened by the glass.
// Each nail gets its own board spot and tuning, rendered once into a buffer.
function nailRing(f){const sr=ctx.sampleRate,n=Math.floor(sr*.08),buf=ctx.createBuffer(1,n,sr),d=buf.getChannelData(0),r=(a,b)=>a+Math.random()*(b-a),ph=r(0,6.3);
  const board=[[r(480,760),1,.012],[r(950,1400),.75,.008],[r(1700,2300),.45,.005]],glass=1-Math.exp(-2*Math.PI*4200/sr);let lp=0,click=0,peak=0;
  for(let i=0;i<n;i++){const t=i/sr,w=2*Math.PI*t;let v=.3*Math.exp(-t/.02)*Math.sin(w*f+ph)+.18*Math.exp(-t/.015)*Math.sin(w*f*1.013);
    for(const [bf,a,tau] of board)v+=a*Math.exp(-t/tau)*Math.sin(w*bf);
    if(t<.003){click+=.35*((Math.random()*2-1)*Math.exp(-t/.0005)-click);v+=click*1.4;}
    lp+=glass*(v-lp);d[i]=lp;peak=Math.max(peak,Math.abs(lp));}
  for(let i=0;i<n;i++)d[i]*=(i>n-200?(n-i)/200:1)/peak;return buf;}
// Board position (0–720) → stereo position.
function panned(node,x){if(x==null||!ctx.createStereoPanner)return node;const p=ctx.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,(x-360)/360))*.6;node.connect(p);return p;}
function env(g,t,peak,attack,decay){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+attack+decay);}
// Tone with pitch drop: freq → freq*drop over the decay.
function osc(freq,t,{type='sine',peak=.2,attack=.003,decay=.1,drop=1,to=master}={}){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(drop!==1)o.frequency.exponentialRampToValueAtTime(freq*drop,t+attack+decay);env(g,t,peak,attack,decay);o.connect(g);g.connect(to);o.start(t);o.stop(t+attack+decay+.02);}
// Filtered noise burst for mechanical clacks and rattles.
function hiss(t,{freq=2000,q=1,kind='bandpass',peak=.2,attack=.002,decay=.05,x}={}){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;s.playbackRate.value=.8+Math.random()*.4;f.type=kind;f.frequency.value=freq;f.Q.value=q;env(g,t,peak,attack,decay);s.connect(f);f.connect(g);panned(g,x).connect(master);s.start(t,Math.random()*.4);s.stop(t+attack+decay+.02);}
// Small steel-on-steel tick, shared by pins, ball drops and medals.
function ping(t,freq,peak){osc(freq,t,{peak,decay:.035});osc(freq*2.76,t,{peak:peak*.35,decay:.02});hiss(t,{freq:freq*1.5,q:3,peak:peak*.5,decay:.012});}
// Steel balls knocking together and onto the plastic tray, one ball: the "jara" of a payout.
function clink(t,peak){osc(3400+Math.random()*2200,t,{peak,attack:.001,decay:.012});osc(6500+Math.random()*1500,t,{peak:peak*.3,attack:.001,decay:.006});hiss(t,{freq:1300+Math.random()*500,q:1.5,peak:peak*.8,decay:.02});}
function bell(freq,t,peak=.12,decay=.45){osc(freq,t,{type:'triangle',peak,decay});osc(freq*2,t,{peak:peak*.3,decay:decay*.6});}
function startHum(t){const o=ctx.createOscillator(),o2=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();o.type='sawtooth';o.frequency.value=58;o2.type='triangle';o2.frequency.value=117;f.type='lowpass';f.frequency.value=320;lfo.frequency.value=8;depth.gain.value=.012;lfo.connect(depth);depth.connect(g.gain);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.035,t+.25);o.connect(f);o2.connect(f);f.connect(g);g.connect(master);[o,o2,lfo].forEach(x=>x.start(t));hum={g,nodes:[o,o2,lfo]};}
function stopHum(){if(!hum)return;const t=now(),{g,nodes}=hum;hum=null;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(Math.max(g.gain.value,.0001),t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);nodes.forEach(x=>x.stop(t+.2));}
// The reel hum and LCD ticks are kept alive by calls every step; when the calls stop (pause, hidden tab, sound off) they fade out.
setInterval(()=>{if(hum&&performance.now()-humSeen>150)stopHum();},100);
const sounds={
  on(t){bell(880,t,.06,.25);bell(1320,t+.08,.05,.3);},
  // Launch: the spring hammer snaps against the ball, which then rolls up the steel rail (rumble panning across) and clicks off its end.
  launch(t,{roll=.6}={}){hiss(t,{freq:2200,q:2,peak:.2,decay:.012,x:80});osc(1450,t,{type:'triangle',peak:.07,decay:.04,drop:.95});osc(115,t,{peak:.14,decay:.06,drop:.5});
    const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();s.buffer=noise;s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(1700,t);f.frequency.linearRampToValueAtTime(2500,t+roll);f.Q.value=1.4;
    g.gain.setValueAtTime(.0001,t+.01);g.gain.exponentialRampToValueAtTime(.05,t+.05);g.gain.setValueAtTime(.05,t+roll*.8);g.gain.exponentialRampToValueAtTime(.0001,t+roll);lfo.frequency.value=38;depth.gain.value=.025;lfo.connect(depth);depth.connect(g.gain);
    s.connect(f);f.connect(g);let o=g;if(ctx.createStereoPanner){o=ctx.createStereoPanner();o.pan.setValueAtTime(-.55,t);o.pan.linearRampToValueAtTime(-.1,t+roll);g.connect(o);}o.connect(master);s.start(t,Math.random()*.4);lfo.start(t);s.stop(t+roll+.02);lfo.stop(t+roll+.02);
    ping(t+roll,2600,.03);},
  // Ball on nail. impact is the ball's speed into the nail (board px/s, ~30 soft to ~600 hard): harder hits are louder and a little brighter.
  pin(t,{impact=200,nail=0,x}={}){if(impact<12||pinVoices>=14&&impact<350)return;const k=Math.min(1,impact/600),s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=nails[nail%nails.length];s.playbackRate.value=.985+Math.random()*.03;f.type='lowpass';f.frequency.value=1500+4500*k*k;f.Q.value=.5;g.gain.value=.55*k**1.1+.012;s.connect(f);f.connect(g);panned(g,x).connect(master);pinVoices++;s.onended=()=>pinVoices--;s.start(t);},
  // Plastic frame around the LCD.
  frame(t,{impact=200,x}={}){const p=performance.now();if(p-lastFrame<25)return;lastFrame=p;const k=Math.min(1,impact/500);hiss(t,{freq:1700,q:2.5,peak:.2*k,decay:.012,x});osc(820+Math.random()*120,t,{type:'triangle',peak:.12*k,decay:.03,drop:.9});},
  // Ball leaves the board through the out hole at the bottom.
  drain(t,{x}={}){const p=performance.now();if(p-lastDrain<40)return;lastDrain=p;osc(300+Math.random()*60,t,{type:'triangle',peak:.035,decay:.05,drop:.7});hiss(t,{freq:900,kind:'lowpass',peak:.04,decay:.03,x});},
  // Ball into the start pocket: a plastic "kakon", then the chime.
  start(t){hiss(t,{freq:1500,q:3,peak:.16,decay:.018});osc(640,t,{type:'triangle',peak:.12,decay:.05,drop:.8});bell(1318.5,t+.04,.08,.35);bell(1760,t+.14,.07,.45);},
  // Prize balls pouring into the upper tray, count balls.
  payout(t,count=3){for(let i=0;i<count;i++){const at=t+.18+i*.045+Math.random()*.02;clink(at,.1+Math.random()*.05);if(Math.random()<.6)clink(at+.01+Math.random()*.02,.05);}},
  lcd(t){const p=performance.now();if(p-lastTick<83)return;lastTick=p;osc(1180,t,{type:'square',peak:.018,decay:.018});},
  lcdStop(t){[0,.09,.18].forEach((d,i)=>{hiss(t+d,{freq:900,q:2,peak:.08,decay:.03});osc(420-i*60,t+d,{type:'triangle',peak:.07,decay:.08,drop:.7});});},
  spin(t){hiss(t,{freq:700,kind:'lowpass',peak:.18,decay:.09});osc(150,t,{peak:.15,decay:.12,drop:.45});osc(1650,t+.04,{peak:.025,decay:.05});},
  reel(t){humSeen=performance.now();if(!hum)startHum(t);},
  stop(t,i=0){hiss(t,{freq:600-i*80,kind:'lowpass',peak:.2,decay:.05});osc(190-i*20,t,{peak:.16,decay:.07,drop:.5});ping(t+.005,1900,.025);},
  // LCD character's voice: short pitched blips while a line is typed out (no recorded speech).
  voice(t,pitch=1){const p=performance.now();if(p-lastVoice<75)return;lastVoice=p;const f=(560+Math.random()*180)*pitch;osc(f,t,{type:'triangle',peak:.045,attack:.006,decay:.045,drop:1.1});osc(f*2.01,t,{peak:.012,attack:.006,decay:.03});},
  // Chance button: a rising call when it asks to be pressed, and a solid click with a short sparkle when pressed (same for wins and misses).
  push(t){bell(988,t,.06,.22);bell(1480,t+.1,.06,.3);},
  press(t){hiss(t,{freq:500,kind:'lowpass',peak:.25,decay:.06});osc(160,t,{peak:.2,decay:.12,drop:.5});bell(1760,t+.04,.05,.3);},
  medal(t,count=1){bell(784,t,.06,.3);bell(1046.5,t+.1,.05,.35);const n=Math.min(8,Math.max(2,Math.ceil(count/10)));for(let i=0;i<n;i++)ping(t+.25+i*.09+Math.random()*.02,1700+Math.random()*700,.035);},
};
// Plays a named sound at the given volume (0–1). Unknown names are ignored.
export function play(name,volume,arg){const fn=sounds[name];if(!fn)return;init();void ctx.resume();master.gain.setTargetAtTime(volume*.9,now(),.02);fn(now()+.005,arg);}

// Background music (music.js). Call music(track,volume) every frame while it should play: it starts the track, switches at the next
// 16th step when the track changes, and fades out by itself when the calls stop (pause, hidden tab, sound off), like the reel hum.
let song=null,songStep=0,songNext=0,songSeen=0,songTimer=null,synth=null;
export function music(name,volume){init();void ctx.resume();songSeen=performance.now();bgm.gain.setTargetAtTime(volume*.6,now(),.15);
  if(!synth)synth=createMusic(ctx,bgm);if(name!==song){if(song)synth.cut(Math.max(now(),songNext));song=name;songStep=0;}
  if(!songTimer){songNext=now()+.08;songTimer=setInterval(pump,25);pump();}}
function pump(){if(performance.now()-songSeen>250){clearInterval(songTimer);songTimer=null;bgm.gain.setTargetAtTime(0,now(),.12);synth.cut(now()+.3);song=null;return;}
  while(songNext<now()+.15){synth.schedule(song,songStep,songNext);songNext+=stepLength(song);songStep=(songStep+1)%STEPS;}}
// Bonus fanfare (music.js FANFARE) at the sound-effect volume, through its own synth so the BGM can be cut meanwhile.
let fx=null;
export function fanfare(name,volume){init();void ctx.resume();master.gain.setTargetAtTime(volume*.9,now(),.02);fx??=createMusic(ctx,master);fx.fanfare(name,now()+.02);}

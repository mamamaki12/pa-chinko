// Original synthesized cabinet sounds (Web Audio only, no recorded audio). Win sounds stay short and quiet on purpose.
let ctx,master,noise,lastPin=0,lastTick=0,lastVoice=0,hum=null,humSeen=0;
const now=()=>ctx.currentTime;
function init(){if(ctx)return;ctx=new AudioContext();const comp=ctx.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;master=ctx.createGain();master.gain.value=0;master.connect(comp);comp.connect(ctx.destination);noise=ctx.createBuffer(1,ctx.sampleRate*.5,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
function env(g,t,peak,attack,decay){g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+attack+decay);}
// Tone with pitch drop: freq → freq*drop over the decay.
function osc(freq,t,{type='sine',peak=.2,attack=.003,decay=.1,drop=1,to=master}={}){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(drop!==1)o.frequency.exponentialRampToValueAtTime(freq*drop,t+attack+decay);env(g,t,peak,attack,decay);o.connect(g);g.connect(to);o.start(t);o.stop(t+attack+decay+.02);}
// Filtered noise burst for mechanical clacks and rattles.
function hiss(t,{freq=2000,q=1,kind='bandpass',peak=.2,attack=.002,decay=.05}={}){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;s.playbackRate.value=.8+Math.random()*.4;f.type=kind;f.frequency.value=freq;f.Q.value=q;env(g,t,peak,attack,decay);s.connect(f);f.connect(g);g.connect(master);s.start(t,Math.random()*.4);s.stop(t+attack+decay+.02);}
// Small steel-on-steel tick, shared by pins, ball drops and medals.
function ping(t,freq,peak){osc(freq,t,{peak,decay:.035});osc(freq*2.76,t,{peak:peak*.35,decay:.02});hiss(t,{freq:freq*1.5,q:3,peak:peak*.5,decay:.012});}
function bell(freq,t,peak=.12,decay=.45){osc(freq,t,{type:'triangle',peak,decay});osc(freq*2,t,{peak:peak*.3,decay:decay*.6});}
function startHum(t){const o=ctx.createOscillator(),o2=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();o.type='sawtooth';o.frequency.value=58;o2.type='triangle';o2.frequency.value=117;f.type='lowpass';f.frequency.value=320;lfo.frequency.value=8;depth.gain.value=.012;lfo.connect(depth);depth.connect(g.gain);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.035,t+.25);o.connect(f);o2.connect(f);f.connect(g);g.connect(master);[o,o2,lfo].forEach(x=>x.start(t));hum={g,nodes:[o,o2,lfo]};}
function stopHum(){if(!hum)return;const t=now(),{g,nodes}=hum;hum=null;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(Math.max(g.gain.value,.0001),t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);nodes.forEach(x=>x.stop(t+.2));}
// The reel hum and LCD ticks are kept alive by calls every step; when the calls stop (pause, hidden tab, sound off) they fade out.
setInterval(()=>{if(hum&&performance.now()-humSeen>150)stopHum();},100);
const sounds={
  on(t){bell(880,t,.06,.25);bell(1320,t+.08,.05,.3);},
  launch(t){hiss(t,{freq:1800,q:1.5,peak:.12,decay:.03});osc(95,t,{peak:.1,decay:.05,drop:.6});},
  pin(t,power=1){const p=performance.now();if(p-lastPin<28)return;lastPin=p;ping(t,3200+Math.random()*1600,Math.min(.09,.02+power*.0004));},
  start(t){ping(t,2600,.08);bell(1318.5,t+.02,.09,.35);bell(1760,t+.12,.08,.45);},
  lcd(t){const p=performance.now();if(p-lastTick<83)return;lastTick=p;osc(1180,t,{type:'square',peak:.018,decay:.018});},
  lcdStop(t){[0,.09,.18].forEach((d,i)=>{hiss(t+d,{freq:900,q:2,peak:.08,decay:.03});osc(420-i*60,t+d,{type:'triangle',peak:.07,decay:.08,drop:.7});});},
  win(t){[523.3,659.3,784,1046.5].forEach((f,i)=>bell(f,t+.25+i*.13,.07,.5));for(let i=0;i<10;i++)ping(t+.85+i*.07+Math.random()*.03,2400+Math.random()*1200,.03);},
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

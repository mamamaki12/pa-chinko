// Background music for the two machines, written for this app and synthesized live with Web Audio (no recorded audio).
// Each track loops 8 bars of 16th-note steps with one chord per bar. Melodies are in 8th notes: a note name starts a note,
// '-' holds the previous note and '.' is a rest. Drum and bass rows are 16 steps per bar (bass: r root, o octave up, f fifth,
// '-' hold, '.' rest). The music follows only what the screen already shows (reach, battle, jackpot rounds, BIG), so it never hints at a result.
const NAMES={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const KINDS={'':[0,4,7],m:[0,3,7],maj7:[0,4,7,11],m7:[0,3,7,10],'7':[0,4,7,10],'6':[0,4,7,9]};
export function noteNumber(s){const m=/^([A-G][#b]?)(\d)$/.exec(s);if(!m)throw new Error(`bad note ${s}`);return (+m[2]+1)*12+NAMES[m[1]];}
export function parseChord(s){const m=/^([A-G][#b]?)(.*)$/.exec(s);if(!m||!(m[2] in KINDS))throw new Error(`bad chord ${s}`);return {root:NAMES[m[1]],tones:KINDS[m[2]]};}
// Melody → [{step,note,len}] in 16th steps.
export function parseMelody(s){const out=[];s.replace(/\|/g,' ').trim().split(/\s+/).forEach((t,i)=>{const last=out[out.length-1];if(t==='-'){if(last&&last.step+last.len===i*2)last.len+=2;}else if(t!=='.')out.push({step:i*2,note:noteNumber(t),len:2});});return out;}
const freq=n=>440*2**((n-69)/12);

// AURORA (pachinko, gold and pink, floating castle): bright pop in D; the reach turns to B minor and speeds up; the rounds are a fanfare.
// ASTRAL (pachislot, blue and silver, stars): a calm starry groove with bells in C; BIG is a driving A-minor dance track.
export const TRACKS={
  aurora:{bpm:128,chords:'G A F#m Bm Em7 A D D',
    lead:'D5 E5 F#5 - A5 - F#5 E5 | E5 - - D5 E5 - C#5 - | C#5 D5 E5 - A5 - E5 D5 | D5 - - - . . F#5 E5 | G5 - F#5 G5 - A5 B5 - | A5 - E5 - C#6 - B5 A5 | A5 - - F#5 - - D5 E5 | F#5 - - - - - . .',
    bass:'r-r-o-r-r-r-o-r-',drums:{k:'x.....x.x.......',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},fill:{s:'....x.......x.xx'},
    lead_:'pop',arp:'up',pad:'hold'},
  'aurora-reach':{bpm:150,chords:'Bm G Em F# Bm G Em F#',
    lead:'F#5 - - - - - E5 F#5 | G5 - - - F#5 - E5 - | B5 - - - A5 - G5 - | A#5 - - - C#6 - - - | D6 - - - C#6 - B5 - | B5 - - - A5 - G5 - | G5 - F#5 - E5 - G5 - | F#5 - - - - - - -',
    bass:'rrorrrorrrorrror',drums:{k:'x...x...x...x...',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'},fill:{s:'....x...x.xxxxxx'},
    lead_:'strings',arp:'none',pad:'pulse',crash:true},
  // バトルリーチ: a driving E-minor battle theme, faster than the reach.
  'aurora-battle':{bpm:168,chords:'Em C D B Em C Am B',
    lead:'E5 - G5 - B5 - E6 - | E6 - D6 - C6 - B5 - | A5 - D6 - F#6 - E6 D6 | D#6 - - - B5 - - - | E6 - B5 - G5 - E5 - | G5 - C6 - E6 - G6 - | A5 - C6 - E6 - A6 - | F#6 - - - D#6 - B5 -',
    bass:'rrorrrorrrorrror',drums:{k:'x..x..x.x..x..x.',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'},fill:{s:'....x...x.xxxxxx'},
    lead_:'strings',arp:'up',pad:'pulse',crash:true},
  // 確変 (ST): a quick, sparkling B-minor groove for the aurora night, between the calm base track and the reach.
  'aurora-st':{bpm:144,chords:'Bm G D A Bm G Em F#',
    lead:'F#5 - B5 - D6 - C#6 B5 | D6 - - - B5 - G5 - | A5 - D6 - F#6 - E6 D6 | C#6 - - - A5 - - - | B5 - D6 - F#6 - E6 F#6 | G6 - - - F#6 - D6 - | E6 - G6 - F#6 - E6 - | C#6 - - - A#5 - C#6 -',
    bass:'r-o-r-or-r-o-r-o',drums:{k:'x...x...x...x...',s:'....x.......x...',h:'.xxx.xxx.xxx.xxx'},fill:{s:'....x.......x.xx'},
    lead_:'bell',arp:'up',pad:'pulse'},
  'aurora-bonus':{bpm:160,chords:'D A Bm F#m G D G A',
    lead:'A5 - D6 - - - C#6 D6 | E6 - - - C#6 - A5 - | B5 - D6 - F#6 - E6 D6 | C#6 - - - A5 - - - | B5 - D6 - G6 - F#6 E6 | F#6 - - - D6 - A5 - | B5 - - D6 - - E6 - | E6 - - - C#6 - E6 -',
    bass:'r-o-r-o-r-o-r-o-',drums:{k:'x...x...x...x...',c:'....x.......x...',h:'.x.x.x.x.x.x.x.x',o:'..x...x...x...x.'},fill:{c:'....x.......x.xx'},
    lead_:'brass',shift:-12,arp:'up',pad:'hold',crash:true},
  astral:{bpm:108,chords:'Fmaj7 G6 Em7 Am7 Dm7 Em7 Fmaj7 G',
    lead:'E6 - - C6 - - A5 - | B5 - - D6 - - G5 - | G5 - B5 - E6 - D6 - | C6 - - - . . . . | D6 - - A5 - - F5 - | G5 - - B5 - - E6 - | A5 - C6 - E6 - G6 - | D6 - - - B5 - . .',
    bass:'r-----r-r-----f-',drums:{k:'x.......x.x.....',r:'....x.......x...',h:'..x...x...x...x.'},fill:{r:'....x.......x.x.'},
    lead_:'bell',arp:'drift',pad:'soft'},
  'astral-bonus':{bpm:140,chords:'Am F C G Am F C E',
    lead:'E5 - A5 - C6 - B5 A5 | C6 - - - A5 - F5 - | G5 - C6 - E6 - D6 C6 | D6 - - - B5 - G5 - | A5 - C6 - E6 - - D6 | C6 - - - A5 - C6 - | E6 - - - G6 - E6 - | B5 - - - G#5 - - -',
    bass:'..r-..r-..r-..r-',drums:{k:'x...x...x...x...',c:'....x.......x...',h:'xx.xxx.xxx.xxx.x',o:'..x...x...x...x.'},fill:{c:'....x.......xxxx'},
    lead_:'saw',arp:'up',pad:'hold',crash:true},
};
// Parsed form of each track: chords per bar and the melody as note events.
const SONGS=Object.fromEntries(Object.entries(TRACKS).map(([k,t])=>[k,{...t,bars:t.chords.split(' ').map(parseChord),notes:parseMelody(t.lead)}]));
export const BARS=8,STEPS=BARS*16;
export const stepLength=name=>60/TRACKS[name].bpm/4;
// Which track fits what the machine is showing now.
export function trackFor({mode,reach=false,battle=false,bonus=false,st=false}){return mode==='slot'?(bonus?'astral-bonus':'astral'):bonus?'aurora-bonus':battle?'aurora-battle':reach?'aurora-reach':st?'aurora-st':'aurora';}

// Fanfare for the start of a bonus (7-7-7 on ASTRAL, a jackpot on AURORA), about 3.4 s: brass in triplets, "ta-ta-ta TAA,
// ta-ta-ta-ta TAAA", over a held chord, with timpani hits and a roll, crash cymbals and bells rising at the end. It is written
// once in C (times and lengths in beats) and played in each machine's key and tempo.
export const FANFARE={
  brass:[[0,.3,'G4'],[1/3,.3,'G4'],[2/3,.3,'G4'],[1,1.4,'C5'],[2.5,.4,'A4'],[3,.4,'B4'],[3.5,.4,'C5'],[4,.4,'D5'],[4.5,2.6,'E5']],
  chords:[[1,1.4,['E4','G4']],[4.5,2.6,['C4','G4','C5','G5']]],
  bass:[[1,1.4,'C2'],[4.5,2.6,'C2']],
  timpani:[0,1,4.5],roll:[3.5,4.5],crash:[1,4.5],
  bells:[[4.75,'C6'],[5,'E6'],[5.25,'G6'],[5.5,'C7'],[5.75,'E7']],
};
export const FANFARES={astral:{bpm:132,key:0},aurora:{bpm:138,key:2}};
export const fanfareLength=name=>8*60/FANFARES[name].bpm;

// Creates the synthesizer on an AudioContext (or OfflineAudioContext) feeding `out`. schedule(name,step,t) plays one 16th step at time t;
// cut(t) fades out notes still sounding (used when the track changes).
export function createMusic(ctx,out){
  const sr=ctx.sampleRate,noise=ctx.createBuffer(1,sr,sr),nd=noise.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  // Room: a generated hall reverb (decaying stereo noise) and a tempo-synced echo for the lead, bells and arpeggio.
  const hall=ctx.createBuffer(2,Math.floor(sr*2.2),sr);for(let c=0;c<2;c++){const d=hall.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/sr*2.6)*(i<sr*.012?i/(sr*.012):1);}
  const verb=ctx.createConvolver(),verbIn=ctx.createGain(),verbOut=ctx.createGain();verb.buffer=hall;verbIn.connect(verb);verb.connect(verbOut);verbOut.gain.value=.5;verbOut.connect(out);
  const echo=ctx.createDelay(1.5),echoIn=ctx.createGain(),fb=ctx.createGain(),echoTone=ctx.createBiquadFilter();echoTone.type='lowpass';echoTone.frequency.value=2600;fb.gain.value=.3;echoIn.connect(echo);echo.connect(echoTone);echoTone.connect(fb);fb.connect(echo);echoTone.connect(out);echoTone.connect(verbIn);
  const live=new Set();let echoBpm=0;
  const pan=(node,p)=>{if(!p||!ctx.createStereoPanner)return node;const s=ctx.createStereoPanner();s.pan.value=p;node.connect(s);return s;};
  // One synth note: oscillators (wave, detune in cents) → lowpass (with an opening sweep) → envelope → dry/echo/reverb sends.
  function note(t,dur,f,{wave='sawtooth',det=[0],cut=2000,sweep=1,q=.7,gain=.1,a=.01,r=.12,vib=0,p=0,dry=1,wet=0,room=.2,hold=true}={}){
    const g=ctx.createGain(),flt=ctx.createBiquadFilter(),end=t+dur+r;flt.type='lowpass';flt.Q.value=q;flt.frequency.setValueAtTime(cut*sweep,t);if(sweep!==1)flt.frequency.exponentialRampToValueAtTime(cut,t+Math.min(dur,.25));
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+a);if(hold)g.gain.setValueAtTime(gain,t+Math.max(a,dur));else g.gain.exponentialRampToValueAtTime(gain*.02,t+dur);g.gain.linearRampToValueAtTime(0,end);
    const oscs=det.map(c=>{const o=ctx.createOscillator();o.type=wave;o.frequency.value=f;o.detune.value=c;o.connect(flt);o.start(t);o.stop(end+.02);return o;});
    if(vib&&dur>.3){const l=ctx.createOscillator(),d=ctx.createGain();l.frequency.value=5.5;d.gain.setValueAtTime(0,t);d.gain.linearRampToValueAtTime(vib,t+Math.min(.5,dur));l.connect(d);oscs.forEach(o=>d.connect(o.detune));l.start(t);l.stop(end+.02);oscs.push(l);}
    flt.connect(g);const o=pan(g,p);if(dry){const v=ctx.createGain();v.gain.value=dry;o.connect(v);v.connect(out);}if(wet){const v=ctx.createGain();v.gain.value=wet;o.connect(v);v.connect(echoIn);}if(room){const v=ctx.createGain();v.gain.value=room;o.connect(v);v.connect(verbIn);}
    if(dur>.3){const item={g,end};live.add(item);oscs[0].onended=()=>live.delete(item);}}
  // Bell / electric-piano tone: a sine with a quickly fading bright partial, ringing out on its own.
  function bell(t,f,gain,p){[[1,gain,1.6],[4,gain*.35,.25],[2.98,gain*.12,.5]].forEach(([m,v,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=f*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);const x=pan(g,p);x.connect(out);const w=ctx.createGain();w.gain.value=.45;x.connect(w);w.connect(echoIn);const v2=ctx.createGain();v2.gain.value=.35;x.connect(v2);v2.connect(verbIn);o.start(t);o.stop(t+d+.05);});}
  function hit(t,{f=8000,kind='highpass',q=.7,gain=.1,decay=.04,p=0,room=0}){const s=ctx.createBufferSource(),flt=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;flt.type=kind;flt.frequency.value=f;flt.Q.value=q;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+decay);s.connect(flt);flt.connect(g);const o=pan(g,p);o.connect(out);if(room){const v=ctx.createGain();v.gain.value=room;o.connect(v);v.connect(verbIn);}s.start(t,Math.random()*.5);s.stop(t+decay+.02);}
  function thump(t,f0,f1,gain,decay){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+decay*.45);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+decay);o.connect(g);g.connect(out);o.start(t);o.stop(t+decay+.02);}
  const DRUM={
    k:(t,v)=>{thump(t,150,46,.42*v,.3);hit(t,{f:3000,kind:'lowpass',gain:.08*v,decay:.012});},
    s:(t,v)=>{hit(t,{f:1900,kind:'bandpass',q:.6,gain:.22*v,decay:.16,room:.4});thump(t,210,160,.13*v,.08);},
    c:(t,v)=>{[0,.011,.022].forEach((d,i)=>hit(t+d,{f:1500,kind:'bandpass',q:1.2,gain:(i<2?.12:.2)*v,decay:i<2?.012:.14,room:.45}));},
    r:(t,v)=>{hit(t,{f:2600,kind:'bandpass',q:4,gain:.12*v,decay:.03,room:.4});thump(t,800,700,.04*v,.03);},
    h:(t,v,i)=>hit(t,{f:7500,gain:(i%4===2?.07:.045)*v,decay:.035,p:.25}),
    o:(t,v)=>hit(t,{f:6800,gain:.06*v,decay:.22,p:-.2}),
  };
  const SOUND={
    pop:{wave:'square',det:[0,8],cut:2600,gain:.045,vib:12,wet:.3,room:.25},
    strings:{wave:'sawtooth',det:[-9,9],cut:3000,sweep:.6,gain:.05,a:.05,vib:14,wet:.25,room:.4},
    brass:{wave:'sawtooth',det:[-6,6],cut:2400,sweep:.35,gain:.06,a:.02,vib:10,wet:.15,room:.3},
    saw:{wave:'sawtooth',det:[-14,0,14],cut:3600,gain:.04,vib:10,wet:.3,room:.3},
  };
  function schedule(name,step,t){
    const s=SONGS[name],L=60/s.bpm/4,bar=Math.floor(step/16),i=step%16,ch=s.bars[bar],last=bar===BARS-1;
    if(echoBpm!==s.bpm){echoBpm=s.bpm;echo.delayTime.setValueAtTime(L*3,t);}
    const root=ch.root,tone=k=>ch.tones[k%ch.tones.length]+12*Math.floor(k/ch.tones.length);
    // Drums: the last bar of the loop uses the fill row where there is one.
    for(const [k,row] of Object.entries(s.drums)){const r=last&&s.fill?.[k]?s.fill[k]:row;if(r[i]==='x')DRUM[k](t,1,i);}
    if(last&&s.fill)for(const [k,r] of Object.entries(s.fill))if(!s.drums[k]&&r[i]==='x')DRUM[k](t,1,i);
    if(s.crash&&step===0)hit(t,{f:5200,gain:.11,decay:1.6,room:.5});
    // Bass: two octaves below the chord, held for the '-' that follow.
    const b=s.bass[i];if('rof'.includes(b)){let n=1;while(i+n<16&&s.bass[i+n]==='-')n++;const m=24+12+root+(b==='o'?12:b==='f'?7:0),bn=root>=7?m-12:m;
      note(t,n*L*.9,freq(bn),name==='astral'?{wave:'triangle',cut:900,gain:.15,r:.08,room:0}:{wave:'sawtooth',det:[0,-7],cut:520,sweep:3,q:2,gain:.085,r:.05,room:0,hold:n>1});}
    // Pad: the bar's chord around middle C — held, pulsing in 8ths (reach strings) or soft and slow (ASTRAL).
    const voicing=ch.tones.map(x=>57+((root+x-57)%12+12)%12);
    if(s.pad==='hold'&&i===0)voicing.forEach((n,k)=>note(t,16*L,freq(n),{wave:'sawtooth',det:[-12,12],cut:1300,gain:.018,a:.12,r:.4,p:k%2?.35:-.35,dry:1,room:.5}));
    if(s.pad==='soft'&&i===0)voicing.forEach((n,k)=>note(t,16*L,freq(n),{wave:'triangle',det:[-6,6],cut:1600,gain:.026,a:.6,r:.8,p:k%2?.4:-.4,room:.7}));
    if(s.pad==='pulse'&&i%2===0)voicing.forEach((n,k)=>note(t,L*1.6,freq(n+12),{wave:'sawtooth',det:[-10,10],cut:2200,sweep:.5,gain:.016,a:.005,r:.06,p:k%2?.4:-.4,room:.35,hold:false}));
    // Arpeggio: chord tones rising over two octaves in 16ths, or a slow drifting 8th-note sparkle for ASTRAL.
    if(s.arp==='up'){const n=72+root%12+tone([0,1,2,3,4,5,4,3][i%8]);note(t,L*.8,freq(n>88?n-12:n),{wave:name==='astral-bonus'?'sawtooth':'triangle',cut:3200,sweep:2,gain:.022,a:.003,r:.05,p:.3,wet:.35,room:.2,hold:false});}
    if(s.arp==='drift'&&i%2===0){const k=[0,2,1,3,2,4,3,1][(i/2+bar)%8],n=60+root%12+tone(k);note(t,L*1.6,freq(n),{wave:'triangle',cut:2400,gain:.028,a:.004,r:.2,p:i%4?.45:-.45,wet:.5,room:.4,hold:false});}
    // Lead melody.
    for(const ev of s.notes)if(ev.step===step%STEPS){const f=freq(ev.note+(s.shift||0));if(s.lead_==='bell')bell(t,f,.1,0);else note(t,ev.len*L*.92,f,SOUND[s.lead_]);}
  }
  function cut(t){for(const {g,end} of live){if(end<=t)continue;const v=g.gain;if(v.cancelAndHoldAtTime)v.cancelAndHoldAtTime(t);else{v.cancelScheduledValues(t);v.setValueAtTime(v.value,t);}v.linearRampToValueAtTime(0,t+.08);}live.clear();}
  // Plays the fanfare starting at time t (see FANFARE).
  function fanfare(name,t){const {bpm,key}=FANFARES[name],B=60/bpm,f=n=>freq(noteNumber(n)+key),F=FANFARE;
    const horn={wave:'sawtooth',det:[-8,0,8],cut:2600,sweep:.4,q:1,gain:.075,a:.025,r:.25,vib:12,wet:.12,room:.45};
    for(const [b,l,n] of F.brass)note(t+b*B,l*B*.92,f(n),{...horn,p:-.15});
    for(const [b,l,ns] of F.chords)ns.forEach((n,k)=>note(t+b*B,l*B,f(n),{...horn,gain:.04,det:[-12,12],a:.04,p:k%2?.4:-.4}));
    for(const [b,l,n] of F.bass)note(t+b*B,l*B,f(n),{wave:'sawtooth',det:[0,-7],cut:600,sweep:2,q:1.5,gain:.12,r:.2,room:.2});
    for(const b of F.timpani)thump(t+b*B,110*2**(key/12),70,.5,.7);
    for(let b=F.roll[0];b<F.roll[1];b+=1/8)thump(t+b*B,95*2**(key/12),75,.12+.25*(b-F.roll[0])/(F.roll[1]-F.roll[0]),.12);
    for(const b of F.crash)hit(t+b*B,{f:5200,gain:.16,decay:2,room:.6});
    for(const [b,n] of F.bells)bell(t+b*B,f(n),.07,0);}
  return {schedule,cut,fanfare};
}

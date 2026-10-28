// AURORA's open-topped start pocket. Physics and art share the same mouth coordinates.
import {START} from './engine.js';
export function drawStartPocket(g){
  const {x1,x2,y,bottom,rect:[x,top,w,h]}=START,cx=(x1+x2)/2;
  const gradient=(a,b,stops)=>{const v=g.createLinearGradient(0,a,0,b);for(const [at,c] of stops)v.addColorStop(at,c);return v;};
  const box=(x,y,w,h,r,fill,stroke)=>{g.beginPath();g.roundRect(x,y,w,h,r);g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=1;g.stroke();}};
  g.save();
  // Recess and inner chute, open at the top (no solid bar across the entry).
  box(x+3,y+2,w-6,h-6,6,'#251224','#886335');
  box(x1,y,x2-x1,bottom-y,3,gradient(y,bottom,[[0,'#050714'],[.65,'#231b35'],[1,'#663953']]),'#b8a6bd');
  g.fillStyle='#000a';g.fillRect(x1+2,y,x2-x1-4,6);
  // Sculpted gold cheeks with cool clear-plastic inner edges.
  const gold=gradient(top,bottom+8,[[0,'#fff7dc'],[.22,'#efc96e'],[.5,'#805021'],[.76,'#f6db92'],[1,'#ba7b33']]);
  for(const side of [-1,1]){const outer=side<0?x:x+w,inner=side<0?x1:x2;
    g.beginPath();g.moveTo(outer,top+9);g.lineTo(inner,top);g.lineTo(inner,y+16);g.lineTo(cx+side*7,bottom+6);g.lineTo(outer,bottom);g.closePath();g.fillStyle=gold;g.fill();g.strokeStyle='#57391f';g.stroke();
    g.beginPath();g.moveTo(inner+side*2,top+4);g.lineTo(inner+side*2,y+15);g.strokeStyle='#edfbff';g.lineWidth=2;g.stroke();
    const sx=outer-side*4;g.beginPath();g.arc(sx,y+10,1.7,0,Math.PI*2);g.fillStyle='#fff3bb';g.fill();
  }
  // Pearl-pink lower lip and a recessed label instead of a floating caption.
  box(x+5,bottom-3,w-10,11,4,gold,'#795023');
  box(x+10,bottom-1,w-20,7,2,'#372035');
  g.font='bold 5.5px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff0d5';g.fillText('START',cx,bottom+2.7);
  g.restore();
}

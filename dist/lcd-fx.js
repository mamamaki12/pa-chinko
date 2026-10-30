// Painted light parts for the LCD effects: assets/lcd-fx/, made by scripts/make-lcd-fx.py from the generated pictures in assets/generated/.
// Each is white-gold light on pure black, so it is added with 'lighter' (black adds nothing). A tinted copy is made once per colour with
// 'multiply', which keeps black black. Until a picture has loaded (and in the tests, where there is no Image) fxReady() is false and the
// callers keep drawing their own shapes.

export const FX_IDS=['fx-magic-circle','fx-light-burst','fx-rays','fx-comet','fx-meteor-small','fx-wings','fx-petal-swirl','fx-star-swirl','fx-shockwave','fx-sparkle-set'];
// fx-sparkle-set is 8 sparkles in a row, 128 px each.
export const SPARKLES=8;
const images=new Map(),tinted=new Map();
export function loadLcdFx(){if(typeof Image==='undefined')return;for(const id of FX_IDS){if(images.has(id))continue;const img=new Image();img.decoding='async';img.onload=()=>{img.ready=true;};img.src=`assets/lcd-fx/${id}.webp`;images.set(id,img);}}
export function fxReady(id){return !!images.get(id)?.ready;}
function source(id,tint){const img=images.get(id);if(!tint||typeof document==='undefined')return img;const key=id+tint;let c=tinted.get(key);
  if(!c){c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const g=c.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='multiply';g.fillStyle=tint;g.fillRect(0,0,c.width,c.height);tinted.set(key,c);}
  return c;}
// Adds picture id onto ctx with its point (ax,ay) (0..1 of the picture) at (x,y), w wide (the height keeps the picture's shape), turned by rot.
// cell picks one sparkle of fx-sparkle-set. Does nothing until the picture has loaded.
export function drawFx(ctx,id,x,y,w,{rot=0,alpha=1,tint=null,ax=.5,ay=.5,cell=null}={}){if(!fxReady(id)||alpha<=0||w<=0)return false;const img=images.get(id),src=source(id,tint);
  const sw=cell===null?img.naturalWidth:img.naturalWidth/SPARKLES,sh=img.naturalHeight,sx=cell===null?0:(cell%SPARKLES)*sw,h=w*sh/sw;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=Math.min(1,alpha);ctx.translate(x,y);if(rot)ctx.rotate(rot);ctx.drawImage(src,sx,0,sw,sh,-ax*w,-ay*h,w,h);ctx.restore();return true;}

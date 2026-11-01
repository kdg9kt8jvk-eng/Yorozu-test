/* Selection-only BGM with early preload and 3-second crossfade loop. */
(()=>{'use strict';
const SRC='./audio/character_select_bgm.m4a',FADE=3;
let a=null,b=null,active=null,next=null,started=false,raf=0;
function make(){const el=new Audio();el.preload='auto';el.volume=.65;el.src=SRC;el.load();return el}
function ensure(){if(a)return;a=make();b=make();active=a;next=b}
function loop(){if(!started||!active)return;const d=active.duration,t=active.currentTime;
if(Number.isFinite(d)&&d>FADE+1){
 const left=d-t;
 if(left<=FADE&&next.paused){
  next.currentTime=0;next.volume=0;next.play().catch(()=>{});
 }
 if(!next.paused){
  const progress=Math.min(1,Math.max(0,(FADE-left)/FADE));
  active.volume=.65*Math.cos(progress*Math.PI/2);
  next.volume=.65*Math.sin(progress*Math.PI/2);
  if(progress>=1||left<=.035){active.pause();active.currentTime=0;active.volume=.65;const old=active;active=next;next=old;next.volume=0}
 }
}
raf=requestAnimationFrame(loop)}
function play(){ensure();if(started)return;started=true;active.currentTime=0;active.volume=.65;active.play().catch(()=>{started=false});cancelAnimationFrame(raf);loop()}
function stop(){if(!a)return;started=false;cancelAnimationFrame(raf);for(const el of [a,b]){el.pause();el.currentTime=0;el.volume=.65}active=a;next=b}
function sync(){const front=document.getElementById('yorozuFront');const setup=document.body.classList.contains('setup-screen');if(front&&!front.hidden||!setup)stop();else play()}
window.YorozuSelectionBGM={sync,play,stop};
ensure();
document.addEventListener('pointerdown',()=>{sync();setTimeout(sync,0)},true);
document.addEventListener('keydown',()=>setTimeout(sync,0));
setInterval(sync,250);
})();
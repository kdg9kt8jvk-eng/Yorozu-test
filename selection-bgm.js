/* Yorozumon selection/album BGM. 3-second equal-power crossfade. */
(()=>{'use strict';
const KEY='yorozu-selection-bgm-v1',SRC='./audio/character_select_bgm.m4a',FADE=3;
let a=null,b=null,active=null,next=null,started=false,raf=0,ctx=null;
const isAlbum=location.pathname.endsWith('/album.html');
function save(){if(!active||!Number.isFinite(active.currentTime))return;try{sessionStorage.setItem(KEY,JSON.stringify({time:active.currentTime,at:Date.now()}))}catch(_){}}
function make(){const el=new Audio(SRC);el.preload='auto';el.volume=.65;return el}
function ensure(){if(a)return;a=make();b=make();active=a;next=b}
function restore(){try{const x=JSON.parse(sessionStorage.getItem(KEY)||'null');if(x&&Date.now()-x.at<120000&&x.time>=0)return x.time}catch(_){}return 0}
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
function play(){ensure();if(started)return;started=true;active.currentTime=restore();active.play().catch(()=>{started=false});cancelAnimationFrame(raf);loop()}
function stop(){if(!a)return;save();started=false;cancelAnimationFrame(raf);for(const el of [a,b]){el.pause();el.volume=.65}}
function sync(){if(isAlbum){play();return}const front=document.getElementById('yorozuFront');const setup=document.body.classList.contains('setup-screen');if(front&&!front.hidden||!setup)stop();else play()}
window.YorozuSelectionBGM={sync,play,stop};
if(isAlbum){document.addEventListener('pointerdown',play,{once:true});document.addEventListener('keydown',play,{once:true});}
else{document.addEventListener('pointerdown',()=>setTimeout(sync,0));document.addEventListener('keydown',()=>setTimeout(sync,0));}
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});window.addEventListener('pagehide',save);
setInterval(()=>{if(started)save();if(!isAlbum)sync()},500);
if(isAlbum)play();
})();
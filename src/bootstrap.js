import './style.css';
import {createPlatform} from './platform.js';
let storage;
const sdk=globalThis.ytgame;
if(!sdk?.IN_PLAYABLES_ENV){try{storage=globalThis.localStorage;}catch{}}
export const platform=createPlatform({sdk,storage,requireSDK:import.meta.env.MODE==='youtube'});
const app=document.querySelector('#app');
let running=false,booting=false;
let resumeWaiters=[];
const whenActive=()=>platform.paused?new Promise(resolve=>resumeWaiters.push(resolve)):Promise.resolve();
const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
function blockUI(){app.inert=platform.paused;document.documentElement.classList.toggle('platform-paused',platform.paused);}
platform.configure({onPause:blockUI,onResume:()=>{blockUI();for(const resolve of resumeWaiters.splice(0))resolve();}});
// Capture also protects already-open dialogs (their top-layer UI is outside normal painting).
for(const type of ['click','pointerdown','keydown','input','change','wheel'])document.addEventListener(type,event=>{
  if(!platform.paused||event.key==='Escape')return;
  event.preventDefault();event.stopImmediatePropagation();
},{capture:true,passive:false});
async function boot(){
  if(booting||running||platform.paused)return;booting=true;
  app.innerHTML='<section class="loading-card" role="status"><span class="loading-mark">✎</span><h1>ColorQuest</h1><p>Loading your colors and saved progress…</p></section>';
  try{
    await frame();await whenActive();platform.firstFrame();
    const raw=await platform.load();
    await whenActive();
    const {startGame}=await import('./main.js');
    await whenActive();
    startGame(platform,raw);running=true;blockUI();platform.ready();
  }catch(error){
    await whenActive();
    app.innerHTML='<section class="loading-card"><h1>Let’s reconnect</h1><p>Your saved picture could not be loaded. We won’t overwrite your progress.</p><button id="retry-load" class="primary">Try again</button><button id="reload-game" class="quiet">Reload game</button></section>';
    document.querySelector('#retry-load').onclick=boot;document.querySelector('#reload-game').onclick=()=>location.reload();
  }finally{booting=false;}
}
boot();

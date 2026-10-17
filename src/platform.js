// YouTube-specific behavior is isolated here; no SDK globals are overwritten.
export function createPlatform({sdk,storage,requireSDK=false}={}){
  const inYouTube=sdk?.IN_PLAYABLES_ENV===true;
  let loaded=false,started=false,firstSent=false,readySent=false,paused=false;
  let localAvailable=!!storage;
  let audioEnabled=!inYouTube,pending=null,writing=false,status='loading',lastError=null;
  let handlers={};
  const emit=()=>{if(!paused)handlers.onStatus?.(status);};
  const setStatus=value=>{status=value;emit();};
  const warn=()=>{if(inYouTube&&!paused)sdk.health?.logWarning?.();};
  function drain(allowPaused=false){
    if(!loaded||writing||pending===null||(paused&&!allowPaused))return;
    const snapshot=pending;pending=null;writing=true;setStatus('saving');
    (async()=>{await sdk.game.saveData(snapshot);})().then(()=>{
      writing=false;lastError=null;setStatus(pending===null?'saved':'saving');
      if(!paused)drain();
    }).catch(error=>{writing=false;lastError=error;if(pending===null)pending=snapshot;setStatus('error');warn();});
  }
  return {
    inYouTube,
    get paused(){return paused;},get audioEnabled(){return audioEnabled;},get status(){return status;},get lastError(){return lastError;},
    configure(callbacks){handlers=callbacks;},
    firstFrame(){if(sdk&&!firstSent){sdk.game.firstFrameReady();firstSent=true;}},
    ready(){if(sdk&&!readySent){if(!firstSent)throw new Error('First frame must be signaled first');sdk.game.gameReady();readySent=true;}},
    async load(){
      if(requireSDK&&!sdk)throw new Error('The YouTube connection could not load. Check your connection and reload.');
      if(!started){started=true;if(inYouTube){
        audioEnabled=sdk.system.isAudioEnabled();
        sdk.system.onAudioEnabledChange(enabled=>{audioEnabled=enabled===true;if(!paused)handlers.onAudio?.(audioEnabled);});
        sdk.system.onPause(()=>{
          // Save the latest queued snapshot once at the platform's exit/pause boundary.
          paused=true;handlers.onPause?.();drain(true);
        });
        sdk.system.onResume(()=>{paused=false;handlers.onResume?.();handlers.onAudio?.(audioEnabled);emit();drain();});
      }}
      setStatus('loading');
      try{
        // No local-storage access is made in YouTube's environment, even on failure.
        let value;
        if(inYouTube)value=await sdk.game.loadData();else{try{value=storage?.getItem('colorquest-v1');}catch{localAvailable=false;}}
        let raw=value?JSON.parse(value):null;
        if(raw?.schemaVersion>2)throw new Error('This progress was saved by a newer game version. Please reopen the latest version.');
        if(raw?.schemaVersion===2){if(!raw.state||typeof raw.state!=='object'||Array.isArray(raw.state))throw new Error('Invalid save data');raw=raw.state;}
        if(raw!==null&&(typeof raw!=='object'||Array.isArray(raw)))throw new Error('Invalid save data');
        loaded=true;lastError=null;setStatus(inYouTube||localAvailable?'saved':'unavailable');return raw;
      }catch(error){lastError=error;if(!inYouTube){localAvailable=false;loaded=true;setStatus('unavailable');return null;}loaded=false;setStatus('load-error');warn();throw error;}
    },
    save(state){
      if(!loaded)return false;
      const data=JSON.stringify({schemaVersion:2,state});
      // Our complete collection fits comfortably within the platform's exit-flush limit.
      if(new TextEncoder().encode(data).length>=64*1024){setStatus('error');return false;}
      if(inYouTube){pending=data;drain();}
      else{if(!localAvailable){setStatus('unavailable');return false;}try{storage?.setItem('colorquest-v1',data);setStatus(storage?'saved':'unavailable');}catch(error){lastError=error;setStatus('unavailable');}}
      return true;
    },
    retrySave(){if(inYouTube)drain();},
  };
}

<script>
import { onMount } from "svelte";

import RtcServer from '../scripts/RtcServer';

let rtcserver = new RtcServer();

let player;
async function screen(displayMediaOptions = {
  video: {
    cursor: "always"
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100
  }
}) {

    let captureStream = null;

    try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch(err) {
        console.error("Error: " + err);
    }
    return captureStream;
}

async function produce(){
    let stream = await screen({});
    if(stream === null) return;
    //player.srcObject = stream;

    let server = new RTCPeerConnection();
    server.onicecandidate = e => {
      if(e.candidate && e.candidate.candidate !== ""){
        console.log("candidate:",e.candidate);
        rtcserver.postServerCandidate(e.candidate);
      }
    };
    
    

    await server.addStream(stream);
    /*stream.getTracks().forEach(track => {
      server.addTrack(track, stream);
    });*/
  
    let offer = await server.createOffer();


    let serverDescription = new RTCSessionDescription(offer);
    await server.setLocalDescription(serverDescription);
    await rtcserver.postServerOffer(offer);
    

    await rtcserver.waitForClientAnswer();
    let answer = await rtcserver.getClientAnswer();
    let clientDescription = new RTCSessionDescription(answer);
    await server.setRemoteDescription(clientDescription);

    await rtcserver.waitForClientCandidate();
    let camdidate = await rtcserver.getClientCandidate();
    try{
      server.addIceCandidate(camdidate);
    }catch(e){
      console.log(e);
    }
}
</script>

<button on:click={produce}>Produce</button>
<button on:click={()=>fetch("/stream/reset")}>Reset</button>
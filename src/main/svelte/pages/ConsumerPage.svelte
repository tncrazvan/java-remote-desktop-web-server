<script>
import { onMount } from "svelte";
import GamepadInputInterface from "../components/GamepadInputInterface.svelte";
import RtcServer from '../scripts/RtcServer';
let rtcserver = new RtcServer();
let player;

async function consume(){
    /*const stream = new MediaStream();
    player.srcObject = stream;*/

    let client = new RTCPeerConnection();
    client.onicecandidate = async e => {
      if(e.candidate && e.candidate.candidate !== ""){
        console.log("candidate:",e.candidate);
        await rtcserver.postClientCandidate(e.candidate);
      }
    };


    /*client.addEventListener('track', async (event) => {
      stream.addTrack(event.track, stream);
    });*/
    client.ontrack = e => {
      console.log(e);
      player.srcObject = e.streams[0];
    }
    await rtcserver.waitForServerOffer();

    let offer = await rtcserver.getServerOffer();
    let serverDescription = new RTCSessionDescription(offer);
    await client.setRemoteDescription(serverDescription);

    let answer = await client.createAnswer();
    let clientDescription = new RTCSessionDescription(answer);
    await client.setLocalDescription(clientDescription);

    await rtcserver.postClientAnswer(answer);

    await rtcserver.waitForServerCandidate();
    let candidate = await rtcserver.getServerCandidate();
    try{
      await client.addIceCandidate(candidate);
    }catch(e){
      console.log(e);
    }
}
</script>
<GamepadInputInterface />
<button on:click={consume}>Consume</button>
<button on:click={()=>fetch("/stream/reset")}>Reset</button>
<video bind:this={player} autoplay></video>
<script lang="ts">
import { onMount } from "svelte";
import BinaryPoint32 from "./scripts/BinaryPoint32";
import GamepadEventManager from './scripts/GamepadEventManager';
import PositionSynchronizer from "./scripts/PositionSynchronizer";
import KeyboardEventManager from "./scripts/KeyboardEventManager";


let gamepad:Gamepad;

function gamepadConnected(gp:Gamepad){
	gamepad = gp;
}

function gamepadDisconnected(e){
	gamepad = undefined;
}

const POSITION_SYNC:PositionSynchronizer = new PositionSynchronizer();
const GEM:GamepadEventManager = new GamepadEventManager(POSITION_SYNC);
const KEM:KeyboardEventManager = new KeyboardEventManager(POSITION_SYNC);


function loop(){
	POSITION_SYNC.trySend();
}
onMount(() => {
	GEM.watch();
	KEM.watch();
	requestAnimationFrame(loop);
});
</script>

<!-- <input type="number" bind:value={x}>
<input type="number" bind:value={y}> -->
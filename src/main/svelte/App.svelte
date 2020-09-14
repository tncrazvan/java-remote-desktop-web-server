<script lang="ts">
import { onMount } from "svelte";
import GamepadEventManager from './scripts/event-managers/GamepadEventManager';
import PositionSynchronizer from "./scripts/synchronizers/CursorPositionSynchronizer";
import TypingSynchronizer from "./scripts/synchronizers/TypingSynchronizer";


let gamepad:Gamepad;

function gamepadConnected(gp:Gamepad){
	gamepad = gp;
}

function gamepadDisconnected(e){
	gamepad = undefined;
}

const CURSOR_POSITION_SYNC:PositionSynchronizer = new PositionSynchronizer();
const TYPING_SYNC:TypingSynchronizer = new TypingSynchronizer();
const GEM:GamepadEventManager = new GamepadEventManager(CURSOR_POSITION_SYNC,TYPING_SYNC);

onMount(() => {
	GEM.watch();
});
</script>

<textarea name="" id="" cols="30" rows="10"></textarea>
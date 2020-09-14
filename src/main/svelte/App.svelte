<script lang="ts">
import { onMount } from "svelte";
import GamepadEventManager from './scripts/event-managers/GamepadEventManager';
import MouseButtonSynchronizer from "./scripts/synchronizers/MouseButtonSynchronizer";
import MousePositionSynchronizer from "./scripts/synchronizers/MousePositionSynchronizer";
import TypingSynchronizer from "./scripts/synchronizers/TypingSynchronizer";



let gamepad:Gamepad;

function gamepadConnected(gp:Gamepad){
	gamepad = gp;
}

function gamepadDisconnected(e){
	gamepad = undefined;
}

const MOUSE_POSITION_SYNC:MousePositionSynchronizer = new MousePositionSynchronizer();
const MOUSE_BUTTON_SYNC:MouseButtonSynchronizer = new MouseButtonSynchronizer();
const TYPING_SYNC:TypingSynchronizer = new TypingSynchronizer();
const GEM:GamepadEventManager = new GamepadEventManager(MOUSE_POSITION_SYNC,MOUSE_BUTTON_SYNC,TYPING_SYNC);

onMount(() => {
	let rightClickPressed = false;
	GEM.setButtonEventListener(11,1000,(time:number)=>{
		if(rightClickPressed){
			rightClickPressed = !rightClickPressed;
			return {mouse:-MouseButtonSynchronizer.BUTTON_3} //RELEASE BUTTON
		} else {
			rightClickPressed = !rightClickPressed;
			return {mouse:MouseButtonSynchronizer.BUTTON_3} //PRESS BUTTON
		}
	});
	GEM.watch();
});
</script>

<textarea name="" id="" cols="30" rows="10"></textarea>
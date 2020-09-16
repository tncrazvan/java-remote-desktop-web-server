<script lang="ts">
import { onMount } from "svelte";
import GamepadEventManager from './scripts/event-managers/GamepadEventManager';
import GamepadButtonManager from "./scripts/gamepad-button-tools/GamepadButtonManager";
import MouseButtonSynchronizer from "./scripts/synchronizers/MouseButtonSynchronizer";
import MousePositionSynchronizer from "./scripts/synchronizers/MousePositionSynchronizer";
import TypingSynchronizer from "./scripts/synchronizers/TypingSynchronizer";

// GAMEPAD KEY CODES
const BUTTON_X = 0;
const BUTTON_SQUARE = 2;
const BUTTON_TRIANGLE = 2;
const BUTTON_CIRCLE = 3;
const BUTTON_LEFT_TRIGGER_1 = 4;
const BUTTON_RIGHT_TRIGGER_1 = 5;
const BUTTON_LEFT_TRIGGER_2 = 6;
const BUTTON_RIGHT_TRIGGER_2 = 7;
const BUTTON_SELECT = 8;
const BUTTON_START = 9;
const BUTTON_LEFT_STICK = 10;
const BUTTON_RIGHT_STICK = 11;
const BUTTON_ARROW_UP = 12;
const BUTTON_ARROW_DOWN = 13;
const BUTTON_ARROW_LEFT = 14;
const BUTTON_ARROW_RIGHT = 15;



// MOUSE KEY CODES
const BUTTON_1 = 1024;
const BUTTON_3 = 4096;

//KEYBOARD KEY CODES
const BUTTON_SPACE = 32;

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
	GEM.setButtonEventListener(BUTTON_X,0,(time:number)=>{
		return {keyboard:[BUTTON_SPACE,-BUTTON_SPACE]}
	});
	GEM.setButtonEventListener(BUTTON_SELECT,0,(time:number)=>{
		return {mouse:[BUTTON_1,-BUTTON_1]};
	});
	GEM.setButtonEventListener(BUTTON_START,0,(time:number)=>{
		return {mouse:[BUTTON_3,-BUTTON_3]};
	});
	let rightClickPressed = false;
	GEM.setButtonEventListener(BUTTON_RIGHT_STICK,200,(time:number)=>{
		if(rightClickPressed){
			rightClickPressed = !rightClickPressed;
			return {mouse:[-BUTTON_3]} //RELEASE BUTTON
		} else {
			rightClickPressed = !rightClickPressed;
			return {mouse:[BUTTON_3]} //PRESS BUTTON
		}
	});
	GEM.watch();
});
</script>

<textarea name="" id="" cols="30" rows="10"></textarea>
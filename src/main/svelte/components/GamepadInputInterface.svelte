<script lang="ts">
import { onDestroy, onMount } from "svelte";
import GamepadEventManager from "../scripts/event-managers/GamepadEventManager";
import GamepadButtonManager from "../scripts/gamepad-button-tools/GamepadButtonManager";
import MouseButtonSynchronizer from "../scripts/synchronizers/MouseButtonSynchronizer";
import MousePositionSynchronizer from "../scripts/synchronizers/MousePositionSynchronizer";
import TypingSynchronizer from "../scripts/synchronizers/TypingSynchronizer";

// GAMEPAD KEY CODES
import {
    GAMEPAD_X,
    GAMEPAD_SQUARE,
    GAMEPAD_TRIANGLE,
    GAMEPAD_CIRCLE,
    GAMEPAD_LEFT_TRIGGER_1,
    GAMEPAD_RIGHT_TRIGGER_1,
    GAMEPAD_LEFT_TRIGGER_2,
    GAMEPAD_RIGHT_TRIGGER_2,
    GAMEPAD_SELECT,
    GAMEPAD_START,
    GAMEPAD_LEFT_STICK,
    GAMEPAD_RIGHT_STICK,
    GAMEPAD_ARROW_UP,
    GAMEPAD_ARROW_DOWN,
    GAMEPAD_ARROW_LEFT,
    GAMEPAD_ARROW_RIGHT
} from "../scripts/gamepad-button-tools/GamepadCodes";

//MOUSE KEY CODES
import { 
    MOUSE_1,
    MOUSE_2,
    MOUSE_3,
} from "../scripts/mouse-button-tools/MouseCodes";

import {
    KEYBOARD_SPACE
} from "../scripts/keyboard-button-tools/KeyboardCodes";

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
onMount(async () => {
    GEM.setButtonEventListener(GAMEPAD_X,0,(time:number)=>{
        return {keyboard:[KEYBOARD_SPACE,-KEYBOARD_SPACE]}
    });
    GEM.setButtonEventListener(GAMEPAD_SELECT,0,(time:number)=>{
        return {mouse:[MOUSE_1,-MOUSE_1]};
    });
    GEM.setButtonEventListener(GAMEPAD_START,0,(time:number)=>{
        return {mouse:[MOUSE_3,-MOUSE_3]};
    });
    let rightClickPressed = false;
    GEM.setButtonEventListener(GAMEPAD_RIGHT_STICK,200,(time:number)=>{
        if(rightClickPressed){
            rightClickPressed = !rightClickPressed;
            return {mouse:[-MOUSE_3]} //RELEASE BUTTON
        } else {
            rightClickPressed = !rightClickPressed;
            return {mouse:[MOUSE_3]} //PRESS BUTTON
        }
    });
    GEM.watch();
});
onDestroy(()=>{
    //GEM.close();
});
</script>
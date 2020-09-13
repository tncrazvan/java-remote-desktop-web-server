import type CursorPositionSynchronizer from "../synchronizers/CursorPositionSynchronizer";
import gameControl from 'gamecontroller.js/src/gamecontrol';
export default class GamepadEventManager{
    private interval;
    private ps:CursorPositionSynchronizer;
    private gamepad:any;
    constructor(ps:CursorPositionSynchronizer){
        this.ps=ps;
    }



    private connected(gamepad):boolean{
        if(this.gamepad) return false;
        this.gamepad = gamepad;
        console.log("Gamepad detected.",gamepad);
        return true;
    }

    private disconnected(e:GamepadEvent):void{
        console.log("Gamepad disconnected.",this.gamepad);
    }


    public watch():void{
        gameControl.on('connect', (gamepad) => {
            if(!this.connected(gamepad)) return;
            gamepad.on('up', (e)=>{
                console.log("moving up");
            });
            gamepad.on('down', (e)=>{
                console.log("moving down");
            });
            gamepad.on('left', (e)=>{
                console.log("moving left");
            });
            gamepad.on('right', (e)=>{
                console.log("moving right");
            });
        });
    }
}
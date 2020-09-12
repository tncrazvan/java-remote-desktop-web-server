import type PositionSynchronizer from "./PositionSynchronizer";

export default class GamepadEventManager{
    private interval;
    private ps:PositionSynchronizer;
    private gamepad:Gamepad;
    constructor(ps:PositionSynchronizer){
        this.ps=ps;
    }

    private pollGamepads():void{
        //var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        let gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
          var gp = gamepads[i];
          if (gp) {
              this.connected(gp);
            console.log("Gamepad connected at index ", gp.index, ": ", gp.id,". It has ", gp.buttons.length, " buttons and ", gp.axes.length, " axes.");
            clearInterval(this.interval);
          }
        }
    }

    private connected(gamepad:Gamepad):void{
        this.gamepad = gamepad;
        console.log(gamepad);
    }

    private disconnected(e:GamepadEvent):void{
        this.gamepad = undefined;
    }

    private tick(gamepad:Gamepad):void{
        if(!gamepad) return;
        console.log("connected:",gamepad.connected,gamepad.axes[0],gamepad.axes[1],gamepad.axes[2],gamepad.axes[3]);
    }

    public watch():void{
        window.addEventListener("gamepadconnected", (e:GamepadEvent)=>{
            this.connected(navigator.getGamepads()[e.gamepad.index]);
        });
        window.addEventListener("gamepaddisconnected", (e:GamepadEvent)=>{
            this.disconnected(e);
            if (!('ongamepadconnected' in window)) {
                // No gamepad events available, poll instead.
                this.interval = setInterval(this.pollGamepads, 500);
            }
        });
        requestAnimationFrame(()=>{
            this.tick(this.gamepad);
        });
    }
}
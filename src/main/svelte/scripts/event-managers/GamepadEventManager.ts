import type CursorPositionSynchronizer from "../synchronizers/CursorPositionSynchronizer";
import type TypingSynchronizer from "../synchronizers/TypingSynchronizer";
export default class GamepadEventManager{
    private interval;
    private cps:CursorPositionSynchronizer;
    private ts:TypingSynchronizer;
    private gamepads:Array<Gamepad> = new Array<Gamepad>();
    constructor(cps:CursorPositionSynchronizer,ts:TypingSynchronizer){
        this.cps=cps;
        this.ts=ts;
        this.request[this.keyQ] = false;
        this.request[this.keyE] = false;
        this.request[this.keyW] = false;
        this.request[this.keyS] = false;
        
        this.status[this.keyQ] = false;
        this.status[this.keyE] = false;
        this.status[this.keyW] = false;
        this.status[this.keyS] = false;
    }

    public getCps():CursorPositionSynchronizer{
        return this.cps;
    }

    public setGamepad(gamepad:Gamepad):void{
        this.gamepads[gamepad.index] = gamepad;
    }

    public unsetGamepad(gamepad:Gamepad):void{
        this.gamepads[gamepad.index] = undefined;
    }

    public issetGamepad(gamepad:Gamepad):boolean{
        return this.gamepads[gamepad.index] !== undefined;
    }

    private keyQ:number = 81;
    private keyE:number = 69;
    private keyW:number = 87;
    private keyS:number = 83;

    private keyLeft:number = 37;
    private keyRight:number = 39;
    private keyUp:number = 38;
    private keyDown:number = 40;


    private request:Object = {};
    private status:Object = {};

    private keys:Array<number> = [
        this.keyQ,
        this.keyE,
        this.keyW,
        this.keyS,

        this.keyLeft,
        this.keyRight,
        this.keyUp,
        this.keyDown
    ];
    private deltaTLeftStick:number = 0;

    private release:number = 0;
    //private lastCodeSent = -1;
    public sendLeftStick(gamepad:Gamepad){
        const min = 1;
        let x:number = parseFloat(gamepad.axes[0].toFixed(1));
        let y:number = parseFloat(gamepad.axes[1].toFixed(1));
        
        x = x == -0 || (x > 0 && x <= 0.1*min) || (x < 0 && x >= -0.1*min)?0:x;
        y = y == -0 || (y > 0 && y <= 0.1*min) || (y < 0 && y >= -0.1*min)?0:y;
        
        if(x < 0) {
            this.status[this.keyRight] = false;
            this.status[this.keyLeft] = true;
        } else if(x > 0) {
            this.status[this.keyRight] = true;
            this.status[this.keyLeft] = false;
        } else {
            this.status[this.keyRight] = false;
            this.status[this.keyLeft] = false;
        }

        if(y < 0) {
            this.status[this.keyUp] = true;
            this.status[this.keyDown] = false;
        } else if(y > 0) {
            this.status[this.keyUp] = false;
            this.status[this.keyDown] = true;
        } else {
            this.status[this.keyUp] = false;
            this.status[this.keyDown] = false;
        }

        this.keys.forEach(key=>{
            let statusKey = this.status[key];
            let requestKey = this.request[key];
            if(statusKey !== requestKey){
                if(statusKey){
                    console.log("pressing",key);
                    this.ts.send(key);
                }else{
                    console.log("releasing",key);
                    this.ts.send(-key);
                }
                this.request[key] = statusKey;
            }
        });

    }

    public sendRightStick(gamepad:Gamepad){
        const min = 1;

        let x:number = parseFloat(gamepad.axes[2].toFixed(1));
        let y:number = parseFloat(gamepad.axes[3].toFixed(1));

        x = x == -0 || (x > 0 && x <= 0.1*min) || (x < 0 && x >= -0.1*min)?0:x;
        y = y == -0 || (y > 0 && y <= 0.1*min) || (y < 0 && y >= -0.1*min)?0:y;
        if(x !== 0 || y !== 0)
            this.cps.send(x,y);
    }

    public lastX:number = 0;
    public lastY:number = 0;
    private loop(gamepad:Gamepad){
        if(!this.issetGamepad(gamepad)){
            console.warn("Closing gamepad loop.");
            return;
        }

        this.sendRightStick(gamepad);
        this.sendLeftStick(gamepad);

        let gamepads:Array<Gamepad> = navigator.getGamepads()
        if(gamepads[gamepad.index])
            setTimeout(()=>this.loop(gamepads[gamepad.index]),10);
    }

    private connected($this:GamepadEventManager,e:GamepadEvent):void{
        $this.setGamepad(e.gamepad);
        console.log("Gamepad connected", e.gamepad);
        setTimeout(()=>this.loop(e.gamepad),10);
    }

    public watch():void{
        window.addEventListener("gamepadconnected", (e:GamepadEvent)=>this.connected(this,e));
    }
}
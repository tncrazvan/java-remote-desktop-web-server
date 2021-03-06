import GamepadButtonManager from "../gamepad-button-tools/GamepadButtonManager";
import type MouseButtonSynchronizer from "../synchronizers/MouseButtonSynchronizer";
import type MousePositionSynchronizer from "../synchronizers/MousePositionSynchronizer";
import type TypingSynchronizer from "../synchronizers/TypingSynchronizer";


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
} from '../gamepad-button-tools/GamepadCodes.js';

export default class GamepadEventManager{
    
    private cps:MousePositionSynchronizer;
    private mbs:MouseButtonSynchronizer;
    private ts:TypingSynchronizer;
    private gamepads:Array<Gamepad> = new Array<Gamepad>();

    private keyLeft:number = 37;
    private keyRight:number = 39;
    private keyUp:number = 38;
    private keyDown:number = 40;
    private mouseRight:number = 2;
    private keyboardRequest:Object = {};
    private keyboardStatus:Object = {};
    private keyboardKeys:Array<number> = [
        this.keyLeft,
        this.keyRight,
        this.keyUp,
        this.keyDown
    ];
    private mouseKeys:Array<number> = [
        this.mouseRight
    ];
    private deltaTLeftStick:number = 0;
    private release:number = 0;
    private gamepadButtons:Map<number,GamepadButtonManager> = new Map<number,GamepadButtonManager>();
    private running:boolean = true;

    constructor(cps:MousePositionSynchronizer,mbs:MouseButtonSynchronizer,ts:TypingSynchronizer){
        this.cps=cps;
        this.ts=ts;
        this.mbs=mbs;
    }

    public close():void{
        this.running = false;
        this.cps.close();
        this.mbs.close();
        this.ts.close();
    }

    /**
     * 
     * @param code gamepad button code.
     * @param delay action will be trigger only if the button 
     * has been pressed for this ammount of time (milliseconds).
     * @param action action to trigger.
     */
    public setButtonEventListener(code:number,delay:number,callback:Function):void{
        const manager = new GamepadButtonManager(code,delay,(gbm:GamepadButtonManager,age:number)=>{
            const result = callback(age);
            if(result.mouse && result.mouse.length && result.mouse.length > 0){
                result.mouse.forEach((c,i)=>{
                    if(i === 0)
                        this.mbs.send(c);
                    else if(this.running){
                        setTimeout(()=>this.mbs.send(c),i*10);
                    }
                });
            }
            if(result.keyboard && result.keyboard.length && result.keyboard.length > 0){
                result.keyboard.forEach((c,i)=>{
                    if(i === 0)
                        this.ts.send(c);
                    else if(this.running){
                        setTimeout(()=>this.ts.send(c),i*10);
                    }
                });
            }
        });
        this.gamepadButtons.set(code,manager);
    }

    public getCps():MousePositionSynchronizer{
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
    
    //private lastCodeSent = -1;
    public sendLeftStick(gamepad:Gamepad){
        const min = 1;
        let x:number = parseFloat(gamepad.axes[0].toFixed(1));
        let y:number = parseFloat(gamepad.axes[1].toFixed(1));
        
        x = x == -0 || (x > 0 && x <= 0.1*min) || (x < 0 && x >= -0.1*min)?0:x;
        y = y == -0 || (y > 0 && y <= 0.1*min) || (y < 0 && y >= -0.1*min)?0:y;
        
        if(x < 0) {
            this.keyboardStatus[this.keyRight] = false;
            this.keyboardStatus[this.keyLeft] = true;
        } else if(x > 0) {
            this.keyboardStatus[this.keyRight] = true;
            this.keyboardStatus[this.keyLeft] = false;
        } else {
            this.keyboardStatus[this.keyRight] = false;
            this.keyboardStatus[this.keyLeft] = false;
        }

        if(y < 0) {
            this.keyboardStatus[this.keyUp] = true;
            this.keyboardStatus[this.keyDown] = false;
        } else if(y > 0) {
            this.keyboardStatus[this.keyUp] = false;
            this.keyboardStatus[this.keyDown] = true;
        } else {
            this.keyboardStatus[this.keyUp] = false;
            this.keyboardStatus[this.keyDown] = false;
        }

        this.keyboardKeys.forEach(key=>{
            let statusKey = this.keyboardStatus[key];
            let requestKey = this.keyboardRequest[key];
            if(statusKey !== requestKey){
                if(statusKey){
                    console.log("pressing",key);
                    this.ts.send(key);
                }else{
                    console.log("releasing",key);
                    this.ts.send(-key);
                }
                this.keyboardRequest[key] = statusKey;
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


    public sendButtons(gamepad:Gamepad){
        
        /*gamepad.buttons.forEach((btn:GamepadButton,i:number)=>{
            if(btn.pressed){
                console.log("Button",i,"is pressed");
            }
        })*/
        

        gamepad.buttons.forEach((btn:GamepadButton,i:number)=>{
            if(this.gamepadButtons.has(i)){
                let manager = this.gamepadButtons.get(i);
                manager.detect(gamepad);
            }
        });
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
        this.sendButtons(gamepad);

        let gamepads:Array<Gamepad> = navigator.getGamepads()
        if(gamepads[gamepad.index] && this.running)
            setTimeout(()=>this.loop(gamepads[gamepad.index]),0);
    }

    private connected($this:GamepadEventManager,e:GamepadEvent):void{
        $this.setGamepad(e.gamepad);
        console.log("Gamepad connected", e.gamepad);
        if(this.running)
            setTimeout(()=>this.loop(e.gamepad),10);
    }

    public watch():void{
        window.addEventListener("gamepadconnected", (e:GamepadEvent)=>this.connected(this,e));
    }
}
import type CursorPositionSynchronizer from "../synchronizers/CursorPositionSynchronizer";

export default class GyroscopeEventManager{
    private cps:CursorPositionSynchronizer;
    private gyroscope;
    constructor(cps:CursorPositionSynchronizer){
        debugger;
        this.cps=cps;
    }

    private handleOrientation(e):void{
        debugger;
        console.log("orientation",e);
    }

    private handleMotion(e):void{
        debugger;
        console.log("motion",e);
    }

    public watch():void{
        debugger;
        window.addEventListener("deviceorientation", this.handleOrientation, true);
        window.addEventListener("devicemotion", this.handleMotion, true);
    }
}
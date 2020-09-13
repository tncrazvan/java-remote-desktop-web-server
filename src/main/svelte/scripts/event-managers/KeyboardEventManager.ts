import type CursorPositionSynchronizer from "../synchronizers/CursorPositionSynchronizer";
import type TypingSynchronizer from "../synchronizers/TypingSynchronizer";

export default class KeyboardEventManager{
    private cps:CursorPositionSynchronizer;
    private ts:TypingSynchronizer;
    constructor(cps:CursorPositionSynchronizer,ts:TypingSynchronizer){
        this.cps=cps;
        this.ts=ts;
    }

    public watch():void{
        this.manageKeyUp();
        this.manageKeyDown();
    }

    private manageKeyUp():void{
        document.body.onkeyup=event=>{
            switch(event.code){
                case "ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight":
                    this.cps.stopMoving();
                    this.cps.send();
                break;
                default:
                    //do nothing for the typing synchronizer
                break;
            }
            
        }
    }

    private manageKeyDown():void{
        document.body.onkeydown=event=>{
            switch(event.code){
                case "ArrowUp": this.cps.moveUp(); this.cps.send(); break;
                case "ArrowDown": this.cps.moveDown(); this.cps.send(); break;
                case "ArrowLeft": this.cps.moveLeft(); this.cps.send(); break;
                case "ArrowRight": this.cps.moveRight(); this.cps.send(); break;
                default:
                    console.log("sending",event.keyCode);
                    //this.ts.send(event.keyCode);
                break;
            }
        };
    }
}
import PositionSynchronizer from "./PositionSynchronizer";

export default class KeyboardEventManager{
    private ps:PositionSynchronizer;
    constructor(ps:PositionSynchronizer){
        this.ps=ps;
    }

    public watch():void{
        this.manageKeyUp();
        this.manageKeyDown();
    }

    private manageKeyUp():void{
        document.body.onkeyup=event=>{
            this.ps.setPressed(false);
        }
    }

    private manageKeyDown():void{
        document.body.onkeydown=event=>{
            switch(event.keyCode){
                case PositionSynchronizer.ARROW_UP: this.ps.moveUp(); break;
                case PositionSynchronizer.ARROW_DOWN: this.ps.moveDown(); break;
                case PositionSynchronizer.ARROW_LEFT: this.ps.moveLeft(); break;
                case PositionSynchronizer.ARROW_RIGHT: this.ps.moveRight(); break;
            }
        };
    }
}
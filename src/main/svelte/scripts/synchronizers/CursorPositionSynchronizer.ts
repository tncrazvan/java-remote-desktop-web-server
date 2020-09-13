export default class CursorPositionSynchronizer{
    public static readonly DIRECTION_LEFT:number = 8;
    public static readonly DIRECTION_RIGHT:number = 4;
    public static readonly DIRECTION_UP:number = 2;
    public static readonly DIRECTION_DOWN:number = 1;
    public static readonly DIRECTION_NONE:number = 0;
    private replied:boolean = false;
    private pressed:boolean = false;
    private direction:number = CursorPositionSynchronizer.DIRECTION_NONE;
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://"+location.host+"/cursor");
        this.ws.onopen=function(){
            console.log("Connected");
        };
        this.ws.onclose=function(){
            console.error("Disonnected");
        };
    }

    public setPressed(value:boolean):void{
        this.pressed = value;
    }

    public isPressed():boolean{
        return this.pressed;
    }
    
    public moveUp():void{
        this.pressed = true;
        this.direction |= CursorPositionSynchronizer.DIRECTION_UP;
    }

    public moveDown():void{
        this.pressed = true;
        this.direction |= CursorPositionSynchronizer.DIRECTION_DOWN;
    }

    public moveLeft():void{
        this.pressed = true;
        this.direction |= CursorPositionSynchronizer.DIRECTION_LEFT;
    }
    
    public moveRight():void{
        this.pressed = true;
        this.direction |= CursorPositionSynchronizer.DIRECTION_RIGHT;
    }

    public stopMoving():void{
        this.setPressed(false);
        this.direction = CursorPositionSynchronizer.DIRECTION_NONE;
    }

    private lastSentDirection:number;
    public send():void{
        if(this.lastSentDirection !== undefined && this.lastSentDirection === this.direction){
            console.log("Same direction as before.");
            return;
        }
        console.log("Sending:",this.direction);
        this.ws.send(''+this.direction);
        this.lastSentDirection = this.direction;
    }
}
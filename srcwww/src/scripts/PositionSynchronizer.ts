import BinaryPoint32 from "./BinaryPoint32";

export default class PositionSynchronizer{
    public static readonly STEP:number = 10;
    public static readonly REFRESH_RATE:number = 10;
    public static readonly ARROW_UP:number = 38;
    public static readonly ARROW_DOWN:number = 40;
    public static readonly ARROW_LEFT:number = 37;
    public static readonly ARROW_RIGHT:number = 39;
    private replied:boolean = false;
    private pressed:boolean = false;
    private ws:WebSocket;
    private x:number = 0;
    private y:number = 0;
    private lastSentX:number = 0;
    private lastSentY:number = 0;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://localhost/mouse/tncrazvan");
        this.ws.onopen=e=>{
            this.replied=true;
            this.x=0;
            this.y=0;
        };
        this.ws.onmessage=e=>{
            this.replied=true;
            this.x=0;
            this.y=0;
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
        if(this.y > 0) this.y = 0;
        this.y-=PositionSynchronizer.STEP;
    }

    public moveDown():void{
        this.pressed = true;
        if(this.y < 0) this.y= 0;
        this.y+=PositionSynchronizer.STEP;
    }

    public moveLeft():void{
        this.pressed = true;
        if(this.x > 0) this.x = 0;
        this.x-=PositionSynchronizer.STEP;
    }
    
    public moveRight():void{
        this.pressed = true;
        if(this.x < 0) this.x = 0;
        this.x+=PositionSynchronizer.STEP;
    }

    private send():void{
        console.log(this.x,this.y);
        let point:BinaryPoint32 = new BinaryPoint32(this.x,this.y);
        this.ws.send(point.get()+'');
        this.lastSentX = this.x;
        this.lastSentY = this.y;
        this.x = 0;
        this.y = 0;
    }

    public trySend():void{
        if((this.lastSentX !== this.x || this.lastSentY !== this.y) && this.pressed) try {
            console.log("sending");
            this.replied = false;
            this.send();
        }catch(e){
            console.error(e);
        }
    }
}
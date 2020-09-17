export default class MousePositionSynchronizer{
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://127.0.0.1/mouse-position");
        this.ws.onopen=function(){
            console.log("Cursor Position Synchronizer Connected");
        };
        this.ws.onclose=function(){
            console.error("Cursor Position Synchronizer Disonnected");
        };
    }

    private lastSentDirection:number;
    public send(x:number,y:number):void{
        this.ws.send((x * 10).toFixed(0)+"x"+(y * 10).toFixed(0));
    }

    public close():void{
        this.ws.close();
    }
}
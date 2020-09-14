export default class CursorPositionSynchronizer{
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://razshare.zapto.org/cursor");
        this.ws.onopen=function(){
            console.log("Connected");
        };
        this.ws.onclose=function(){
            console.error("Disonnected");
        };
    }

    private lastSentDirection:number;
    public send(x,y):void{
        x = (x * 10).toFixed(0);
        y = (y * 10).toFixed(0);
        this.ws.send(x+"x"+y);
    }
}
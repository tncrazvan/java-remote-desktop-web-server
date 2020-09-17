export default class MouseButtonSynchronizer{
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://127.0.0.1/mouse-button");
        this.ws.onopen=function(){
            console.log("Mouse Button Synchronizer Connected");
        };
        this.ws.onclose=function(){
            console.error("Mouse Button Synchronizer Disonnected");
        };
    }

    private lastSentDirection:number;
    public send(btnCode:number):void{
        this.ws.send(""+btnCode);
    }
    public close():void{
        this.ws.close();
    }
}
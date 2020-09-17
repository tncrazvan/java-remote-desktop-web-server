export default class TypingSynchronizer{
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://127.0.0.1/typing");
        this.ws.onopen=function(){
            console.log("Typing Synchronizer Connected");
        };
        this.ws.onclose=function(){
            console.error("Typing Synchronizer Disonnected");
        };
    }
    
    public send(keycode:number):void{
        this.ws.send(''+keycode);
    }
    public close():void{
        this.ws.close();
    }
}
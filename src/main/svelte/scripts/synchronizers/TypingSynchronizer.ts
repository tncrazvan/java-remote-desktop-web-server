export default class TypingSynchronizer{
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://192.168.1.236/typing");
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
}
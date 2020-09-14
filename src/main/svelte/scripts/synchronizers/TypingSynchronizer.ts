export default class TypingSynchronizer{
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://192.168.1.236/typing");
        this.ws.onopen=function(){
            console.log("Connected");
        };
        this.ws.onclose=function(){
            console.error("Disonnected");
        };
    }
    
    public send(keycode:number):void{
        this.ws.send(''+keycode);
    }
}
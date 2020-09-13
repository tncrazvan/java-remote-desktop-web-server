export default class TypingSynchronizer{
    private ws:WebSocket;
    constructor(){
        this.manageWebSocket();
    }

    private manageWebSocket():void{
        this.ws = new WebSocket("ws://"+location.host+"/typing");
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
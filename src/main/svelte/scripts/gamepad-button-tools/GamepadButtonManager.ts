export default class GamepadButtonManager{
    private time:number = 0;
    private delay:number = 0;
    private code:number = -1;
    private action:Function;
    private gamepad:Gamepad = undefined;
    constructor(code:number, delay:number = 0, action:Function = () => console.log("Button",this.code, "has been pressed")){
        this.delay = delay;
        this.code = code;
        this.action = action;
    }
    public setAction(callback:Function):void{
        this.action = callback;
    }
    public setPressed(pressed:boolean):void{
        if(pressed)
            this.time = Date.now();
        else
            this.time = 0;
    }
    public isPressed():boolean{
        return this.time > 0;
    }
    private margin:number = 20;
    private signalsPressed:number = 0;
    private signalsReleased:number = 0;
    public detect(gamepad:Gamepad):void{
        for(let i = 0; i < gamepad.buttons.length; i++){
            if(i === this.code){
                if(this.isPressed() && !gamepad.buttons[i].pressed){
                    if(this.signalsReleased < this.margin) {
                        this.signalsReleased++;
                        break;
                    }
                    this.signalsReleased = 0;
                    const end = Date.now();
                    const age = (end - this.time);
                    if(age >= this.delay){
                        this.action(this,age);
                    }else{
                        console.warn("Button",this.code,"has only been pressed for",age,"milliseconds, expected",this.delay,"milliseconds.");
                    }
                    this.setPressed(false);
                } else if(!this.isPressed() && gamepad.buttons[i].pressed){
                    if(this.signalsPressed < this.margin){
                        this.signalsPressed++;
                        break;
                    }
                    this.signalsPressed = 0;
                    this.setPressed(true);
                }
                break;
            }
        }
    }
}
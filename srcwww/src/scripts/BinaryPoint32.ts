export default class BinaryPoint32{
    private binary:number;
    constructor(x:number,y:number){
        this.binary = this.bin(x,y);
    }
    private bin(x,y):number{
        return (x << 16) + y;
    }

    public get():number{
        return this.binary;
    }
}
package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;


import javax.inject.Singleton;

public class MousePoint {
    private int x;
    private int y;

    public MousePoint(int x,int y){
        this.x=x;
        this.y=y;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }
    
}

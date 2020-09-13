package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.AWTException;
import java.awt.Robot;

import javax.inject.Singleton;


import java.awt.PointerInfo;
import java.awt.Point;
import java.awt.MouseInfo;

@Singleton
public class Mouse {
    private Mouse() {}
    private boolean left = false;
    private boolean right = false;
    private boolean up = false;
    private boolean down = false;
    private static final byte DIRECTION_LEFT = 0x8;
    private static final byte DIRECTION_RIGHT = 0x4;
    private static final byte DIRECTION_UP = 0x2;
    private static final byte DIRECTION_DOWN = 0x1;
    private static final byte DIRECTION_NONE = 0x0;
    public static final int STEP = 1;
    private Robot robot;
    static {
        System.setProperty("java.awt.headless", "false");
        System.out.println("#########MOUSE: Headless disabled.");
    }

    public void setDirection(byte direction){
        if(direction == DIRECTION_NONE){
            left = false;
            right = false;
            up = false;
            down = false;
        }else{
            left    = (direction & DIRECTION_LEFT)  == DIRECTION_LEFT;
            right   = (direction & DIRECTION_RIGHT) == DIRECTION_RIGHT;
            up      = (direction & DIRECTION_UP)    == DIRECTION_UP;
            down    = (direction & DIRECTION_DOWN)  == DIRECTION_DOWN;
        }
    }
    private boolean watching = false;
    public void watch() throws AWTException {
        if(watching) return;
        robot = new Robot();
        watching = true;
        new Thread(()->{
            int deltaX = 0;
            int deltaY = 0;
            int lastX = 0;
            int lastY = 0;
            int x = 0;
            int y = 0;
            Point current;
            while(watching){

                if(left) 
                    deltaX = -STEP;
                else if(right) 
                    deltaX = STEP;
                else 
                    deltaX = 0;

                if(up) 
                    deltaY = -STEP;
                else if
                    (down) deltaY = STEP;
                else 
                    deltaY = 0;

                if(deltaX == 0 && deltaY == 0)
                    continue;
                
                current = MouseInfo.getPointerInfo().getLocation();
                x = (int) current.getX()+deltaX;
                y = (int) current.getY()+deltaY;
                //System.out.println("moving to "+x+","+y);
                robot.mouseMove(x,y);
                lastX = x;
                lastY = y;
            }
        }).start();
    }
    
}

package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.AWTException;
import java.awt.Robot;

import javax.inject.Singleton;
import java.awt.PointerInfo;
import java.awt.MouseInfo;

@Singleton
public class Mouse {
    private PointerInfo minfo = MouseInfo.getPointerInfo();

    private Robot robot;
    static {
        System.setProperty("java.awt.headless", "false");
        System.out.println("#########MOUSE: Headless disabled.");
    }
    private Mouse() {}
    private int lastX = 0,lastY = 0;
    private boolean movingX = false;
    private boolean movingY = false;
    public void move(int x, int y) throws InterruptedException {
        if(robot == null) try {
            robot = new Robot();
        } catch (AWTException e) {
            e.printStackTrace();
        }
        
        if(robot != null){
            boolean xleft = x < 0;
            boolean ytop = y < 0;
            minfo = MouseInfo.getPointerInfo();
            lastX = (int) minfo.getLocation().getX();
            lastY = (int) minfo.getLocation().getY();
            x += lastX;
            y += lastY;
            movingX = true;
            movingY = true;
            
            while(movingX || movingY){
                lastX += xleft?(lastX > x?-1:0):(lastX < x?1:0);
                lastY += ytop?(lastY > y?-1:0):(lastY < y?1:0);

                    
                robot.mouseMove(lastX,lastY);

                movingX = xleft?(lastX > x):(lastX < x);
                movingY = ytop?(lastY > y):(lastY < y);

                Thread.sleep(0, 10);
            }

        }
    }
    
}

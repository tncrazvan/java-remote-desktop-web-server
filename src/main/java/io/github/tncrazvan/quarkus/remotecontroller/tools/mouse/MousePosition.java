package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.AWTException;
import java.awt.Robot;

import javax.inject.Singleton;

import java.awt.PointerInfo;
import java.awt.Point;
import java.awt.MouseInfo;

@Singleton
public class MousePosition {
    private MousePosition() {}
    private Robot robot;
    static {
        System.setProperty("java.awt.headless", "false");
    }
    private boolean watching = false;
    public int inputX = 0;
    public int inputY = 0;
    public void watch() throws AWTException {
        if (watching)
            return;
        robot = new Robot();
        watching = true;
        new Thread(() -> {
            int x = 0;
            int y = 0;
            Point current;
            
            try {
                while (watching) {
                    current = MouseInfo.getPointerInfo().getLocation();
                    x = (int) current.getX() + inputX;
                    y = (int) current.getY() + inputY;
                    inputX = 0;
                    inputY = 0;
                    robot.mouseMove(x, y);

                    Thread.sleep(0,500);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
    
}

package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.GraphicsEnvironment;
import java.awt.Rectangle;

import javax.inject.Inject;
import javax.inject.Singleton;

import io.github.tncrazvan.quarkus.remotecontroller.tools.MyRobot;

@Singleton
public class MousePosition {
    public static final long PRECISION = 10;
    @Inject
    MyRobot robot;
    @Inject
    MouseButton mouseButton;
    private MousePosition() {}
    static {
        System.setProperty("java.awt.headless", "false");
    }
    public int inputX = 0;
    public int inputY = 0;


    private Rectangle rect = GraphicsEnvironment.getLocalGraphicsEnvironment().getMaximumWindowBounds();
    private int xCenter = (int)(rect.width/2);
    private int yCenter = (int)(rect.height/2);
    private int x = xCenter;
    private int y = yCenter;
    private long lastExecTime = 0;
    public void watch() {
        long time = System.currentTimeMillis();
        if(time - lastExecTime < PRECISION) return;
        lastExecTime = time;
        if(inputX != 0 || inputY != 0){
            y += inputY;
            x += inputX;
            robot.mouseMove(x, y);
        }
        inputX = 0;
        inputY = 0;
    }
    
}

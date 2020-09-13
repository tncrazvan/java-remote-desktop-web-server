package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.AWTException;
import java.awt.Robot;

import javax.inject.Singleton;


@Singleton
public class Keyboard {
    private Keyboard() {}
    private Robot robot;

    public Robot getRobot(){
        return robot;
    }

    private boolean watching = false;
    public void watch() throws AWTException {
        if(watching) return;
        robot = new Robot();
    }
    
}

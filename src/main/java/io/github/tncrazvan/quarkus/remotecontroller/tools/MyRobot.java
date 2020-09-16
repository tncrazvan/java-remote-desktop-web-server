package io.github.tncrazvan.quarkus.remotecontroller.tools;

import java.awt.AWTException;
import java.awt.Robot;

import javax.inject.Singleton;

@Singleton
public class MyRobot extends Robot {

    public MyRobot() throws AWTException {
        super();
        // TODO Auto-generated constructor stub
    }

}

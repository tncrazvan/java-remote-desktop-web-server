package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.InputEvent;
import java.util.HashMap;
import java.util.Map;

import javax.inject.Singleton;

@Singleton
public class MouseButton {
    private MouseButton() {}

    private Robot robot;

    private int buttonLeft = InputEvent.BUTTON1_DOWN_MASK;
    private int buttonRight = InputEvent.BUTTON3_DOWN_MASK;

    private Map<Integer, Boolean> request = new HashMap<>() {
        private static final long serialVersionUID = 3265602770485092727L;
        {
            put(buttonLeft, false);
            put(buttonRight, false);
        }
    };

    private Map<Integer, Boolean> status = new HashMap<>() {
        private static final long serialVersionUID = -977091579766151769L;
        {
            put(buttonLeft, false);
            put(buttonRight, false);
        }
    };

    public void press(int key) {
        if (key != 0)
            request.put(key, true);
    }

    public void release(int key) {
        if (key != 0)
            request.put(key, false);
    }

    private boolean watching = false;

    public void watch() throws AWTException {
        if (watching)
            return;
        robot = new Robot();
        watching = true;

        new Thread(() -> {
            Integer[] keys = status.keySet().toArray(new Integer[0]);
            
            try {
                while (watching) {
                    for (int i = 0; i < keys.length; i++) {
                        int key = keys[i];
                        boolean statusButton = status.get(key);
                        boolean requestButton = request.get(key);
                        if(statusButton && !requestButton){
                            robot.mouseRelease(key);
                        }
                        if(!statusButton && requestButton){
                            robot.mousePress(key);
                        }
                        
                        status.put(key, requestButton);
                    }
                    Thread.sleep(1);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
    
}

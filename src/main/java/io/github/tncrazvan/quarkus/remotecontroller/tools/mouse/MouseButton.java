package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.event.InputEvent;
import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Singleton;

import io.github.tncrazvan.quarkus.remotecontroller.tools.MyRobot;

@Singleton
public class MouseButton {
    public static final long PRECISION = 10;
    private MouseButton() {}

    @Inject
    MyRobot robot;

    public static final int BUTTON_1 = InputEvent.BUTTON1_DOWN_MASK;
    public static final int BUTTON_2 = InputEvent.BUTTON3_DOWN_MASK;
    public boolean holdingButton2(){
        return status.get(BUTTON_2);
    }
    
    private Map<Integer, Boolean> request = new HashMap<>() {
        private static final long serialVersionUID = 3265602770485092727L;
        {
            put(BUTTON_1, false);
            put(BUTTON_2, false);
        }
    };

    private Map<Integer, Boolean> status = new HashMap<>() {
        private static final long serialVersionUID = -977091579766151769L;
        {
            put(BUTTON_1, false);
            put(BUTTON_2, false);
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

    private Integer[] keys = status.keySet().toArray(new Integer[0]);
    private long lastExecTime = 0;
    public void watch() {
        long time = System.currentTimeMillis();
        if(time - lastExecTime < PRECISION) return;
        lastExecTime = time;
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
    }
    
}

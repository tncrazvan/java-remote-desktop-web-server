package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.awt.AWTException;
import java.awt.Robot;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.inject.Singleton;

@Singleton
public class Keyboard {
    private Keyboard() {
    }

    private Robot robot;
    private int keyQ = 81;
    private int keyE = 69;
    private int keyW = 87;
    private int keyS = 83;

    private int keyLeft = 37;
    private int keyRight = 39;
    private int keyUp = 38;
    private int keyDown = 40;

    private Map<Integer, Boolean> request = new HashMap<>() {
        private static final long serialVersionUID = 3780356254428489014L;
        {
            put(keyQ, false);
            put(keyE, false);
            put(keyW, false);
            put(keyS, false);

            put(keyLeft, false);
            put(keyRight, false);
            put(keyUp, false);
            put(keyDown, false);
        }
    };

    private Map<Integer, Boolean> status = new HashMap<>() {
        private static final long serialVersionUID = 508893608630487606L;
        {
            put(keyQ, false);
            put(keyE, false);
            put(keyW, false);
            put(keyS, false);

            put(keyLeft, false);
            put(keyRight, false);
            put(keyUp, false);
            put(keyDown, false);
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
                        boolean statusKey = status.get(key);
                        boolean requestKey = request.get(key);
                        if(statusKey && !requestKey){
                            robot.keyRelease(key);
                        }
                        if(!statusKey && requestKey){
                            robot.keyPress(key);
                        }
                        
                        status.put(key, requestKey);
                    }
                    Thread.sleep(1);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
    
}

package io.github.tncrazvan.quarkus.remotecontroller.tools.mouse;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Singleton;

import io.github.tncrazvan.quarkus.remotecontroller.tools.MyRobot;

@Singleton
public class Keyboard {
    public static final long PRECISION = 10;
    private Keyboard() {}
    @Inject
    MyRobot robot;
    public static final int keyQ = 81;
    public static final  int keyE = 69;
    public static final  int keyW = 87;
    public static final  int keyS = 83;
    public static final  int keyA = 65;
    public static final  int keyD = 68;

    public static final  int keyLeft = 37;
    public static final  int keyRight = 39;
    public static final  int keyUp = 38;
    public static final  int keyDown = 40;
    public static final  int keySpace = 32;

    private Map<Integer, Boolean> request = new HashMap<>() {
        private static final long serialVersionUID = 3780356254428489014L;
        {
            put(keyQ, false);
            put(keyE, false);
            put(keyW, false);
            put(keyS, false);
            put(keyA, false);
            put(keyD, false);

            put(keyLeft, false);
            put(keyRight, false);
            put(keyUp, false);
            put(keyDown, false);

            put(keySpace, false);
        }
    };

    private Map<Integer, Boolean> status = new HashMap<>() {
        private static final long serialVersionUID = 508893608630487606L;
        {
            put(keyQ, false);
            put(keyE, false);
            put(keyW, false);
            put(keyS, false);
            put(keyA, false);
            put(keyD, false);

            put(keyLeft, false);
            put(keyRight, false);
            put(keyUp, false);
            put(keyDown, false);

            put(keySpace, false);
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

    private Integer[] allKeys = status.keySet().toArray(new Integer[0]);
    private long lastExecTime = 0;
    public void watch() {
        long time = System.currentTimeMillis();
        if(time - lastExecTime < PRECISION) return;
        lastExecTime = time;
        for (int i = 0; i < allKeys.length; i++) {
            int key = allKeys[i];
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
    }
    
}

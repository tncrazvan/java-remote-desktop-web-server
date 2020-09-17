package io.github.tncrazvan.quarkus.remotecontroller.tools;

import javax.inject.Inject;
import javax.inject.Singleton;

import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Keyboard;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MouseButton;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MousePosition;
import io.github.tncrazvan.quarkus.remotecontroller.tools.screen.ScreenRecorder;
import java.awt.AWTException;
import java.io.IOException;
import java.util.LinkedList;
import javax.websocket.Session;

@Singleton
public class Loop {
    public boolean watching = false;

    @Inject
    MyRobot robot;

    @Inject
    Keyboard keyboard;

    @Inject
    MouseButton mouseButton;

    @Inject
    MousePosition mousePosition;
    
    @Inject 
    ScreenRecorder recorder;

    private long age = 0;
    private long start = 0;
    
    public LinkedList<Session> recsessions = new LinkedList<Session>();
    
    public void run() throws InterruptedException, IOException, AWTException {
        if(watching)
            return;
        watching = true;
        
        /*
        new Thread(()->{
            try {
                recorder.setArea(0, 0, 1920, 1080);
                while (watching) {
                    recorder.capture();
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
        */
        
        new Thread(()->{
            try {
                while (watching) {
                    keyboard.watch();
                    Thread.sleep(0, 300);
                }
            } catch (InterruptedException e) {    
                e.printStackTrace();
            }
        }).start();

        new Thread(()->{
            try {
                while (watching) {
                    mouseButton.watch();
                    Thread.sleep(0, 300);
                }
            } catch (InterruptedException e) {    
                e.printStackTrace();
            }
        }).start();

        new Thread(()->{
            try {
                while (watching) {
                    mousePosition.watch();
                    Thread.sleep(0, 300);
                }
            } catch (InterruptedException e) {    
                e.printStackTrace();
            }
        }).start();
    }
    
}

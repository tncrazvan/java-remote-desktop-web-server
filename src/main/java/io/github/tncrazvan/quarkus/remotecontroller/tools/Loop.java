package io.github.tncrazvan.quarkus.remotecontroller.tools;

import javax.inject.Inject;
import javax.inject.Singleton;

import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Keyboard;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MouseButton;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MousePosition;

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

    private long age = 0;
    private long start = 0;
    
    
    public void run() {
        if(watching)
            return;
        watching = true;
        
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

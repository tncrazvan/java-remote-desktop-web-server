package io.github.tncrazvan.quarkus.remotecontroller.tools;

import javax.inject.Inject;
import javax.inject.Singleton;

import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Keyboard;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MouseButton;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MousePosition;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.imageio.ImageIO;

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

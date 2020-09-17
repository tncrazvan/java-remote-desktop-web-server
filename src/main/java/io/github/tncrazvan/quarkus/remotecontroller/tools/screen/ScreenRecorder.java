/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package io.github.tncrazvan.quarkus.remotecontroller.tools.screen;

import java.awt.Rectangle;
import java.io.File;

import javax.inject.Inject;
import javax.inject.Singleton;

import io.github.tncrazvan.quarkus.remotecontroller.tools.Logger;
import io.github.tncrazvan.quarkus.remotecontroller.tools.MyRobot;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.awt.image.MultiResolutionImage;
import java.awt.image.RenderedImage;
import java.io.IOException;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriter;
import org.jcodec.api.awt.AWTSequenceEncoder;

/**
 *
 * @author Administrator
 */
@Singleton
public class ScreenRecorder {
    @Inject
    Logger log;

    @Inject
    MyRobot robot;
    private Rectangle area;
    public void setArea(int x, int y, int width, int height) {
        area = new Rectangle(x, y, width, height);
    }
    
    /**
    * Converts a given Image into a BufferedImage
    *
    * @param img The Image to be converted
    * @return The converted BufferedImage
    */
   public static BufferedImage toBufferedImage(Image img){
       if (img instanceof BufferedImage)
       {
           return (BufferedImage) img;
       }

       // Create a buffered image with transparency
       BufferedImage bimage = new BufferedImage(img.getWidth(null), img.getHeight(null), BufferedImage.TYPE_INT_RGB);

       // Draw the image on to the buffered image
       Graphics2D bGr = bimage.createGraphics();
       bGr.drawImage(img, 0, 0, null);
       //bGr.drawImage(img, 0, 0, width, height, 0, 0, img.getWidth(null), img.getWidth(null), null);
       bGr.dispose();

       // Return the buffered image
       return bimage;
   }
    public Image current;
    public void capture() throws IOException {
        this.current = robot.createScreenCapture(area).getScaledInstance(600, 400, Image.SCALE_FAST);
        
    }
}
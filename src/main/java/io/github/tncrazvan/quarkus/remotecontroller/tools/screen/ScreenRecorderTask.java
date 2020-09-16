/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package io.github.tncrazvan.quarkus.remotecontroller.tools.screen;

import java.awt.GraphicsConfiguration;
import java.awt.GraphicsEnvironment;
import java.io.File;
import java.text.Format;
import java.util.TimerTask;
import javax.inject.Singleton;
import javax.ws.rs.core.MediaType;
import static org.jboss.resteasy.resteasy_jaxrs.i18n.LogMessages.LOGGER;

/**
 *
 * @author Administrator
 */
@Singleton
public class ScreenRecorderTask extends TimerTask {
    @Override
    public void run() {
        System.out.println("hello world");
    }
}
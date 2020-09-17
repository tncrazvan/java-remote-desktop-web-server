/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package io.github.tncrazvan.quarkus.remotecontroller.tools;

import java.util.logging.Level;
import javax.inject.Singleton;

/**
 *
 * @author Administrator
 */
@Singleton
public class Logger {
    private static final java.util.logging.Logger logger = java.util.logging.Logger.getLogger(Logger.class.getName());
    public void show(Throwable e){
        logger.log(Level.SEVERE, null, e);
    }
}

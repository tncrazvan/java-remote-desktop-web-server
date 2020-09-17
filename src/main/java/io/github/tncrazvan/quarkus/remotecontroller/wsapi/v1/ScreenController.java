package io.github.tncrazvan.quarkus.remotecontroller.wsapi.v1;


import io.github.tncrazvan.quarkus.remotecontroller.tools.Logger;
import java.awt.AWTException;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import io.github.tncrazvan.quarkus.remotecontroller.tools.Loop;
import io.github.tncrazvan.quarkus.remotecontroller.tools.screen.ScreenRecorder;
import java.io.IOException;

@ServerEndpoint("/screen")
@ApplicationScoped
public class ScreenController {
    @Inject
    Loop loop;

    @Inject
    ScreenRecorder recorder;

    @Inject
    Logger log;
    //private Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) throws InterruptedException, IOException, AWTException {
        loop.run();
        new Thread(()->{
            int i = 0;
            try {
                System.out.println(i+"");
                i++;
                Thread.sleep(25);
            } catch (InterruptedException ex) {
                log.show(ex);
            }
        }).start();
    }

    @OnClose
    public void onClose(Session session) {}

    @OnError
    public void onError(Session session, Throwable throwable) {}

    @OnMessage
    public void onMessage(Session session, String message){}


}
package io.github.tncrazvan.quarkus.remotecontroller.wsapi.v1;


import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import io.github.tncrazvan.quarkus.remotecontroller.tools.Loop;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Keyboard;
import java.awt.AWTException;
import java.io.IOException;

@ServerEndpoint("/typing")
@ApplicationScoped
public class TypingController {
    @Inject
    Loop loop;
    @Inject
    Keyboard keyboard;


    //private Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) throws InterruptedException, IOException, AWTException {
        loop.run();
    }

    @OnClose
    public void onClose(Session session) {}

    @OnError
    public void onError(Session session, Throwable throwable) {}


    @OnMessage
    public void onMessage(Session session, String message){
        int key = Integer.parseInt(message);
        if(key < 0)
            keyboard.release(-key);
        else
            keyboard.press(key);
    }


}
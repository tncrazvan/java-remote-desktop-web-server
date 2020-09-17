package io.github.tncrazvan.quarkus.remotecontroller.wsapi.v1;


import java.awt.AWTException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import io.github.tncrazvan.quarkus.remotecontroller.tools.Loop;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MouseButton;
import java.io.IOException;

@ServerEndpoint("/mouse-button")
@ApplicationScoped
public class MouseButtonController {
    @Inject
    Loop loop;

    @Inject
    MouseButton mouseButton;

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
            mouseButton.release(-key);
        else
            mouseButton.press(key);
    }


}
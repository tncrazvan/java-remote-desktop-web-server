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
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Keyboard;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MouseButton;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MousePosition;

@ServerEndpoint("/mouse-position")
@ApplicationScoped
public class MousePositionController {
    @Inject
    Loop loop;
    @Inject
    MousePosition mousePosition;


    Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) {
        loop.run();
    }

    @OnClose
    public void onClose(Session session) {}

    @OnError
    public void onError(Session session, Throwable throwable) {}

    @OnMessage
    public void onMessage(Session session, String message){
        String[] xy = message.split("x");
        mousePosition.inputX = Integer.parseInt(xy[0]);
        mousePosition.inputY = Integer.parseInt(xy[1]);
    }


}
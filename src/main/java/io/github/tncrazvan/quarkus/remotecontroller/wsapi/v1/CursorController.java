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

import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Mouse;

@ServerEndpoint("/cursor")
@ApplicationScoped
public class CursorController {
    @Inject
    Mouse mouse;

    Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) throws AWTException {
        mouse.watch();
    }

    @OnClose
    public void onClose(Session session) {}

    @OnError
    public void onError(Session session, Throwable throwable) {}

    @OnMessage
    public void onMessage(Session session, String message){
        String[] xy = message.split("x");
        mouse.inputX = Integer.parseInt(xy[0]);
        mouse.inputY = Integer.parseInt(xy[1]);
    }


}
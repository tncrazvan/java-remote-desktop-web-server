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
import java.awt.Robot;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Keyboard;

@ServerEndpoint("/typing")
@ApplicationScoped
public class TypingController {
    @Inject
    Keyboard keyboard;
    Robot robot;

    Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session) throws AWTException {
        keyboard.watch();
        robot = keyboard.getRobot();
    }

    @OnClose
    public void onClose(Session session) {}

    @OnError
    public void onError(Session session, Throwable throwable) {}

    @OnMessage
    public void onMessage(Session session, String message){
        int code = Integer.parseInt(message);
        robot.keyPress(code);
        robot.keyRelease(code);
        System.out.println(String.format("key: %s", code));
    }


}
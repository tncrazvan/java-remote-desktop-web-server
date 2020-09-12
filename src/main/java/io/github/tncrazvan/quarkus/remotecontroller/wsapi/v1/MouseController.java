package io.github.tncrazvan.quarkus.remotecontroller.wsapi.v1;


import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.Mouse;
import io.github.tncrazvan.quarkus.remotecontroller.tools.mouse.MousePoint;

@ServerEndpoint("/mouse/{username}")
@ApplicationScoped
public class MouseController {
    @Inject
    Mouse mouse;
    
    Map<String, Session> sessions = new ConcurrentHashMap<>();
    @OnOpen
    public void onOpen(Session session, @PathParam("username") String username) {
        sessions.put(username, session);
        System.out.println(String.format("%s joined.", username));
    }


    @OnClose
    public void onClose(Session session, @PathParam("username") String username) {
        sessions.remove(username);
        System.out.println(String.format("%s left.", username));
    }

    @OnError
    public void onError(Session session, @PathParam("username") String username, Throwable throwable) {
        sessions.remove(username);
        System.out.println(String.format("%s left on error %s.", username, throwable));
    }

    @OnMessage
    public void onMessage(Session session, String message, @PathParam("username") String username)
            throws InterruptedException {
        int data = Integer.parseInt(message);
        int x = data >> 16;
        int y = (data << 16) >> 16;
        System.out.println(String.format(">> %s,%s", x, y));
        mouse.move(x, y);
        //session.getAsyncRemote().sendText("1");
    }

    private void broadcast(String message) {
        sessions.values().forEach(s -> {
            s.getAsyncRemote().sendObject(message, result ->  {
                if (result.getException() != null) {
                    System.out.println("Unable to send message: " + result.getException());
                }
            });
        });
    }

}
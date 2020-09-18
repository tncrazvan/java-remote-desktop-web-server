package io.github.tncrazvan.quarkus.remotecontroller.tools;

import javax.inject.Singleton;

@Singleton
public class RTCPeerConnectionMetadata {
    private String metadata = "";
    public void set(String metadata){
        this.metadata = metadata;
    }
    public String get(){
        return metadata;
    }
}

package io.github.tncrazvan.quarkus.remotecontroller.restapi;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;


@Path("/stream")
public class StreamController {
    
    @Singleton
    public static class RTCMetadata{
        public String serverOffer = "";
        public String clientAnswer = "";
        public String clientCandidate = "";
        public String serverCandidate = "";
    }

    @Inject
    RTCMetadata metadata;

    //SERVER & CLIENT
    @GET
    @Path("/reset")
    public void reset(){
        metadata.serverOffer = "";
        metadata.clientAnswer = "";
        metadata.serverCandidate = "";
        metadata.clientCandidate = "";
    }


    //SERVER

    @POST
    @Path("/server/offer")
    @Consumes(MediaType.TEXT_PLAIN)
    public void setServerOffer(String serverOffer){
        metadata.serverOffer = serverOffer;
    }

    @GET
    @Path("/server/offer")
    @Produces(MediaType.TEXT_PLAIN)
    public String getServerOffer(){
        return metadata.serverOffer;
    }

    @POST
    @Path("/server/candidate")
    @Consumes(MediaType.TEXT_PLAIN)
    public void setServerCandidate(String serverCandidate){
        metadata.serverCandidate = serverCandidate;
    }

    @GET
    @Path("/server/candidate")
    @Produces(MediaType.TEXT_PLAIN)
    public String getServeCandidate(){
        return metadata.serverCandidate;
    }


    //CLIENT

    @POST
    @Path("/client/answer")
    @Consumes(MediaType.TEXT_PLAIN)
    public void setClientAnswer(String clientAnswer){
        metadata.clientAnswer = clientAnswer;
    }

    @GET
    @Path("/client/answer")
    @Produces(MediaType.TEXT_PLAIN)
    public String getClientAnswer(){
        return metadata.clientAnswer;
    }


    @POST
    @Path("/client/candidate")
    @Consumes(MediaType.TEXT_PLAIN)
    public void setClientCandidate(String clientCandidate){
        metadata.clientCandidate = clientCandidate;
    }

    @GET
    @Path("/client/candidate")
    @Produces(MediaType.TEXT_PLAIN)
    public String getClientCandidate(){
        return metadata.clientCandidate;
    }

}

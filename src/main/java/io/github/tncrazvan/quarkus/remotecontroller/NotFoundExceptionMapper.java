package io.github.tncrazvan.quarkus.remotecontroller;

import java.io.File;
import java.io.IOException;

import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

/**
 * NotFoundExepptionMapper
 */
@Provider
public class NotFoundExceptionMapper implements ExceptionMapper<NotFoundException> {
    @Override
    public Response toResponse(NotFoundException exception) {
        String text;
        try {
            text = new String(this.getClass().getResourceAsStream("/META-INF/resources/index.html").readAllBytes(),"UTF-8");
        } catch (IOException e) {
            e.printStackTrace();
            text = e.getStackTrace().toString();
        }
        return Response.status(200).entity(text).build();
    }
}
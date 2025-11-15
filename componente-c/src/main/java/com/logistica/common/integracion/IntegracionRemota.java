package com.logistica.common.integracion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class IntegracionRemota {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static String invocarPing(String baseUrl) throws IOException, InterruptedException {
        String url = baseUrl + "/api/integracion/ping";

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();

        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode node = mapper.readTree(response.body());
            if (node.has("mensaje")) {
                return node.get("mensaje").asText();
            }
            return response.body();
        } else {
            throw new IOException("Error HTTP al invocar " + url + ": " + response.statusCode());
        }
    }
}

package com.logistica.a.controller;

import com.logistica.common.integracion.IntegracionRemota;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/integracion")
public class IntegracionController {

    @Operation(summary = "Ping local del componente A",
            description = "Usado por el componente C para demostrar el flujo circular.")
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok().body(new Mensaje("Ping desde Componente A"));
    }

    @Operation(summary = "Probar integración llamando a otro componente vía librería C")
    @GetMapping("/probar-remoto")
    public ResponseEntity<?> probarRemoto(@RequestParam String urlBase) throws IOException, InterruptedException {
        String mensaje = IntegracionRemota.invocarPing(urlBase);
        return ResponseEntity.ok(new Mensaje("Respuesta remota: " + mensaje));
    }

    public record Mensaje(String mensaje) {}
}

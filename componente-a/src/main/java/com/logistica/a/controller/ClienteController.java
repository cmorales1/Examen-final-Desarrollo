package com.logistica.a.controller;

import com.logistica.a.domain.Cliente;
import com.logistica.a.dto.ClienteRequest;
import com.logistica.a.repository.ClienteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Operation(summary = "Registrar un nuevo cliente",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Cliente creado",
                            content = @Content(schema = @Schema(implementation = Cliente.class))),
                    @ApiResponse(responseCode = "400", description = "Datos inválidos")
            })
    @PostMapping
    public ResponseEntity<Cliente> crear(@Validated @RequestBody ClienteRequest request) {
        Cliente c = new Cliente();
        c.setNombre(request.getNombre());
        c.setEmail(request.getEmail());
        c.setTelefono(request.getTelefono());
        Cliente saved = clienteRepository.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "Listar todos los clientes")
    @GetMapping
    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    @Operation(summary = "Obtener un cliente por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtener(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

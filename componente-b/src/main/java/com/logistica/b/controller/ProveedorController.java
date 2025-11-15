package com.logistica.b.controller;

import com.logistica.b.domain.Proveedor;
import com.logistica.b.dto.ProveedorRequest;
import com.logistica.b.repository.ProveedorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorRepository proveedorRepository;

    public ProveedorController(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    @Operation(summary = "Registrar un nuevo proveedor",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Proveedor creado"),
                    @ApiResponse(responseCode = "400", description = "Datos inválidos")
            })
    @PostMapping
    public ResponseEntity<Proveedor> crear(@Validated @RequestBody ProveedorRequest request) {
        Proveedor p = new Proveedor();
        p.setNombre(request.getNombre());
        p.setEmail(request.getEmail());
        p.setTelefono(request.getTelefono());
        Proveedor saved = proveedorRepository.save(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @Operation(summary = "Listar todos los proveedores")
    @GetMapping
    public List<Proveedor> listar() {
        return proveedorRepository.findAll();
    }

    @Operation(summary = "Obtener un proveedor por ID")
    @GetMapping("/{id}")
    public ResponseEntity<Proveedor> obtener(@PathVariable Long id) {
        return proveedorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

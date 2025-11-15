package com.logistica.b.controller;

import com.logistica.b.domain.Factura;
import com.logistica.b.dto.FacturaRequest;
import com.logistica.b.service.FacturaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
public class FacturaController {

    private final FacturaService facturaService;

    public FacturaController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @Operation(summary = "Registrar una nueva factura",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Factura creada"),
                    @ApiResponse(responseCode = "400", description = "Datos inválidos o proveedor inexistente")
            })
    @PostMapping
    public ResponseEntity<Factura> crear(@Validated @RequestBody FacturaRequest request) {
        Factura f = facturaService.crearFactura(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(f);
    }

    @Operation(summary = "Listar todas las facturas")
    @GetMapping
    public List<Factura> listar() {
        return facturaService.listarFacturas();
    }

    @Operation(summary = "Listar facturas por proveedor")
    @GetMapping("/proveedor/{proveedorId}")
    public List<Factura> listarPorProveedor(@PathVariable Long proveedorId) {
        return facturaService.listarFacturasPorProveedor(proveedorId);
    }
}

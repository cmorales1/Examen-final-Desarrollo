package com.logistica.a.controller;

import com.logistica.a.domain.Pedido;
import com.logistica.a.dto.PedidoRequest;
import com.logistica.a.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @Operation(summary = "Registrar un nuevo pedido",
            description = "Crea un pedido asociado a un cliente existente.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Pedido creado"),
                    @ApiResponse(responseCode = "400", description = "Datos inválidos o cliente inexistente")
            })
    @PostMapping
    public ResponseEntity<Pedido> crear(@Validated @RequestBody PedidoRequest request) {
        Pedido p = pedidoService.crearPedido(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(p);
    }

    @Operation(summary = "Listar todos los pedidos")
    @GetMapping
    public List<Pedido> listar() {
        return pedidoService.listarPedidos();
    }

    @Operation(summary = "Listar pedidos por cliente")
    @GetMapping("/cliente/{clienteId}")
    public List<Pedido> listarPorCliente(@PathVariable Long clienteId) {
        return pedidoService.listarPedidosPorCliente(clienteId);
    }
}

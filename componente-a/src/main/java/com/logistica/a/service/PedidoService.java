package com.logistica.a.service;

import com.logistica.a.domain.Cliente;
import com.logistica.a.domain.Pedido;
import com.logistica.a.dto.PedidoRequest;
import com.logistica.a.dto.ProductoDTO;
import com.logistica.a.repository.ClienteRepository;
import com.logistica.a.repository.PedidoRepository;
import com.logistica.common.model.Producto;
import com.logistica.common.util.CalculadoraFinanciera;
import com.logistica.common.util.CodigoGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;

    public PedidoService(ClienteRepository clienteRepository, PedidoRepository pedidoRepository) {
        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional
    public Pedido crearPedido(PedidoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException("Cliente no existe"));

        // Convertir DTOs de productos a objetos Producto de la librería común
        List<Producto> productos = request.getProductos().stream()
                .map(dto -> new Producto(
                        dto.getCodigo(),
                        dto.getNombre(),
                        dto.getCantidad(),
                        dto.getPrecioUnitario()
                ))
                .collect(Collectors.toList());

        // Calcular el total usando la librería común (Componente C)
        double total = CalculadoraFinanciera.calcularTotal(productos);

        Pedido pedido = new Pedido();
        pedido.setCliente(cliente);
        pedido.setFechaCreacion(LocalDateTime.now());
        pedido.setCodigo(CodigoGenerator.generarCodigoUnico("PED"));
        pedido.setTotal(total);

        return pedidoRepository.save(pedido);
    }

    public List<Pedido> listarPedidos() {
        return pedidoRepository.findAll();
    }

    public List<Pedido> listarPedidosPorCliente(Long clienteId) {
        return pedidoRepository.findByClienteId(clienteId);
    }
}

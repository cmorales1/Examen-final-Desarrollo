package com.logistica.b.service;

import com.logistica.b.domain.Factura;
import com.logistica.b.domain.Proveedor;
import com.logistica.b.dto.FacturaRequest;
import com.logistica.b.dto.ProductoDTO;
import com.logistica.b.repository.FacturaRepository;
import com.logistica.b.repository.ProveedorRepository;
import com.logistica.common.model.Producto;
import com.logistica.common.util.CalculadoraFinanciera;
import com.logistica.common.util.CodigoGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacturaService {

    private final ProveedorRepository proveedorRepository;
    private final FacturaRepository facturaRepository;

    public FacturaService(ProveedorRepository proveedorRepository, FacturaRepository facturaRepository) {
        this.proveedorRepository = proveedorRepository;
        this.facturaRepository = facturaRepository;
    }

    @Transactional
    public Factura crearFactura(FacturaRequest request) {
        Proveedor proveedor = proveedorRepository.findById(request.getProveedorId())
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no existe"));

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

        Factura factura = new Factura();
        factura.setProveedor(proveedor);
        factura.setFechaEmision(LocalDateTime.now());
        factura.setCodigo(CodigoGenerator.generarCodigoUnico("FAC"));
        factura.setTotal(total);

        return facturaRepository.save(factura);
    }

    public List<Factura> listarFacturas() {
        return facturaRepository.findAll();
    }

    public List<Factura> listarFacturasPorProveedor(Long proveedorId) {
        return facturaRepository.findByProveedorId(proveedorId);
    }
}

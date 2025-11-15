package com.logistica.b.repository;

import com.logistica.b.domain.Factura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacturaRepository extends JpaRepository<Factura, Long> {
    List<Factura> findByProveedorId(Long proveedorId);
}

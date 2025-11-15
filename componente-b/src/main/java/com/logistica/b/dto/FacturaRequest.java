package com.logistica.b.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class FacturaRequest {

    @NotNull
    private Long proveedorId;

    @NotEmpty
    private List<ProductoDTO> productos;

    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }

    public List<ProductoDTO> getProductos() { return productos; }
    public void setProductos(List<ProductoDTO> productos) { this.productos = productos; }
}

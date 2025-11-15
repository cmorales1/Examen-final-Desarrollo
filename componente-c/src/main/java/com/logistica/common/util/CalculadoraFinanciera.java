package com.logistica.common.util;

import com.logistica.common.model.Producto;

import java.util.List;

public class CalculadoraFinanciera {

    public static double calcularTotal(List<Producto> productos) {
        if (productos == null) return 0.0;
        return productos.stream()
                .mapToDouble(Producto::getSubtotal)
                .sum();
    }
}

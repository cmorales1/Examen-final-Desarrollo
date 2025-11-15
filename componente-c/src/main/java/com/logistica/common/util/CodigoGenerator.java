package com.logistica.common.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class CodigoGenerator {

    public static String generarCodigoUnico(String tipoEntidad) {
        String prefix = tipoEntidad == null ? "GEN" : tipoEntidad.toUpperCase();
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + timestamp + "-" + uuid;
    }
}

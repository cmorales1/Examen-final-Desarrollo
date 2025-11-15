'use client';

import { useEffect, useState } from 'react';

const API_A = 'http://localhost:8081';
const API_B = 'http://localhost:8082';

// Normaliza respuestas: [] o {content: []} o {items: []}
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

async function callApi(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && data.message) ||
      (typeof data === 'string' && data) ||
      `Error HTTP ${res.status} al llamar ${url}`;
    throw new Error(msg);
  }

  return data;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('resumen');

  const [clientes, setClientes] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [facturas, setFacturas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Búsquedas puntuales
  const [clienteIdBuscar, setClienteIdBuscar] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);

  const [proveedorIdBuscar, setProveedorIdBuscar] = useState('');
  const [proveedorEncontrado, setProveedorEncontrado] = useState(null);

  const [clienteIdPedidos, setClienteIdPedidos] = useState('');
  const [pedidosCliente, setPedidosCliente] = useState([]);

  const [proveedorIdFacturas, setProveedorIdFacturas] = useState('');
  const [facturasProveedor, setFacturasProveedor] = useState([]);

  // Formularios
  const [clienteForm, setClienteForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });

  const [proveedorForm, setProveedorForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
  });

  const [pedidoForm, setPedidoForm] = useState({
    clienteId: '',
    codigoProducto: '',
    nombreProducto: '',
    cantidad: 1,
    precioUnitario: 0,
  });

  const [facturaForm, setFacturaForm] = useState({
    proveedorId: '',
    codigoProducto: '',
    nombreProducto: '',
    cantidad: 1,
    precioUnitario: 0,
  });

  // Integración
  const [integrationLog, setIntegrationLog] = useState([]);

  useEffect(() => {
    refreshAll();
  }, []);

  // Carga todos los listados
  async function refreshAll() {
    setLoading(true);
    setMessage(null);
    try {
      const cli = await callApi(`${API_A}/api/clientes`);
      const prov = await callApi(`${API_B}/api/proveedores`);
      const ped = await callApi(`${API_A}/api/pedidos`);
      const fac = await callApi(`${API_B}/api/facturas`);

      setClientes(normalizeList(cli));
      setProveedores(normalizeList(prov));
      setPedidos(normalizeList(ped));
      setFacturas(normalizeList(fac));
    } catch (e) {
      setMessage({
        type: 'error',
        text:
          'Error al cargar datos iniciales: ' +
          e.message,
      });
    } finally {
      setLoading(false);
    }
  }

  // ----------------- Crear cliente (POST /api/clientes) ----------------------
  async function handleCrearCliente(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await callApi(`${API_A}/api/clientes`, {
        method: 'POST',
        body: JSON.stringify(clienteForm),
      });
      setClienteForm({ nombre: '', email: '', telefono: '' });
      setMessage({ type: 'success', text: 'Cliente creado correctamente.' });
      await refreshAll();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  // -------- Buscar cliente por ID (GET /api/clientes/{id}) -------------------
  async function handleBuscarCliente() {
    setMessage(null);
    setClienteEncontrado(null);
    if (!clienteIdBuscar) return;
    try {
      const data = await callApi(
        `${API_A}/api/clientes/${encodeURIComponent(clienteIdBuscar)}`
      );
      setClienteEncontrado(data);
    } catch (e) {
      setClienteEncontrado(null);
      setMessage({ type: 'error', text: e.message });
    }
  }

  // -------- Pedidos por cliente (GET /api/pedidos/cliente/{clienteId}) -------
  async function handleBuscarPedidosCliente() {
    setMessage(null);
    setPedidosCliente([]);
    if (!clienteIdPedidos) return;
    try {
      const data = await callApi(
        `${API_A}/api/pedidos/cliente/${encodeURIComponent(clienteIdPedidos)}`
      );
      setPedidosCliente(normalizeList(data));
    } catch (e) {
      setPedidosCliente([]);
      setMessage({ type: 'error', text: e.message });
    }
  }

  // ----------------- Crear pedido (POST /api/pedidos) ------------------------
  async function handleCrearPedido(e) {
    e.preventDefault();
    setMessage(null);

    const body = {
      clienteId: Number(pedidoForm.clienteId),
      productos: [
        {
          codigo: pedidoForm.codigoProducto || 'GEN-PED',
          nombre: pedidoForm.nombreProducto || 'Producto sin nombre',
          cantidad: Number(pedidoForm.cantidad),
          precioUnitario: Number(pedidoForm.precioUnitario),
        },
      ],
    };

    try {
      await callApi(`${API_A}/api/pedidos`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setPedidoForm({
        clienteId: '',
        codigoProducto: '',
        nombreProducto: '',
        cantidad: 1,
        precioUnitario: 0,
      });
      setMessage({
        type: 'success',
        text: 'Pedido creado (total calculado en Componente C).',
      });
      await refreshAll();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  // ----------------- Crear proveedor (POST /api/proveedores) -----------------
  async function handleCrearProveedor(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await callApi(`${API_B}/api/proveedores`, {
        method: 'POST',
        body: JSON.stringify(proveedorForm),
      });
      setProveedorForm({ nombre: '', email: '', telefono: '' });
      setMessage({
        type: 'success',
        text: 'Proveedor creado correctamente.',
      });
      await refreshAll();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  // -------- Buscar proveedor por ID (GET /api/proveedores/{id}) --------------
  async function handleBuscarProveedor() {
    setMessage(null);
    setProveedorEncontrado(null);
    if (!proveedorIdBuscar) return;
    try {
      const data = await callApi(
        `${API_B}/api/proveedores/${encodeURIComponent(proveedorIdBuscar)}`
      );
      setProveedorEncontrado(data);
    } catch (e) {
      setProveedorEncontrado(null);
      setMessage({ type: 'error', text: e.message });
    }
  }

  // -------- Facturas por proveedor (GET /api/facturas/proveedor/{id}) --------
  async function handleBuscarFacturasProveedor() {
    setMessage(null);
    setFacturasProveedor([]);
    if (!proveedorIdFacturas) return;
    try {
      const data = await callApi(
        `${API_B}/api/facturas/proveedor/${encodeURIComponent(
          proveedorIdFacturas
        )}`
      );
      const lista = normalizeList(data);
      setFacturasProveedor(lista);
      if (lista.length === 0) {
        setMessage({
          type: 'info',
          text: 'No se encontraron facturas para ese proveedor.',
        });
      } else {
        setMessage({
          type: 'info',
          text: `Se cargaron ${lista.length} factura(s) para el proveedor ${proveedorIdFacturas}.`,
        });
      }
    } catch (e) {
      setFacturasProveedor([]);
      setMessage({ type: 'error', text: e.message });
    }
  }

  // ----------------- Crear factura (POST /api/facturas) ----------------------
  async function handleCrearFactura(e) {
    e.preventDefault();
    setMessage(null);

    const body = {
      proveedorId: Number(facturaForm.proveedorId),
      productos: [
        {
          codigo: facturaForm.codigoProducto || 'GEN-FAC',
          nombre: facturaForm.nombreProducto || 'Servicio sin nombre',
          cantidad: Number(facturaForm.cantidad),
          precioUnitario: Number(facturaForm.precioUnitario),
        },
      ],
    };

    try {
      await callApi(`${API_B}/api/facturas`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setFacturaForm({
        proveedorId: '',
        codigoProducto: '',
        nombreProducto: '',
        cantidad: 1,
        precioUnitario: 0,
      });
      // limpiamos el filtro para que se vuelva a calcular con todo
      setFacturasProveedor([]);
      setProveedorIdFacturas('');
      setMessage({
        type: 'success',
        text: 'Factura creada (total calculado en Componente C).',
      });
      await refreshAll();
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  // ----------------- Integración: ping directo (A y B) -----------------------
  async function handlePing(componente) {
    setMessage(null);
    try {
      const base = componente === 'A' ? API_A : API_B;
      const data = await callApi(`${base}/api/integracion/ping`);
      const direction = `Ping directo ${componente}`;
      const text =
        data && data.mensaje ? data.mensaje : JSON.stringify(data);
      setMessage({ type: 'info', text: `${direction}: ${text}` });
      setIntegrationLog((prev) => [
        {
          id: Date.now(),
          direction,
          response: text,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  // ----------------- Integración: flujo A→C→B y B→C→A -----------------------
  async function handleProbarIntegracion(origen) {
    setMessage(null);
    try {
      const fromA = origen === 'A';
      const base = fromA ? API_A : API_B;
      const urlBase = fromA ? API_B : API_A;
      const res = await callApi(
        `${base}/api/integracion/probar-remoto?urlBase=${encodeURIComponent(
          urlBase
        )}`
      );
      const direction = fromA ? 'A → C → B' : 'B → C → A';
      const text =
        res && res.mensaje ? res.mensaje : JSON.stringify(res);
      setMessage({ type: 'info', text: `${direction}: ${text}` });
      setIntegrationLog((prev) => [
        {
          id: Date.now(),
          direction,
          response: text,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    }
  }

  // ----------------- Estilos (tema claro) ------------------------------------
  const tabButtonStyle = (tab) => ({
    padding: '0.6rem 1.2rem',
    borderRadius: '9999px',
    border: '1px solid #d1d5db',
    background:
      activeTab === tab ? '#2563eb' : 'rgba(255,255,255,0.9)',
    color: activeTab === tab ? '#f9fafb' : '#111827',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    boxShadow:
      activeTab === tab
        ? '0 0 16px rgba(37,99,235,0.4)'
        : '0 0 0 rgba(0,0,0,0)',
    transition: 'all 0.15s ease',
  });

  const cardStyle = {
    padding: '1.25rem',
    borderRadius: '0.9rem',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 16px 40px rgba(15,23,42,0.06)',
    marginBottom: '1rem',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.8rem',
    color: '#4b5563',
    fontWeight: 500,
  };

  const inputStyle = {
    width: '100%',
    padding: '0.45rem 0.65rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    background: '#f9fafb',
    color: '#111827',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  };

  const buttonPrimaryStyle = {
    padding: '0.55rem 1.1rem',
    borderRadius: '0.7rem',
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  };

  const buttonSecondaryStyle = {
    ...buttonPrimaryStyle,
    background: '#7c3aed',
  };

  // ----------- Área de facturación: métricas según filtro --------------------
  const facturasResumen =
    facturasProveedor.length > 0 ? facturasProveedor : facturas;

  const totalFacturas = facturasResumen.length;
  const sumaFacturacion = facturasResumen.reduce(
    (acc, f) => acc + Number(f.total || 0),
    0
  );
  const promedioFacturacion =
    totalFacturas > 0 ? sumaFacturacion / totalFacturas : 0;

  const etiquetaResumen =
    facturasProveedor.length > 0 && proveedorIdFacturas
      ? `Proveedor filtrado ID ${proveedorIdFacturas}`
      : 'Todas las facturas';

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#e5f0ff 0,#f3f4f6 45%,#f9fafb 100%)',
        color: '#111827',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <header
        style={{
          padding: '1.2rem 2rem 1rem',
          borderBottom: '1px solid #e5e7eb',
          background: 'rgba(255,255,255,0.9)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '1.7rem',
            letterSpacing: '0.03em',
            color: '#111827',
          }}
        >
          Plataforma Logística
        </h1>
        <p
          style={{
            margin: '0.3rem 0 0.8rem',
            color: '#4b5563',
            fontSize: '0.9rem',
          }}
        >
          Hecho por David Castellanos
        </p>

        <div
          style={{
            marginTop: '0.4rem',
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            style={tabButtonStyle('resumen')}
            onClick={() => setActiveTab('resumen')}
          >
            Resumen
          </button>
          <button
            style={tabButtonStyle('clientes')}
            onClick={() => setActiveTab('clientes')}
          >
            Clientes &amp; Pedidos (A)
          </button>
          <button
            style={tabButtonStyle('proveedores')}
            onClick={() => setActiveTab('proveedores')}
          >
            Proveedores &amp; Facturas (B)
          </button>
          <button
            style={tabButtonStyle('integracion')}
            onClick={() => setActiveTab('integracion')}
          >
            Integración A ↔ B
          </button>
        </div>
      </header>

      <main style={{ padding: '1.5rem 2rem 2.5rem' }}>
        {loading && (
          <p style={{ color: '#92400e', marginBottom: '1rem' }}>
            Cargando datos desde las APIs...
          </p>
        )}

        {message && (
          <div
            style={{
              ...cardStyle,
              borderColor:
                message.type === 'error'
                  ? '#fca5a5'
                  : message.type === 'success'
                  ? '#bbf7d0'
                  : '#bfdbfe',
              background:
                message.type === 'error'
                  ? '#fef2f2'
                  : message.type === 'success'
                  ? '#f0fdf4'
                  : '#eff6ff',
            }}
          >
            <strong>
              {message.type === 'error'
                ? 'Error'
                : message.type === 'success'
                ? 'OK'
                : 'Info'}
              :
            </strong>{' '}
            {message.text}
          </div>
        )}

        {/* ------------------------- RESUMEN ------------------------- */}
        {activeTab === 'resumen' && (
          <section>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Resumen general del sistema</h2>
              <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                Este frontend muestra todos los flujos definidos en el
                proyecto:
              </p>
              <ul style={{ fontSize: '0.9rem', color: '#111827' }}>
                <li>
                  Registro y consulta de <strong>clientes y pedidos</strong>{' '}
                  contra el Componente A (MariaDB).
                </li>
                <li>
                  Registro, facturación y métricas con{' '}
                  <strong>proveedores y facturas</strong> contra el Componente B
                  (PostgreSQL).
                </li>
                <li>
                  Uso de la librería del <strong>Componente C</strong> para
                  generar códigos únicos y calcular totales de manera
                  centralizada.
                </li>
                <li>
                  Pruebas de integración{' '}
                  <strong>A → C → B y B → C → A</strong>, además de ping directo
                  a cada componente.
                </li>
              </ul>
              <button style={buttonPrimaryStyle} onClick={refreshAll}>
                Recargar datos desde las APIs
              </button>
            </div>
          </section>
        )}

        {/* ------------------- CLIENTES & PEDIDOS (A) ---------------- */}
        {activeTab === 'clientes' && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.15fr)',
              gap: '1.5rem',
            }}
          >
            <div>
              {/* Alta de cliente */}
              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>Registrar cliente (A - MariaDB)</h2>
                <form onSubmit={handleCrearCliente}>
                  <label style={labelStyle}>
                    Nombre
                    <input
                      style={inputStyle}
                      value={clienteForm.nombre}
                      onChange={(e) =>
                        setClienteForm({
                          ...clienteForm,
                          nombre: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label style={labelStyle}>
                    Email
                    <input
                      style={inputStyle}
                      type="email"
                      value={clienteForm.email}
                      onChange={(e) =>
                        setClienteForm({
                          ...clienteForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Teléfono
                    <input
                      style={inputStyle}
                      value={clienteForm.telefono}
                      onChange={(e) =>
                        setClienteForm({
                          ...clienteForm,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </label>
                  <button style={buttonPrimaryStyle} type="submit">
                    Guardar cliente
                  </button>
                </form>
              </div>

              {/* Lista de clientes */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>Clientes registrados</h3>
                {clientes.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    No hay clientes registrados aún.
                  </p>
                ) : (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.9rem',
                    }}
                  >
                    {clientes.map((c) => (
                      <li
                        key={c.id}
                        style={{
                          padding: '0.35rem 0',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        <strong>#{c.id}</strong> {c.nombre}{' '}
                        {c.email && (
                          <span style={{ color: '#4b5563' }}>({c.email})</span>
                        )}
                        {c.telefono && (
                          <span style={{ color: '#9ca3af' }}>
                            {' '}
                            · {c.telefono}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Buscar cliente por ID */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>
                  Consultar cliente por ID (GET /api/clientes/
                  {"{id}"})
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    style={{ ...inputStyle, marginBottom: 0, maxWidth: '8rem' }}
                    type="number"
                    placeholder="ID"
                    value={clienteIdBuscar}
                    onChange={(e) => setClienteIdBuscar(e.target.value)}
                  />
                  <button style={buttonSecondaryStyle} onClick={handleBuscarCliente}>
                    Buscar
                  </button>
                </div>
                {clienteEncontrado && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.7rem',
                      borderRadius: '0.6rem',
                      background: '#eff6ff',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>#{clienteEncontrado.id}</strong>{' '}
                    {clienteEncontrado.nombre}
                    {clienteEncontrado.email && (
                      <span style={{ color: '#4b5563' }}>
                        {' '}
                        · {clienteEncontrado.email}
                      </span>
                    )}
                    {clienteEncontrado.telefono && (
                      <span style={{ color: '#9ca3af' }}>
                        {' '}
                        · {clienteEncontrado.telefono}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              {/* Alta de pedido */}
              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>
                  Registrar pedido (A - usa Componente C)
                </h2>
                <form onSubmit={handleCrearPedido}>
                  <label style={labelStyle}>
                    ID Cliente
                    <input
                      style={inputStyle}
                      type="number"
                      value={pedidoForm.clienteId}
                      onChange={(e) =>
                        setPedidoForm({
                          ...pedidoForm,
                          clienteId: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label style={labelStyle}>
                    Código producto
                    <input
                      style={inputStyle}
                      value={pedidoForm.codigoProducto}
                      onChange={(e) =>
                        setPedidoForm({
                          ...pedidoForm,
                          codigoProducto: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Nombre producto
                    <input
                      style={inputStyle}
                      value={pedidoForm.nombreProducto}
                      onChange={(e) =>
                        setPedidoForm({
                          ...pedidoForm,
                          nombreProducto: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Cantidad
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={pedidoForm.cantidad}
                      onChange={(e) =>
                        setPedidoForm({
                          ...pedidoForm,
                          cantidad: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label style={labelStyle}>
                    Precio unitario
                    <input
                      style={inputStyle}
                      type="number"
                      step="0.01"
                      value={pedidoForm.precioUnitario}
                      onChange={(e) =>
                        setPedidoForm({
                          ...pedidoForm,
                          precioUnitario: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <button style={buttonPrimaryStyle} type="submit">
                    Guardar pedido
                  </button>
                </form>
              </div>

              {/* Lista de pedidos */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>
                  Pedidos registrados (GET /api/pedidos)
                </h3>
                {pedidos.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    No hay pedidos registrados aún.
                  </p>
                ) : (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.9rem',
                    }}
                  >
                    {pedidos.map((p) => (
                      <li
                        key={p.id}
                        style={{
                          padding: '0.35rem 0',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        <strong>{p.codigo}</strong> — Total Q{' '}
                        {Number(p.total || 0).toFixed(2)}{' '}
                        <span style={{ color: '#6b7280' }}>
                          (Cliente #{p.cliente?.id})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Pedidos por cliente */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>
                  Pedidos por cliente (GET /api/pedidos/cliente/
                  {"{clienteId}"})
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    style={{ ...inputStyle, marginBottom: 0, maxWidth: '8rem' }}
                    type="number"
                    placeholder="ID cliente"
                    value={clienteIdPedidos}
                    onChange={(e) => setClienteIdPedidos(e.target.value)}
                  />
                  <button
                    style={buttonSecondaryStyle}
                    onClick={handleBuscarPedidosCliente}
                  >
                    Buscar
                  </button>
                </div>
                {pedidosCliente.length > 0 && (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.85rem',
                    }}
                  >
                    {pedidosCliente.map((p) => (
                      <li
                        key={p.id}
                        style={{
                          padding: '0.3rem 0',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        <strong>{p.codigo}</strong> — Q{' '}
                        {Number(p.total || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {/* --------------- PROVEEDORES & FACTURAS (B) ---------------- */}
        {activeTab === 'proveedores' && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1.15fr)',
              gap: '1.5rem',
            }}
          >
            <div>
              {/* Alta proveedor */}
              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>
                  Registrar proveedor (B - PostgreSQL)
                </h2>
                <form onSubmit={handleCrearProveedor}>
                  <label style={labelStyle}>
                    Nombre
                    <input
                      style={inputStyle}
                      value={proveedorForm.nombre}
                      onChange={(e) =>
                        setProveedorForm({
                          ...proveedorForm,
                          nombre: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label style={labelStyle}>
                    Email
                    <input
                      style={inputStyle}
                      type="email"
                      value={proveedorForm.email}
                      onChange={(e) =>
                        setProveedorForm({
                          ...proveedorForm,
                          email: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Teléfono
                    <input
                      style={inputStyle}
                      value={proveedorForm.telefono}
                      onChange={(e) =>
                        setProveedorForm({
                          ...proveedorForm,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </label>
                  <button style={buttonPrimaryStyle} type="submit">
                    Guardar proveedor
                  </button>
                </form>
              </div>

              {/* Lista proveedores */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>Proveedores registrados</h3>
                {proveedores.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    No hay proveedores registrados aún.
                  </p>
                ) : (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.9rem',
                    }}
                  >
                    {proveedores.map((p) => (
                      <li
                        key={p.id}
                        style={{
                          padding: '0.35rem 0',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        <strong>#{p.id}</strong> {p.nombre}{' '}
                        {p.email && (
                          <span style={{ color: '#4b5563' }}>({p.email})</span>
                        )}
                        {p.telefono && (
                          <span style={{ color: '#9ca3af' }}>
                            {' '}
                            · {p.telefono}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Buscar proveedor por ID */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>
                  Consultar proveedor por ID (GET /api/proveedores/
                  {"{id}"})
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    style={{ ...inputStyle, marginBottom: 0, maxWidth: '8rem' }}
                    type="number"
                    placeholder="ID"
                    value={proveedorIdBuscar}
                    onChange={(e) => setProveedorIdBuscar(e.target.value)}
                  />
                  <button style={buttonSecondaryStyle} onClick={handleBuscarProveedor}>
                    Buscar
                  </button>
                </div>
                {proveedorEncontrado && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 0.7rem',
                      borderRadius: '0.6rem',
                      background: '#fef3c7',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>#{proveedorEncontrado.id}</strong>{' '}
                    {proveedorEncontrado.nombre}
                    {proveedorEncontrado.email && (
                      <span style={{ color: '#4b5563' }}>
                        {' '}
                        · {proveedorEncontrado.email}
                      </span>
                    )}
                    {proveedorEncontrado.telefono && (
                      <span style={{ color: '#9ca3af' }}>
                        {' '}
                        · {proveedorEncontrado.telefono}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Área de facturación (resumen) */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>Área de facturación - Resumen</h3>
                <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                  Métricas calculadas a partir de las facturas de:{' '}
                  <strong>{etiquetaResumen}</strong>.
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3,minmax(0,1fr))',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.6rem 0.7rem',
                      borderRadius: '0.75rem',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    <div style={{ color: '#4b5563' }}>Facturas consideradas</div>
                    <div
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: '#1d4ed8',
                      }}
                    >
                      {totalFacturas}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.6rem 0.7rem',
                      borderRadius: '0.75rem',
                      background: '#ecfdf5',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <div style={{ color: '#4b5563' }}>Total facturado</div>
                    <div
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: '#16a34a',
                      }}
                    >
                      Q {sumaFacturacion.toFixed(2)}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.6rem 0.7rem',
                      borderRadius: '0.75rem',
                      background: '#fefce8',
                      border: '1px solid #facc15',
                    }}
                  >
                    <div style={{ color: '#4b5563' }}>
                      Promedio por factura
                    </div>
                    <div
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        color: '#eab308',
                      }}
                    >
                      Q {promedioFacturacion.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Alta factura */}
              <div style={cardStyle}>
                <h2 style={{ marginTop: 0 }}>
                  Registrar factura (B - usa Componente C)
                </h2>
                <form onSubmit={handleCrearFactura}>
                  <label style={labelStyle}>
                    ID Proveedor
                    <input
                      style={inputStyle}
                      type="number"
                      value={facturaForm.proveedorId}
                      onChange={(e) =>
                        setFacturaForm({
                          ...facturaForm,
                          proveedorId: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label style={labelStyle}>
                    Código producto/servicio
                    <input
                      style={inputStyle}
                      value={facturaForm.codigoProducto}
                      onChange={(e) =>
                        setFacturaForm({
                          ...facturaForm,
                          codigoProducto: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Nombre producto/servicio
                    <input
                      style={inputStyle}
                      value={facturaForm.nombreProducto}
                      onChange={(e) =>
                        setFacturaForm({
                          ...facturaForm,
                          nombreProducto: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={labelStyle}>
                    Cantidad
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      value={facturaForm.cantidad}
                      onChange={(e) =>
                        setFacturaForm({
                          ...facturaForm,
                          cantidad: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <label style={labelStyle}>
                    Precio unitario
                    <input
                      style={inputStyle}
                      type="number"
                      step="0.01"
                      value={facturaForm.precioUnitario}
                      onChange={(e) =>
                        setFacturaForm({
                          ...facturaForm,
                          precioUnitario: e.target.value,
                        })
                      }
                      required
                    />
                  </label>
                  <button style={buttonSecondaryStyle} type="submit">
                    Guardar factura
                  </button>
                </form>
              </div>

              {/* Lista facturas */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>
                  Facturas registradas (GET /api/facturas)
                </h3>
                {facturas.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    No hay facturas registradas aún.
                  </p>
                ) : (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.9rem',
                    }}
                  >
                    {facturas.map((f) => (
                      <li
                        key={f.id}
                        style={{
                          padding: '0.35rem 0',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        <strong>{f.codigo}</strong> — Total Q{' '}
                        {Number(f.total || 0).toFixed(2)}{' '}
                        <span style={{ color: '#6b7280' }}>
                          (Proveedor #{f.proveedor?.id})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Facturas por proveedor */}
              <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>
                  Facturas por proveedor (GET /api/facturas/proveedor/
                  {"{id}"})
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <input
                    style={{ ...inputStyle, marginBottom: 0, maxWidth: '8rem' }}
                    type="number"
                    placeholder="ID proveedor"
                    value={proveedorIdFacturas}
                    onChange={(e) =>
                      setProveedorIdFacturas(e.target.value)
                    }
                  />
                  <button
                    style={buttonSecondaryStyle}
                    onClick={handleBuscarFacturasProveedor}
                  >
                    Buscar
                  </button>
                </div>
                {facturasProveedor.length > 0 && (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.85rem',
                    }}
                  >
                    {facturasProveedor.map((f) => (
                      <li
                        key={f.id}
                        style={{
                          padding: '0.3rem 0',
                          borderBottom: '1px solid #e5e7eb',
                        }}
                      >
                        <strong>{f.codigo}</strong> — Q{' '}
                        {Number(f.total || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ------------------------- INTEGRACIÓN ---------------------- */}
        {activeTab === 'integracion' && (
          <section>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Pruebas de integración A ↔ B</h2>
              <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                Desde aquí se usan todos los endpoints de integración:
              </p>
              <ul style={{ fontSize: '0.9rem', color: '#111827' }}>
                <li>
                  <code>GET /api/integracion/ping</code> en A y B (ping directo).
                </li>
                <li>
                  <code>GET /api/integracion/probar-remoto</code> en A y B para
                  ejecutar los flujos <strong>A → C → B</strong> y{' '}
                  <strong>B → C → A</strong>.
                </li>
              </ul>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginTop: '0.75rem',
                }}
              >
                <button
                  style={buttonPrimaryStyle}
                  onClick={() => handlePing('A')}
                >
                  Ping directo A
                </button>
                <button
                  style={buttonPrimaryStyle}
                  onClick={() => handlePing('B')}
                >
                  Ping directo B
                </button>
                <button
                  style={buttonSecondaryStyle}
                  onClick={() => handleProbarIntegracion('A')}
                >
                  Probar A → C → B
                </button>
                <button
                  style={buttonSecondaryStyle}
                  onClick={() => handleProbarIntegracion('B')}
                >
                  Probar B → C → A
                </button>
              </div>
            </div>

            <div style={{ ...cardStyle, marginTop: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Historial de pruebas</h3>
              {integrationLog.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  Aún no se ha ejecutado ninguna prueba desde esta sección.
                </p>
              ) : (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    fontSize: '0.9rem',
                  }}
                >
                  {integrationLog.map((entry) => (
                    <li
                      key={entry.id}
                      style={{
                        padding: '0.45rem 0.3rem',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <div>
                        <strong>{entry.direction}</strong>{' '}
                        <span style={{ color: '#6b7280' }}>
                          ({entry.timestamp})
                        </span>
                      </div>
                      <div style={{ color: '#1d4ed8' }}>{entry.response}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

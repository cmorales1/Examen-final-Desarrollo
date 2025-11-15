export const metadata = {
  title: 'Logística - Demo',
  description: 'Frontend Next.js para los componentes A y B'
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0b1120', color: '#e5e7eb' }}>
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid #111827', background: '#020617' }}>
          <h1>Plataforma Logística</h1>
          <p style={{ color: '#9ca3af' }}>Demo Next.js consumiendo APIs Spring Boot</p>
        </header>
        <main style={{ padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

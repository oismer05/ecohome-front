import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Mark from '../components/Mark.jsx';

// Cuentas de demostración creadas por `npm run db:seed` en el backend
const DEMO = [
  { label: 'Ventas',    email: 'ventas@ecohome.com' },
  { label: 'Logística', email: 'logistica@ecohome.com' },
  { label: 'Soporte',   email: 'soporte@ecohome.com' },
];
const DEMO_PASSWORD = 'Equipo12345!';

export default function Login() {
  const { login, notice } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate('/chat', { replace: true });
    } catch (err) {
      setError(err.status === 401 ? 'Correo o contraseña incorrectos.' : err.message);
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <section className="login-art" aria-hidden="true">
        <div className="glass glass--a" />
        <div className="glass glass--b" />
        <div className="glass glass--c" />
        <div className="login-art-copy">
          <h2>Cada vaso nace de vidrio que ya existía.</h2>
          <p>Y cada pedido, de una buena conversación entre ventas, logística y soporte.</p>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit} noValidate>
          <div className="brand"><Mark /><span>EcoHome <em>Store</em></span></div>
          <h1>Chat del equipo</h1>
          <p className="muted">Entra con tu cuenta de trabajo para hablar con tus compañeros en tiempo real.</p>

          {notice && <p className="alert alert--info" role="status">{notice}</p>}
          {error && <p className="alert alert--error" role="alert">{error}</p>}

          <label htmlFor="email">Correo</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="username" placeholder="nombre@ecohome.com" required />

          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password" required />

          <button className="btn btn--green" type="submit" disabled={busy || !email || !password}>
            {busy ? 'Entrando…' : 'Iniciar sesión'}
          </button>

          <div className="demo">
            <p className="small muted">Cuentas de demostración (contraseña <code>{DEMO_PASSWORD}</code>)</p>
            <div className="demo-buttons">
              {DEMO.map((d) => (
                <button key={d.email} type="button" className="btn btn--ghost"
                  onClick={() => { setEmail(d.email); setPassword(DEMO_PASSWORD); setError(''); }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}

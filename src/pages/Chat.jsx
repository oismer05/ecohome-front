import { useAuth } from '../auth/AuthContext.jsx';
import { useChat } from '../hooks/useChat.js';
import Mark from '../components/Mark.jsx';
import Avatar from '../components/Avatar.jsx';
import OnlineUsers from '../components/OnlineUsers.jsx';
import MessageList from '../components/MessageList.jsx';
import Composer from '../components/Composer.jsx';
import { roleOf } from '../components/roles.js';

const STATUS = {
  connecting: { text: 'Conectando…', cls: 'wait' },
  online:     { text: 'Conectado en tiempo real', cls: 'ok' },
  offline:    { text: 'Sin conexión, reintentando…', cls: 'bad' },
  denied:     { text: 'Acceso denegado', cls: 'bad' },
};

export default function Chat() {
  const { token, user, logout } = useAuth();
  const { status, messages, online, problem, send } = useChat(token, { onSessionLost: logout });
  const st = STATUS[status];

  if (!user) return <div className="splash" role="status">Cargando tu perfil…</div>;

  return (
    <div className="chat-shell">
      <aside className="sidebar">
        <div className="brand brand--light"><Mark /><span>EcoHome <em>Store</em></span></div>
        <OnlineUsers users={online} meId={user.id} />
        <div className="me">
          <Avatar name={user.name} role={user.role} />
          <span className="people-text">
            <strong>{user.name}</strong>
            <small>{roleOf(user.role).label}</small>
          </span>
          <button className="btn btn--ghost-light" onClick={() => logout()}>Salir</button>
        </div>
      </aside>

      <main className="chat">
        <header className="chat-head">
          <div>
            <h1># equipo-ecohome</h1>
            <p className="muted small">Ventas, logística y soporte en un solo canal</p>
          </div>
          <span className={`status status--${st.cls}`} role="status"><i />{st.text}</span>
        </header>

        {status === 'denied' ? (
          <div className="empty">
            <p><strong>Esta sala es solo para el personal interno.</strong></p>
            <p className="muted">Tu cuenta tiene rol «{roleOf(user.role).label}». Pide acceso al administrador si lo necesitas.</p>
          </div>
        ) : (
          <>
            {problem && <p className="alert alert--error banner" role="alert">{problem}</p>}
            <div className="scroll"><MessageList messages={messages} meId={user.id} /></div>
            <Composer onSend={send} disabled={status !== 'online'} />
          </>
        )}
      </main>
    </div>
  );
}

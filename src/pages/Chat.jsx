import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
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
  const { user } = useAuth();
  const { status, messages, problem, send } = useOutletContext();   // conexión compartida (Shell)
  const st = STATUS[status];

  return (
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
  );
}

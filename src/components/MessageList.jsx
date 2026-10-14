import { useEffect, useRef } from 'react';
import Avatar from './Avatar.jsx';
import { roleOf } from './roles.js';

const dayFmt = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
const timeFmt = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });
const GROUP_WINDOW_MS = 5 * 60 * 1000;

const dayKey = (d) => new Date(d).toDateString();

export default function MessageList({ messages, meId }) {
  const endRef = useRef(null);
  // Siempre mostrar lo último: al entrar y cada vez que llega un mensaje
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="empty">
        <p><strong>Aún no hay mensajes.</strong></p>
        <p className="muted">Escribe el primero: todos los que estén conectados lo verán al instante.</p>
      </div>
    );
  }

  return (
    <ol className="messages" aria-live="polite" aria-label="Mensajes del chat">
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const newDay = !prev || dayKey(prev.created_at) !== dayKey(m.created_at);
        const grouped = !newDay && prev.user_id === m.user_id
          && new Date(m.created_at) - new Date(prev.created_at) < GROUP_WINDOW_MS;
        const mine = m.user_id === meId;
        return (
          <li key={m.id} className={`msg ${mine ? 'msg--mine' : ''} ${grouped ? 'msg--grouped' : ''}`}>
            {newDay && <div className="day"><span>{dayFmt.format(new Date(m.created_at))}</span></div>}
            <div className="msg-row">
              {!mine && (grouped ? <span className="avatar-gap" /> : <Avatar name={m.user} role={m.role} />)}
              <div className="bubble-wrap">
                {!grouped && (
                  <div className="msg-meta">
                    {!mine && <strong>{m.user}</strong>}
                    {!mine && <span className={`chip tone-${roleOf(m.role).tone}`}>{roleOf(m.role).label}</span>}
                    <time dateTime={new Date(m.created_at).toISOString()}>{timeFmt.format(new Date(m.created_at))}</time>
                  </div>
                )}
                <p className="bubble">{m.text}</p>
              </div>
            </div>
          </li>
        );
      })}
      <li ref={endRef} aria-hidden="true" />
    </ol>
  );
}

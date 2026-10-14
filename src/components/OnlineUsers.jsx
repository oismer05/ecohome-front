import Avatar from './Avatar.jsx';
import { roleOf } from './roles.js';

export default function OnlineUsers({ users, meId }) {
  return (
    <section aria-label="Personas conectadas">
      <h2 className="side-title">
        En línea <span className="count">{users.length}</span>
      </h2>
      {users.length === 0 ? (
        <p className="muted small">Nadie conectado todavía.</p>
      ) : (
        <ul className="people">
          {users.map((u) => (
            <li key={u.id}>
              <Avatar name={u.name} role={u.role} />
              <span className="people-text">
                <strong>{u.name}{u.id === meId ? ' (tú)' : ''}</strong>
                <small>{roleOf(u.role).label}</small>
              </span>
              <span className="presence" title="Conectado" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

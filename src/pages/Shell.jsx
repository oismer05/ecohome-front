import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useChat } from '../hooks/useChat.js';
import Mark from '../components/Mark.jsx';
import Avatar from '../components/Avatar.jsx';
import OnlineUsers from '../components/OnlineUsers.jsx';
import CounterBadge from '../components/CounterBadge.jsx';
import { roleOf } from '../components/roles.js';

/**
 * Marco común de la app privada: una sola conexión Socket.IO por sesión
 * (chat + avisos del catálogo) y el usuario autenticado en formato "Nombre (N)".
 */
export default function Shell() {
  const { token, user, logout, stats } = useAuth();
  const realtime = useChat(token, { onSessionLost: logout });

  if (!user) return <div className="splash" role="status">Cargando tu perfil…</div>;

  return (
    <div className="chat-shell">
      <aside className="sidebar">
        <div className="brand brand--light"><Mark /><span>EcoHome <em>Store</em></span></div>
        <nav className="nav" aria-label="Secciones">
          <NavLink to="/catalogo" className="nav-link">Catálogo</NavLink>
          <NavLink to="/chat" className="nav-link">Chat del equipo</NavLink>
        </nav>
        <OnlineUsers users={realtime.online} meId={user.id} />
        <div className="me">
          <Avatar name={user.name} role={user.role} />
          <span className="people-text">
            <CounterBadge name={user.name} count={stats?.productsCreated} light />
            <small>{roleOf(user.role).label} · productos creados</small>
          </span>
          <button className="btn btn--ghost-light" onClick={() => logout()}>Salir</button>
        </div>
      </aside>
      <Outlet context={realtime} />
    </div>
  );
}

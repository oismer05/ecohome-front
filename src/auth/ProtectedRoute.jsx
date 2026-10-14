import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

/** Solo deja pasar a quien tiene sesión; si no, lo manda al login. */
export default function ProtectedRoute({ children }) {
  const { token, checking } = useAuth();
  if (checking) return <div className="splash" role="status">Comprobando tu sesión…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Shell from './pages/Shell.jsx';
import Chat from './pages/Chat.jsx';
import Catalog from './pages/Catalog.jsx';

export default function App() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/catalogo" replace /> : <Login />} />
      <Route element={<ProtectedRoute><Shell /></ProtectedRoute>}>
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/catalogo' : '/login'} replace />} />
    </Routes>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api.js';

// Códigos con los que el backend rechaza la conexión (handshake) y qué hacer con cada uno.
const SESSION_ERRORS = ['NO_TOKEN', 'TOKEN_INVALID', 'TOKEN_EXPIRED', 'USER_NOT_FOUND'];
const REASONS = {
  TOKEN_EXPIRED: 'Tu sesión venció. Inicia sesión de nuevo.',
  TOKEN_INVALID: 'Tu sesión ya no es válida. Inicia sesión de nuevo.',
  NO_TOKEN: 'Necesitas iniciar sesión para entrar al chat.',
  USER_NOT_FOUND: 'Tu cuenta ya no existe. Habla con el administrador.',
};

/**
 * Conecta con Socket.IO enviando el JWT en el handshake (auth.token) y expone:
 *   status   'connecting' | 'online' | 'offline' | 'denied'
 *   messages últimos 10 al entrar + los nuevos en tiempo real
 *   online   personas conectadas ahora
 *   send(text) -> Promise (espera la confirmación del servidor)
 *   subscribeCatalog(fn) -> avisos "products-changed" (unidad 3: alguien creó/editó un producto)
 */
export function useChat(token, { onSessionLost }) {
  const [status, setStatus] = useState('connecting');
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState([]);
  const [problem, setProblem] = useState('');
  const socketRef = useRef(null);
  const catalogListeners = useRef(new Set());
  const lostRef = useRef(onSessionLost);
  lostRef.current = onSessionLost;

  useEffect(() => {
    setStatus('connecting');
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => { setStatus('online'); setProblem(''); });
    socket.on('disconnect', () => setStatus('offline'));

    socket.on('connect_error', (err) => {
      const code = err.data?.code;
      if (SESSION_ERRORS.includes(code)) {
        socket.disconnect();
        lostRef.current?.(REASONS[code]);
      } else if (code === 'FORBIDDEN') {
        socket.disconnect();
        setStatus('denied');
        setProblem(err.message);
      } else {
        setStatus('offline');          // servidor caído: Socket.IO reintenta solo
      }
    });

    socket.on('messages', (history) => setMessages(history));
    socket.on('new-message', (msg) => setMessages((prev) => (
      prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
    )));
    socket.on('online-users', setOnline);
    socket.on('chat-error', (e) => setProblem(e.message));
    socket.on('products-changed', (evt) => catalogListeners.current.forEach((fn) => fn(evt)));

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token]);

  const send = useCallback((text) => new Promise((resolve, reject) => {
    const socket = socketRef.current;
    if (!socket?.connected) return reject(new Error('Sin conexión con el servidor. Reintentando…'));
    return socket.timeout(5000).emit('new-message', { text }, (timeoutErr, ack) => {
      if (timeoutErr) return reject(new Error('El servidor no respondió. Inténtalo de nuevo.'));
      if (!ack?.ok) return reject(new Error(ack?.error || 'No se pudo enviar el mensaje'));
      return resolve(ack);
    });
  }), []);

  const subscribeCatalog = useCallback((fn) => {
    catalogListeners.current.add(fn);
    return () => catalogListeners.current.delete(fn);
  }, []);

  return { status, messages, online, problem, send, subscribeCatalog };
}

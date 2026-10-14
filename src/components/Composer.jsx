import { useRef, useState } from 'react';

const MAX = 500;

export default function Composer({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);
    setError('');
    try {
      await onSend(clean);
      setText('');
    } catch (err) {
      setError(err.message);          // el texto se conserva para reintentar
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  const left = MAX - text.length;
  return (
    <form className="composer" onSubmit={submit}>
      {error && <p className="composer-error" role="alert">{error}</p>}
      <div className="composer-row">
        <label className="sr-only" htmlFor="msg">Escribe un mensaje</label>
        <input
          id="msg"
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabled ? 'Reconectando con el servidor…' : 'Escribe un mensaje para el equipo'}
          maxLength={MAX}
          autoComplete="off"
          disabled={disabled}
        />
        {left <= 60 && <span className={`counter ${left <= 10 ? 'counter--warn' : ''}`}>{left}</span>}
        <button type="submit" className="btn btn--amber" disabled={disabled || sending || !text.trim()}>
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </form>
  );
}

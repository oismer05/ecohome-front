/** Logotipo: dos vasos de vidrio superpuestos (verde mar y ámbar). */
export default function Mark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="25" cy="32" r="17" fill="#8fd1b4" />
      <circle cx="40" cy="32" r="17" fill="#e0a030" fillOpacity=".88" />
      <path d="M32 18.6a17 17 0 0 1 0 26.8 17 17 0 0 1 0-26.8Z" fill="#6c8f5a" />
    </svg>
  );
}

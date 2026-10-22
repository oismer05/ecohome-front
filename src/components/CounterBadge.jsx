/** "Nombre (N)": contador de productos creados por el usuario. La key fuerza la animación al cambiar N. */
export default function CounterBadge({ name, count, light = false }) {
  return (
    <span className={`counter-badge ${light ? 'counter-badge--light' : ''}`} aria-label={`${name} (${count ?? '…'})`}>
      <span className="counter-name">{name}</span>
      <span key={count} className="counter-num">({count ?? '…'})</span>
    </span>
  );
}

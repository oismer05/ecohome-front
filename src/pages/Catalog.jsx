import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { api } from '../api.js';
import CounterBadge from '../components/CounterBadge.jsx';

const price = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/**
 * Catálogo (unidad 3): cada producto muestra quién lo registró y el usuario ve su
 * contador "Nombre (N)". Se refresca solo con el aviso "products-changed" de Socket.IO,
 * así lo que se crea desde Flutter aparece aquí sin recargar (y al revés).
 */
export default function Catalog() {
  const { token, user, stats, bumpStats, refreshStats } = useAuth();
  const { subscribeCatalog } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, ranking] = await Promise.all([api.products(token), api.creatorsStats(token)]);
      setProducts([...list].sort((a, b) => b.id - a.id));    // lo más reciente primero
      setCreators(ranking);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // Cambios hechos por otra persona (web o móvil) llegan en vivo
  useEffect(() => subscribeCatalog((evt) => {
    load();
    refreshStats();
    if (evt.action === 'created' && evt.by?.id !== user.id) {
      setToast(`${evt.by?.name ?? 'Alguien'} agregó «${evt.product?.name ?? 'un producto'}»`);
    }
  }), [subscribeCatalog, load, refreshStats, user.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => (!onlyMine || p.creator?.id === user.id) && (!q || p.name.toLowerCase().includes(q)));
  }, [products, onlyMine, query, user.id]);

  function onCreated(product) {
    bumpStats();                                   // Nombre (N) cambia al instante
    setHighlight(product.id);
    setProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
    setToast(`Producto creado: ${product.name}`);
    load();
  }

  return (
    <main className="chat catalog">
      <header className="chat-head">
        <div>
          <h1>Catálogo</h1>
          <p className="muted small">{loading ? 'Cargando…' : `${products.length} productos · cada uno muestra quién lo registró`}</p>
        </div>
        <div className="you">
          <span className="muted small">Tus productos</span>
          <CounterBadge name={user.name} count={stats?.productsCreated} />
        </div>
      </header>

      <div className="scroll">
        <div className="catalog-top">
          {user.role === 'admin' && <NewProduct token={token} userName={user.name} onCreated={onCreated} />}
          <section className="creators" aria-label="Productos registrados por persona">
            <h2 className="section-title">Productos registrados por persona</h2>
            {creators.length === 0 ? <p className="muted small">Nadie ha registrado productos todavía.</p> : (
              <ol className="ranking">
                {creators.map((c) => (
                  <li key={c.userId} className={c.userId === user.id ? 'is-me' : ''}>
                    <span>{c.name}</span>
                    <strong>{c.productsCreated}</strong>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="toolbar">
          <div className="segmented" role="group" aria-label="Filtro">
            <button type="button" className={!onlyMine ? 'on' : ''} onClick={() => setOnlyMine(false)}>Todos</button>
            <button type="button" className={onlyMine ? 'on' : ''} onClick={() => setOnlyMine(true)}>Creados por mí</button>
          </div>
          <label className="sr-only" htmlFor="q">Buscar producto</label>
          <input id="q" className="search" placeholder="Buscar producto" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        {error && <p className="alert alert--error" role="alert">{error}</p>}
        {!loading && visible.length === 0 && <p className="muted empty-line">No hay productos con ese filtro.</p>}

        <table className="products">
          <thead>
            <tr><th>Producto</th><th>Creado por</th><th className="num">Precio</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id} className={p.id === highlight ? 'is-new' : ''}>
                <td>{p.name}</td>
                <td className={p.creator?.id === user.id ? 'mine' : 'muted'}>
                  {p.creator ? `${p.creator.name}${p.creator.id === user.id ? ' (tú)' : ''}` : 'Catálogo inicial'}
                </td>
                <td className="num">{price.format(p.price)}</td>
                <td>{p.in_stock ? <span className="tag tag--ok">Disponible</span> : <span className="tag tag--out">Agotado</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

/** Formulario de alta (solo admin). No envía el creador: el backend lo toma del JWT. */
function NewProduct({ token, userName, onCreated }) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [inStock, setInStock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    const amount = Number(value);
    if (!name.trim()) return setError('Escribe el nombre del producto.');
    if (!(amount > 0)) return setError('El precio debe ser un número mayor que 0.');
    setBusy(true);
    setError('');
    try {
      const product = await api.createProduct(token, { name: name.trim(), price: amount, inStock });
      setName(''); setValue(''); setInStock(true);
      onCreated(product);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="new-product" onSubmit={submit}>
      <h2 className="section-title">Nuevo producto</h2>
      <p className="muted small">Quedará registrado a nombre de {userName}.</p>
      <div className="form-row">
        <label htmlFor="np-name">Nombre</label>
        <input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Jarra de vidrio reciclado" />
      </div>
      <div className="form-row form-row--split">
        <div>
          <label htmlFor="np-price">Precio (COP)</label>
          <input id="np-price" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))} placeholder="24900" />
        </div>
        <label className="check"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> Disponible</label>
      </div>
      {error && <p className="composer-error" role="alert">{error}</p>}
      <button className="btn btn--amber" type="submit" disabled={busy}>{busy ? 'Creando…' : 'Crear producto'}</button>
    </form>
  );
}

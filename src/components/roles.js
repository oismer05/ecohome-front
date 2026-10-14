// Etiqueta y color de cada área del equipo
export const ROLES = {
  admin:     { label: 'Administración', tone: 'admin' },
  cliente:   { label: 'Cliente',        tone: 'admin' },
  ventas:    { label: 'Ventas',         tone: 'ventas' },
  logistica: { label: 'Logística',      tone: 'logistica' },
  soporte:   { label: 'Soporte',        tone: 'soporte' },
};
export const roleOf = (role) => ROLES[role] || { label: role, tone: 'admin' };
export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

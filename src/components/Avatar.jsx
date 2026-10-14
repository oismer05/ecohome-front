import { initials, roleOf } from './roles.js';

export default function Avatar({ name, role, size = 'md' }) {
  return (
    <span className={`avatar avatar--${size} tone-${roleOf(role).tone}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

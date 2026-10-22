# EcoHome Store · Frontend web (catálogo y chat interno)

Aplicación React del equipo de EcoHome Store: inicio de sesión con JWT, **catálogo con el creador de cada producto y el contador «Nombre (N)»**, y **chat en tiempo real** por Socket.IO, conectada al backend `ecohome-store-backend` (v3). La app móvil Flutter (`ecohome-store-flutter`) usa exactamente el mismo backend.

> **Repositorio del frontend:** _(pegar aquí el enlace de tu repositorio de GitHub)_
> **Repositorio del backend:** _(pegar aquí el enlace del repositorio del backend)_
> **Repositorio de la app Flutter:** _(pegar aquí el enlace del repositorio de Flutter)_

## Qué hace
- **Login** (`/login`): envía correo y contraseña a `POST /auth/login`, guarda el JWT en el estado de React (Context) y en `localStorage` para sobrevivir a F5.
- **Ruta protegida** (`/chat`): sin sesión redirige al login; al abrir con un token guardado se confirma con `GET /auth/me`.
- **Chat**: lista de mensajes + caja de texto + botón **Enviar**. Se conecta con `socket.io-client` enviando el token en el handshake (`auth: { token }`). Al entrar muestra los **últimos 10 mensajes** y después los nuevos **en tiempo real**.
- **Catálogo** (`/catalogo`, unidad 3): listado con la columna «Creado por», filtro «Creados por mí», buscador y ranking «Productos registrados por persona». El usuario autenticado aparece como `Nombre (N)` (`GET /users/me/stats`). Un administrador crea productos desde el formulario; el contador sube al instante (`Arturo (14)` → `Arturo (15)`). Si el producto se crea desde la app Flutter, la web se actualiza sola con el aviso `products-changed`.
- **Presencia** (quién está en línea), mensajes propios a la derecha, agrupación por autor y día, contador de caracteres (máx. 500).
- **Errores claros**: credenciales incorrectas, servidor caído (reintenta solo), sesión vencida (vuelve al login con aviso), rol sin acceso (`cliente`).
- Diseño adaptable a móvil, foco visible y animaciones reducidas si el sistema lo pide.

## Estructura
```
src/
├── main.jsx, App.jsx            # Arranque y rutas
├── api.js                       # URL del backend y fetch (login, me)
├── auth/AuthContext.jsx         # Token + usuario (estado + localStorage)
├── auth/ProtectedRoute.jsx      # Guarda de rutas
├── hooks/useChat.js             # Conexión Socket.IO: chat, presencia y avisos del catálogo
├── pages/Login.jsx, Shell.jsx, Catalog.jsx, Chat.jsx
├── components/                  # MessageList, Composer, OnlineUsers, Avatar, Mark, roles
└── styles.css                   # Sistema de diseño "vidrio reciclado"
```

## Puesta en marcha
1. Levante el backend (`ecohome-store-backend`: `npm install`, `npm run db:init`, `npm run db:seed`, `npm start` → `http://localhost:3000`).
2. En esta carpeta:
```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3000
npm run dev              # http://localhost:5173
```
3. Entre como `arturo@ecohome.com` para crear productos y ver su contador. Pruebe el chat con **dos ventanas** (una normal y otra de incógnito): `ventas@ecohome.com` y `logistica@ecohome.com`, contraseña `Equipo12345!`. La pantalla de login tiene botones para rellenar las cuentas de demostración.

`npm run build` genera la versión de producción en `dist/`. Si el frontend se publica en otra URL, añádala a `CORS_ORIGIN` en el `.env` del backend.

# EcoHome Store · Frontend (chat interno)

Aplicación React del **chat en tiempo real del equipo de EcoHome Store**: inicio de sesión con JWT y sala de chat conectada por Socket.IO al backend `ecohome-store-backend` (v2).

> **Repositorio del frontend:** _(pegar aquí el enlace de tu repositorio de GitHub)_
> **Repositorio del backend:** _(pegar aquí el enlace del repositorio del backend)_

## Qué hace
- **Login** (`/login`): envía correo y contraseña a `POST /auth/login`, guarda el JWT en el estado de React (Context) y en `localStorage` para sobrevivir a F5.
- **Ruta protegida** (`/chat`): sin sesión redirige al login; al abrir con un token guardado se confirma con `GET /auth/me`.
- **Chat**: lista de mensajes + caja de texto + botón **Enviar**. Se conecta con `socket.io-client` enviando el token en el handshake (`auth: { token }`). Al entrar muestra los **últimos 10 mensajes** y después los nuevos **en tiempo real**.
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
├── hooks/useChat.js             # Conexión Socket.IO, historial, mensajes, presencia
├── pages/Login.jsx, Chat.jsx
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
3. Pruebe el chat con **dos ventanas** (una normal y otra de incógnito): `ventas@ecohome.com` y `logistica@ecohome.com`, contraseña `Equipo12345!`. La pantalla de login tiene botones para rellenar las cuentas de demostración.

`npm run build` genera la versión de producción en `dist/`. Si el frontend se publica en otra URL, añádala a `CORS_ORIGIN` en el `.env` del backend.

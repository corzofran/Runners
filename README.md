# Runners en Proceso 🏃‍♂️

Plataforma de administración de atletas y planes de entrenamiento para entrenadores de atletismo.
Diseño premium (Nike Run Club × Strava × TrainingPeaks), modo oscuro, glassmorphism, 100% responsive.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + Radix UI + Recharts
- **Backend**: API Routes de Next.js (Node.js) + Prisma ORM
- **Base de datos**: PostgreSQL
- **Auth**: JWT (jose, edge-compatible) + bcrypt, cookies httpOnly

## Qué incluye esta primera entrega

✅ Base de datos completa y normalizada (`prisma/schema.prisma`): usuarios, roles, atletas, entrenamientos,
asignaciones, progreso, estadísticas, eventos, mensajes, notificaciones, archivos.
✅ Autenticación con JWT + bcrypt, cookies httpOnly, middleware de protección de rutas por rol.
✅ Seed seguro del administrador (`corzo.fran`) — la contraseña se define por variable de entorno, nunca en el código.
✅ Sistema de diseño completo (paleta deportiva, glassmorphism, dark mode, animaciones) aplicado en cada pantalla.
✅ CRUD completo de atletas (crear, editar, suspender, reactivar, eliminar, cambiar contraseña).
✅ Creación de entrenamientos totalmente personalizados, con asignación a uno, varios o todo el equipo.
✅ Duplicar / editar / eliminar entrenamientos. Notificaciones automáticas al asignar o modificar.
✅ Calendario mensual (admin y atleta) con vista por día y creación rápida de entrenamientos.
✅ Eventos (carreras, competencias, entrenamientos grupales, juntas).
✅ Dashboard del administrador y del atleta con estadísticas reales calculadas desde la base de datos.
✅ Progreso del atleta con gráficas (kilómetros y entrenamientos por semana) vía Recharts.
✅ Estado de entrenamiento (pendiente / en proceso / completado), comentarios y subida de evidencia (fotos/PDF).
✅ Chat interno entrenador ↔ atleta con notificación de mensajes no leídos.
✅ Buscador de atletas. Validación de formularios con Zod + React Hook Form en todo el sistema.
✅ Rate limiting en el login, contraseñas con bcrypt (12 rounds), mensajes de error que no filtran información.

## Qué queda como base preparada para siguientes entregas

Estas piezas están **modeladas en la base de datos y con arquitectura lista**, pero no fueron el foco de esta
primera entrega — puedo construirlas en la siguiente iteración:

- Arrastrar y soltar entrenamientos en el calendario (la API ya soporta reprogramar vía `PATCH { fecha }`,
  falta la interacción drag & drop en el cliente — recomendable con `@dnd-kit`).
- Notificaciones push en tiempo real (hoy son "pull" vía polling; el modelo `Notificacion` ya existe).
- Vista semanal/diaria del calendario (hoy solo vista mensual).
- Mapa interactivo en eventos (los campos `latitud`/`longitud` ya están en el modelo `Evento`).
- Integraciones futuras (Garmin, Strava, Apple Health, Google Fit, pagos, QR de asistencia): la arquitectura
  modular (servicios separados por dominio) está lista para añadir estos módulos sin romper lo existente.

## Puesta en marcha local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env y define DATABASE_URL, JWT_SECRET, ADMIN_USERNAME y ADMIN_PASSWORD

# 3. Crear las tablas en la base de datos
npm run db:push

# 4. Crear el usuario administrador (corzo.fran) de forma segura
npm run db:seed

# 5. Levantar el entorno de desarrollo
npm run dev
```

Abre `http://localhost:3000`, entra a **Iniciar sesión** con el usuario `corzo.fran` y la contraseña que
definiste en `ADMIN_PASSWORD`.

> ⚠️ **Seguridad**: la contraseña del administrador nunca vive en el código fuente. Se define solo en `.env`
> (local) o en las variables de entorno del proveedor de hosting (producción). El script `prisma/seed.ts`
> falla intencionalmente si `ADMIN_PASSWORD` no está definido o es muy corto.

## Despliegue en Railway

1. Crea un nuevo proyecto en Railway y agrega un servicio **PostgreSQL** — copia su `DATABASE_URL`.
2. Crea un servicio a partir de este repositorio (conecta tu GitHub).
3. En **Variables**, define: `DATABASE_URL` (la de Railway), `JWT_SECRET` (genera uno largo y aleatorio,
   por ejemplo con `openssl rand -base64 48`), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_APP_URL`.
4. En **Settings → Deploy**, agrega como comando de build: `npm run build` y confirma que el *start command*
   sea `npm run start`.
5. Después del primer deploy exitoso, corre una sola vez desde la terminal de Railway (o localmente
   apuntando a la `DATABASE_URL` de producción): `npm run db:push && npm run db:seed`.

> 📌 **Nota sobre archivos subidos**: el disco de Railway es efímero — los archivos guardados en
> `public/uploads` (evidencias de entrenamientos) se pierden en cada redeploy. Para producción real,
> conecta un storage persistente (Cloudflare R2, AWS S3 o Supabase Storage) en `src/app/api/upload/route.ts`
> — ya está aislado en un único archivo para facilitar el cambio.

## Estructura del proyecto

```
prisma/
  schema.prisma       # Modelo de datos completo
  seed.ts              # Crea el usuario administrador de forma segura
src/
  app/
    (auth)/login, recuperar-password
    (admin)/admin/dashboard, atletas, entrenamientos, calendario, eventos, mensajes
    (atleta)/atleta/dashboard, entrenamientos, calendario, progreso, perfil, mensajes
    api/                # Route handlers: auth, atletas, entrenamientos, eventos, mensajes, progreso, upload
  components/
    ui/                 # Button, Input, Card, Dialog, Select — sistema de diseño base
    layout/              # Sidebar, Topbar
    admin/                # Diálogos de creación (atleta, entrenamiento)
    shared/                # Chat interno reutilizado por ambos roles
  lib/
    auth.ts             # JWT + bcrypt
    session.ts          # Helpers de sesión para Server Components / API routes
    validations.ts       # Esquemas Zod
    rate-limit.ts         # Limitador de intentos de login
  middleware.ts          # Protección de rutas por rol
```

## Notas de arquitectura

- El middleware protege **todas** las rutas excepto `/`, `/login`, `/recuperar-password` y los assets.
  Cada API route además vuelve a verificar el JWT (no confía ciegamente en los headers del middleware),
  para que un cliente no pueda falsificar su rol.
- Crear un atleta crea **en una sola transacción** su `Usuario` + `Atleta` + `Estadistica`, evitando
  registros huérfanos.
- Los componentes de UI (`Button`, `Card`, `Dialog`, etc.) están desacoplados del dominio — reutilízalos
  para cualquier pantalla nueva sin duplicar estilos.

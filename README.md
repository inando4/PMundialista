# Polla Mundialista 2026

MVP web para registrar participantes, guardar pronosticos, cargar resultados oficiales y calcular la tabla de posiciones.

## Stack

- Angular 19
- Supabase Auth
- Supabase Postgres + Row Level Security
- Supabase Realtime para refrescar ranking/partidos

## Configuracion

1. Crea un proyecto en Supabase.
2. Ejecuta el SQL de `supabase/schema.sql` en el SQL Editor de Supabase.
3. Edita `supabase/seed.sql` y registra uno o mas emails administradores.
4. Ejecuta `supabase/seed.sql`.
5. Para cargar la fase de grupos desde el 15 de junio hasta el 27 de junio, ejecuta `supabase/world-cup-2026-group-stage-from-2026-06-15.sql`.
6. Copia `src/environments/environment.example.ts` como referencia y edita `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU-ANON-KEY',
  adminEmails: ['admin@tu-dominio.com', 'otro-admin@tu-dominio.com'],
};
```

Cada email admin debe estar tanto en `environment.ts` como en la tabla `public.admins`.

## Desarrollo

```bash
npm install
npm start
```

La app queda disponible en `http://localhost:4200`.

## Scripts

```bash
npm run build
npm run build:github-pages
npm test -- --watch=false --browsers=ChromeHeadless
```

## GitHub Pages

La app usa hash routing para que GitHub Pages soporte rutas internas sin configurar servidor. Las rutas se veran asi:

```txt
https://TU_USUARIO.github.io/AplicativoApuestasMundial/#/ranking
```

Para generar el build de GitHub Pages:

```bash
npm run build:github-pages
```

En Supabase agrega estas URLs:

```txt
Site URL:
https://TU_USUARIO.github.io/AplicativoApuestasMundial

Redirect URLs:
http://localhost:4200/**
https://TU_USUARIO.github.io/AplicativoApuestasMundial/**
```

## MVP incluido

- Registro e inicio de sesion por email/password.
- Perfil de participante al registrarse.
- Lista de partidos desde Supabase.
- Pronosticos por participante.
- Bloqueo de pronosticos cuando el partido ya empezo.
- Panel admin para cargar resultados, marcar pagos, eliminar participantes y cambiar reglas.
- Ranking automatico con puntos, resultados acertados y marcadores exactos.

## Reglas de puntaje

- Resultado correcto: 1 punto.
- Marcador exacto: 3 puntos adicionales.
- Total marcador exacto: 4 puntos.

Las reglas se pueden editar desde el panel admin.

## Notas

- El seed trae partidos placeholder. Cambialos por el fixture oficial cuando lo tengas.
- El archivo `world-cup-2026-group-stage-from-2026-06-15.sql` usa horarios de Peru (`-05`) y se puede ejecutar varias veces sin duplicar esos partidos.
- Los pronosticos se bloquean en frontend y en Supabase: la UI recalcula cada segundo y RLS impide insertar/editar si `starts_at <= now()`.
- El admin puede eliminar el perfil de un participante, pero no borra el usuario de Supabase Auth desde el cliente.
- Para produccion conviene crear un ambiente separado y revisar politicas RLS antes de abrir la app a mas usuarios.

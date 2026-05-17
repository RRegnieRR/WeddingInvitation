# Sitio de Boda de Regnier & Alizee

La versión pública del sitio puede quedar hospedada en internet con RSVP real, sin depender de tu computadora, usando Vercel para el frontend/API y GitHub como almacenamiento del archivo Excel.

## Qué hace ahora

- El formulario RSVP envía a `POST /api/rsvp`
- La función serverless valida duplicados
- El backend actualiza `data/rsvp-confirmations.xlsx` directamente en `main`
- El archivo queda visible después en GitHub

## Despliegue recomendado

Usa este repo en Vercel.

### 1. Conecta el repo a Vercel

Importa el repositorio en Vercel y deja que detecte el proyecto.

### 2. Agrega estas variables de entorno en Vercel

Puedes copiarlas de `.env.example`:

```bash
GITHUB_TOKEN=
GITHUB_OWNER=RRegnieRR
GITHUB_REPO=WeddingInvitation
GITHUB_BRANCH=main
RSVP_FILE_PATH=data/rsvp-confirmations.xlsx
RSVP_COMMITTER_NAME=Wedding RSVP Bot
RSVP_COMMITTER_EMAIL=bot@example.com
```

### 3. Token de GitHub

El `GITHUB_TOKEN` debe ser un fine-grained personal access token con permiso de escritura en Contents para este repositorio.

### 4. Publica el sitio

Después del deploy, comparte el dominio de Vercel con los invitados. Ahí el formulario sí podrá guardar respuestas reales desde internet.

## Archivo Excel

Las confirmaciones quedan en:

```bash
data/rsvp-confirmations.xlsx
```

Ese archivo se actualiza por commits automáticos hechos por la función RSVP.

## Límite de una confirmación

El sistema bloquea:

- mismo nombre normalizado
- mismo navegador/dispositivo

## Desarrollo local

### Ver solo el sitio estático

```bash
open index.html
```

### Backend local opcional

```bash
npm install
npm run rsvp:server
```

## Scripts

```bash
npm run rsvp:init
npm run rsvp:server
npm run dev
npm run build
npm run preview
```

## Importante

GitHub Pages por sí solo no puede escribir el Excel. Para que invitados reales lo usen desde internet, debes usar el deploy con backend serverless.

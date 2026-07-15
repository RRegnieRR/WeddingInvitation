# Invitaciones de boda de Regnier & Alizee

Cada familia recibe un enlace personal. Al abrirlo verá:

- el nombre de la familia;
- cuántas invitaciones para adultos tiene;
- cuántas invitaciones para niños tiene;
- espacios para escribir solamente los nombres de quienes asistirán.

Ejemplo: **Familia García · 4 adultos · 2 niños**.

## Lo único que debes editar

Abre este archivo con Excel o Numbers:

```text
outputs/wedding-rsvp/lista-de-invitados.xlsx
```

Escribe una familia o una persona por fila usando únicamente estas tres columnas:

| Nombre en la invitación | Invitaciones adultos | Invitaciones niños |
|---|---:|---:|
| Familia Palacios García | 4 | 2 |
| McKay Stacey | 1 | 0 |

Escribe exactamente lo que quieres que aparezca después de “Invitación para”. Los invitados escribirán los nombres de quienes asistirán cuando confirmen.

## Después de llenar el archivo

Pídele a Codex: **“Ya llené mi lista de invitados; prepara los enlaces.”** Codex puede encargarse de los pasos técnicos restantes.

## Configuración técnica, solo una vez

El sistema usa Supabase para guardar las respuestas y Vercel para publicar la página. Antes de crear los enlaces se necesita:

1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` en su SQL Editor.
3. Copiar `.env.example` a `.env.local` y completar las tres variables.
4. Agregar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` también en Vercel.

Después se ejecuta:

```bash
npm run guests:import
```

Esto genera `data/invitation-links.csv` con un enlace privado para cada familia.

## Verificación del proyecto

```bash
npm run guests:check
npm run test:rsvp
npm run build
```

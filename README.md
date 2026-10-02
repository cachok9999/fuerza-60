# Fuerza 60 · GitHub Pages + Supabase

Aplicación en español para organizar un bloque de 60 días de alimentación, fuerza y seguimiento. Conserva los menús, la rutina y las revisiones del proyecto original. Los registros y fotos se sincronizan en Supabase; GitHub Pages sirve la interfaz.

**Estado de esta entrega:** código preparado y pruebas locales disponibles. No se ha creado un repositorio en tu cuenta ni un proyecto Supabase, y todavía no existe una URL publicada. El funcionamiento real entre dos dispositivos debe verificarse después de conectarlos.

## 1. Crear el proyecto de Supabase

1. Ingresá a [Supabase](https://supabase.com/dashboard) y creá una cuenta/proyecto. Elegí una región apropiada; guardá la contraseña de la base de datos en tu gestor de contraseñas. No la pegues en este repositorio.
2. Abrí **SQL Editor**, pegá y ejecutá el archivo [supabase/migrations/202610020001_fuerza60.sql](supabase/migrations/202610020001_fuerza60.sql). Se ejecuta una sola vez y dentro de una transacción. Crea la tabla, las políticas de acceso y un bucket privado de fotos.
3. En **Project Settings → API Keys** copiá la clave **publishable**; en la configuración de API copiá la URL HTTPS del proyecto. No uses `service_role`, `sb_secret_` ni la contraseña de la base.
4. En **Authentication → Providers**, habilitá correo/contraseña. Conservá la confirmación de correo. La disponibilidad y límites del envío de correos dependen de la configuración de Supabase; si necesitás entrega fiable, configurá un proveedor SMTP siguiendo sus instrucciones.
5. Cuando tengas la dirección de GitHub Pages, en **Authentication → URL Configuration** colocala como **Site URL** y agregala exactamente a **Redirect URLs**, incluyendo la barra final. Para desarrollo podés agregar `http://localhost:5174/` y `http://127.0.0.1:5174/`.

Ejemplo de URL, no una dirección ya creada: `https://TU-USUARIO.github.io/fuerza-60/`.

## 2. Subir el proyecto a GitHub

1. Creá un repositorio llamado `fuerza-60`.
2. Subí **el contenido de esta carpeta a la raíz del repositorio**, incluyendo `.github`, `.gitignore`, `.env.example`, `src`, `supabase`, `scripts`, `tests` y ambos archivos `package*.json`. No subas la carpeta contenedora como un nivel extra.
3. Podés usar GitHub Desktop: **File → Add local repository**, crear el repositorio si lo pide, hacer el primer commit y **Publish repository**.
4. No subas `node_modules`, `dist`, `.env.local`, fotos, respaldos ni tu configuración personal. Están fuera de esta entrega o excluidos por `.gitignore`.
5. En un plan que solo permite Pages con repositorios públicos, el código y la interfaz serán públicos. Las mediciones y fotos siguen protegidas por autenticación y RLS; el repositorio no contiene tus datos de salud.

## 3. Configurar y publicar GitHub Pages

1. En el repositorio, abrí **Settings → Secrets and variables → Actions → Variables**.
2. Agregá:
   - `VITE_SUPABASE_URL`: URL HTTPS de tu proyecto.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: clave publicable de Supabase.
3. Estas dos variables aparecen en el JavaScript del navegador. Eso es intencional: no son credenciales de administración. La privacidad depende de las políticas RLS incluidas.
4. En **Settings → Pages → Build and deployment → Source**, seleccioná **GitHub Actions**.
5. Abrí **Actions → Publicar Fuerza 60 → Run workflow**. En adelante, cada push a `main` o `master` vuelve a publicar.
6. La dirección real aparece al terminar en **Settings → Pages** y en el despliegue de Actions. Abrila y agregala a las URLs de Supabase del paso 1.
7. Creá tu cuenta desde la aplicación, confirmá el correo e iniciá sesión. Configurá tus medidas iniciales o importá tu archivo personal de configuración. Ese archivo no se sube al repositorio.

No se requieren claves de OpenAI ni de Cloudflare. Los servicios pueden tener límites, pausas por inactividad o costos según el plan elegido; revisá los planes antes de contratar.

## Sincronización y privacidad

- Abrí la misma URL e iniciá sesión con **la misma cuenta** en cada dispositivo.
- Los cambios se guardan en Supabase. Se actualizan al volver a la pestaña, al recuperar la conexión, cada 60 segundos con la pestaña visible y con **Actualizar**.
- Si otra sesión modificó el mismo registro mientras lo editabas, se rechaza la sobrescritura. Actualizá, abrí el registro más reciente e incorporá tus cambios.
- Se necesita conexión para guardar. Un error nunca se muestra como guardado exitoso; el formulario permanece abierto para reintentar.
- Al cerrar sesión se desmonta la vista personal. El navegador guarda la sesión de autenticación, no una copia local autoritativa de medidas o fotos.
- Las fotos están en un bucket privado y se descargan con tu sesión. Se muestran mediante URLs temporales del navegador.
- Las fotos reemplazadas pueden permanecer como objetos sin referencia en Storage; no las hagas públicas. Podés revisar esos objetos desde tu cuenta de Supabase.
- Los administradores del proyecto Supabase conservan acceso administrativo a la base y al almacenamiento.
- No publiques respaldos JSON: contienen información personal. Descargalos desde **Progreso** y guardalos de forma privada.

## Respaldo e importación

La exportación incluye perfil, medidas, series y revisiones. Las fotos se descargan por separado. La importación incorpora registros nuevos; si encuentra alguna clave existente, cancela toda la importación para evitar sobreescribirla. Los respaldos de versiones anteriores sin las cuatro medidas de perfil deben completarse antes de importarlos; no inventes datos.

## Desarrollo local

Node.js 24 recomendado (mínimo 22.13).

```sh
npm ci
cp .env.example .env.local
# Completar las dos variables publicables en .env.local.
npm run dev -- --port 5174
```

En PowerShell, usá `Copy-Item .env.example .env.local` en lugar de `cp`.

```sh
npm test
npm run build
npm run preview -- --port 5174
```

Si no hay configuración, la app muestra cómo conectarla. No crea cuentas ficticias ni simula sincronización.

## Verificación después del despliegue

1. Creá dos cuentas de prueba, A y B. En A, guardá una medida y una foto.
2. Entrá como A desde otro navegador/dispositivo: al actualizar deben aparecer ambas.
3. Entrá como B: no debe ver registros ni fotos de A, tampoco mediante acceso directo al almacenamiento.
4. Editá el mismo día en ambos dispositivos A: el segundo intento con una revisión antigua debe mostrar un conflicto.
5. Probá recuperación de contraseña y confirmación de correo desde la URL final.
6. Apagá temporalmente la conexión: un intento de guardar debe fallar de forma visible y conservar el formulario.
7. Exportá un respaldo, guardalo en privado y verificá que su contenido corresponde a tu cuenta.

Las pruebas automatizadas cubren cálculos, validación y políticas de aislamiento de PostgreSQL mediante un entorno local de prueba. No sustituyen la verificación del proyecto Supabase real, sus correos ni el despliegue de GitHub.

## Referencias de despliegue

- [GitHub Pages con Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vite en GitHub Pages](https://vite.dev/guide/static-deploy)
- [Supabase: seguridad de datos](https://supabase.com/docs/guides/database/secure-data)
- [Supabase: buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals)

La orientación nutricional es educativa. La app no promete una transformación ni reemplaza una evaluación profesional.


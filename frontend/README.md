Proyecto frontend (Next.js) — descripción de archivos y responsabilidades

Resumen
- Frontend construido con Next.js (app router). Presenta una tienda pública y un panel de administración.
- Página pública: lista de productos y acceso a registrar productos.
- Panel de administración (`/admin`): login simple, listado, creación, edición y eliminación de productos; soporte para imagen vía URL o subida de archivo.

Arquitectura y archivos clave
- `app/page.tsx`: Página pública que muestra los productos disponibles y contiene el enlace "Registrar producto" hacia `/admin`.
- `app/admin/page.tsx`: Panel de administración. Implementa autenticación mínima (cliente), listado de productos y formularios para crear/editar/eliminar.
- `app/layout.tsx`: Layout global de la aplicación (cabecera, pie, proveedor de estilos si aplica).
- `app/globals.css`: Estilos globales que aplican a toda la app.
- `components/AddProductForm.tsx`: Componente reutilizable que renderiza el formulario de producto. Admite `image_url` y `imageFile` (subida). Usado tanto en crear como en editar.
- `public/`: Recursos estáticos (imágenes de ejemplo, favicon, etc.).
- `next.config.ts`, `tsconfig.json`: Configuración de Next.js y TypeScript del proyecto.
- `package.json`: Dependencias y scripts del proyecto frontend.

Interacción con el backend
- El frontend consume la API del backend (ver carpeta `backend/` en la raíz del repositorio). Las rutas principales del backend relacionadas son `/api/products` para operaciones CRUD.
- El formulario permite enviar una URL de imagen (`image_url`) o subir un archivo (`imageFile`). Si no se proporciona imagen, el backend asigna una imagen externa aleatoria.

Consideraciones y dónde editar
- Si necesitas cambiar la presentación pública, edita `app/page.tsx`.
- Para modificar campos del producto o validaciones del formulario, edita `components/AddProductForm.tsx` y sincroniza con las validaciones del backend en `backend/index.js`.
- Para cambiar la lógica de subida o almacenamiento de imágenes, revisa `backend/uploads` y la configuración de `multer` en `backend/index.js`.

Notas finales
- Este README describe responsabilidades y ubicación de los archivos; no incluye pasos ni comandos de ejecución. Para instrucciones de instalación y ejecución revisa el README principal del repositorio en la raíz.


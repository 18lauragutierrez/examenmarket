# Minimarket Luz Divina

Proyecto fullstack (Next.js + Express) para administrar productos (inventario).

## Resumen
- Backend: Express + PostgreSQL (tabla `products`).
- Frontend: Next.js (app router).
- Soporta: CRUD completo, subida de imágenes (archivo) y uso de URL de imagen; si no hay imagen, usa API externa (picsum).

## Requisitos
- Node.js >= 18
- npm
- PostgreSQL (o una URL de conexión válida en `DATABASE_URL`)

## Variables de entorno
Crea `backend/.env` con al menos:

```
PORT=4000
DATABASE_URL=postgresql://user:password@host:port/dbname
```

## Instalación y ejecución
1. Backend

```bash
cd backend
npm install
npm start
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

- Tienda pública: http://localhost:3000
- Panel admin: http://localhost:3000/admin (usuario: `admin`, contraseña: `luzdivina2026`)

## Endpoints API
Base: `http://localhost:4000/api/products`

1. Listar todos
```bash
curl http://localhost:4000/api/products
```

2. Obtener por id
```bash
curl http://localhost:4000/api/products/1
```

3. Crear (JSON, sin archivo)
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Arroz","description":"Bolsa 1kg","price":12.5,"stock":10}'
```
(El backend usará una imagen automática si no envías `image_url` o `imageFile`.)

4. Crear (subiendo archivo de imagen)
```bash
curl -X POST http://localhost:4000/api/products \
  -F "name=Arroz" \
  -F "description=Bolsa 1kg" \
  -F "price=12.5" \
  -F "stock=10" \
  -F "imageFile=@/ruta/a/tu/imagen.jpg"
```

5. Actualizar (JSON)
```bash
curl -X PUT http://localhost:4000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Arroz XL","description":"1.5kg","price":18.99,"stock":5}'
```

6. Actualizar (subir nueva imagen)
```bash
curl -X PUT http://localhost:4000/api/products/1 \
  -F "name=Arroz XL" \
  -F "description=1.5kg" \
  -F "price=18.99" \
  -F "stock=5" \
  -F "imageFile=@/ruta/a/tu/nueva.jpg"
```

7. Eliminar
```bash
curl -X DELETE http://localhost:4000/api/products/1
```

## Admin (UI)
- Login de prueba: `admin` / `luzdivina2026`.
- Desde el panel puedes crear productos (URL o archivo), listar, editar y eliminar.

## Imágenes y almacenamiento
- Las imágenes subidas se guardan en `backend/uploads` y se sirven en `http://localhost:4000/uploads/<archivo>`.
- Si al actualizar se sube una nueva imagen local, el servidor elimina la anterior local para evitar acumulación.
- Si no envías imagen, el backend obtiene una desde `https://picsum.photos` y guarda la URL en `image_url`.

## Validaciones y manejo de errores
- Validación con Joi en el backend (`name`, `price`, `stock`, `image_url` cuando se provee).
- Middleware global de errores y middleware de logging aplicados en `backend/index.js`.

## Notas sobre BDD
- Este proyecto usa PostgreSQL (`pg`) y crea la tabla `products` en el arranque si no existe.
- Si la entrega exige MySQL, hay que migrar — por ahora se mantiene PostgreSQL según pedido.

## Despliegue
- Subir backend (Render/Heroku/otro) y establecer `DATABASE_URL` apropiada.
- Asegurar que la carpeta `uploads` tenga permisos de escritura y sea persistente (en servicios serverless puede requerir almacenamiento externo como S3).

## Pruebas manuales rápidas
- Usa los comandos `curl` de arriba o Postman/Thunder Client.
- Prueba crear producto con `imageFile` y luego editarlo cambiando la imagen para verificar que la antigua se borre.

## Qué falta / mejoras futuras
- Separar rutas/controllers (modularizar backend) para mayor mantenibilidad.
- Agregar tests automáticos e integración CI.
- Documentación en GitHub Pages si despliegas.

---
Si quieres, genero ahora un `README` más detallado con ejemplos Postman, o creo tests automáticos básicos (jest/supertest) para validar los endpoints.

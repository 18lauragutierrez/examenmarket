require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const joi = require('joi');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Crucial para permitir que el frontend de Next.js se conecte

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '-');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten imágenes.'));
    }
    cb(null, true);
  }
});

app.use('/uploads', express.static(uploadDir));

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crea la tabla automáticamente si no existe al encender el servidor
async function inicializarBaseDeDatos() {
  const queryTabla = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      stock INT NOT NULL,
      image_url VARCHAR(255)
    );
  `;
  try {
    await db.query(queryTabla);
    console.log('✅ Base de datos inicializada: Tabla "products" lista.');
  } catch (err) {
    console.error('❌ Error al inicializar la tabla:', err.message);
  }
}

// Middleware para Logging (Extra obligatorio)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} realizado en ${req.url}`);
  next();
});

// Validación de datos con Joi (Extra obligatorio)
const productSchema = joi.object({
  name: joi.string().max(255).min(3).required(),
  description: joi.string().allow(''),
  image_url: joi.string().uri().allow(''),
  price: joi.number().precision(2).positive().required(),
  stock: joi.number().integer().min(0).required()
});

// --- ENDPOINTS REST (CRUD) ---

app.get('/api/products', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'El producto no existe.' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post('/api/products', upload.single('imageFile'), async (req, res, next) => {
  try {
    const body = req.body;
    const { error, value } = productSchema.validate(body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, description, image_url: imageUrl = '', price, stock } = value;
    let image_url = imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e';

    if (req.file) {
      image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (!imageUrl) {
      try {
        const randomId = Math.floor(Math.random() * 50) + 1;
        image_url = `https://picsum.photos/id/${randomId}/400/400`; // Consumo de API externa
      } catch (apiErr) {
        console.log('Error en API externa, usando imagen de respaldo.');
      }
    }

    const queryInsert = 'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const result = await db.query(queryInsert, [name, description, price, stock, image_url]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put('/api/products/:id', upload.single('imageFile'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const { error, value } = productSchema.validate(body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existingProduct = await db.query('SELECT image_url FROM products WHERE id = $1', [id]);
    if (existingProduct.rows.length === 0) return res.status(404).json({ error: 'No se encontró el producto.' });

    const { name, description, image_url: imageUrl = '', price, stock } = value;
    let image_url = imageUrl || existingProduct.rows[0].image_url;

    // Si se subió un nuevo archivo, borrar la imagen local anterior si existía
    if (req.file) {
      // borrar archivo anterior si era local
      try {
        const prevUrl = existingProduct.rows[0].image_url || '';
        if (prevUrl.includes('/uploads/')) {
          const prevFilename = path.basename(prevUrl);
          const prevPath = path.join(uploadDir, prevFilename);
          if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
        }
      } catch (unlinkErr) {
        console.warn('No se pudo borrar la imagen anterior:', unlinkErr.message || unlinkErr);
      }

      image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const queryUpdate = 'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, image_url = $5 WHERE id = $6';
    const result = await db.query(queryUpdate, [name, description, price, stock, image_url, id]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'No se encontró el producto.' });
    res.json({ message: 'Producto actualizado con éxito.', name, description, price, stock, image_url });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // obtener producto para borrar archivo local si corresponde
    const existing = await db.query('SELECT image_url FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'El producto no existe.' });

    const imageUrl = existing.rows[0].image_url || '';
    if (imageUrl.includes('/uploads/')) {
      try {
        const filename = path.basename(imageUrl);
        const fullPath = path.join(uploadDir, filename);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch (unlinkErr) {
        console.warn('No se pudo borrar la imagen al eliminar producto:', unlinkErr.message || unlinkErr);
      }
    }

    const result = await db.query('DELETE FROM products WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'El producto no existe.' });
    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Backend de Minimarket</h1>
    <p>Servicio activo. Usa <a href="/api/products">/api/products</a> para acceder a la API.</p>
  `);
});

// Manejo Global de Errores (Extra obligatorio)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
});

// --- AJUSTE DE ARRANQUE FORZADO FIJO ---
// Evita conflicto con Next.js (puerto 3000) usando 4000 por defecto
const PORT = process.env.PORT || 4000;

// Levantamos primero el servidor para que Express tome el puerto de inmediato y se quede despierto
app.listen(PORT, () => {
  console.log(`🚀 Servidor del backend escuchando fijo en http://localhost:${PORT}`);
  
  // Una vez despierto el puerto, conectamos e inicializamos la tabla en segundo plano
  inicializarBaseDeDatos().then(() => {
    console.log('✨ Sistema de sincronización de datos con Render Activo.');
  });
});
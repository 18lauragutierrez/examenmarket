'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
}

export default function AdminPage() {
  const router = useRouter();
  
  // Estados para el Login de Administrador
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Estados para el Formulario de Productos
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);

  // Manejo del Login del Administrador
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Credenciales de prueba seguras para tu examen
    if (username === 'admin' && password === 'luzdivina2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/products`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    setName(product.name);
    setDescription(product.description);
    setImageUrl(product.image_url);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setStatusMsg('');
    setIsSuccess(true);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const confirmDelete = window.confirm('¿Eliminar este producto?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:4000/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setStatusMsg('Producto eliminado correctamente.');
        fetchProducts();
      } else {
        setIsSuccess(false);
        setStatusMsg(` Error: ${data.error || 'No se pudo eliminar.'}`);
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMsg('Error de conexión: Asegúrate de que el backend esté encendido.');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPrice('');
    setStock('');
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image_url', imageUrl);
    formData.append('price', price);
    formData.append('stock', stock);
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `${apiBaseUrl}/api/products/${editingProductId}`
        : `${apiBaseUrl}/api/products`;
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setStatusMsg(
          isEditing
            ? `¡Éxito! Producto "${data.name || 'actualizado'}" actualizado correctamente.`
            : ` ¡Éxito! Producto "${data.name}" registrado correctamente.`
        );
        resetForm();
        fetchProducts();
      } else {
        setIsSuccess(false);
        setStatusMsg(` Error: ${data.error || 'No se pudo guardar el producto.'}`);
      }
    } catch (error) {
      setIsSuccess(false);
      setStatusMsg(' Error de conexión: Asegúrate de que el backend esté encendido.');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-200">
          <h1 className="text-2xl font-black text-center text-gray-800 mb-2">🔐 Panel Admin</h1>
          <p className="text-xs text-center text-gray-400 mb-6">Ingresa las credenciales del Minimarket</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Usuario</label>
              <input 
                type="text" 
                className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-800 focus:outline-green-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Contraseña</label>
              <input 
                type="password" 
                className="w-full p-2.5 border rounded-lg bg-gray-50 text-gray-800 focus:outline-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-xs font-medium">{loginError}</p>}
            <button type="submit" className="w-full bg-gray-900 text-white font-bold p-3 rounded-lg hover:bg-gray-800 transition">
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">🛠️ Panel de Inventario</h1>
            <p className="text-xs text-gray-500">Agrega nuevos abarrotes a la base de datos de Render</p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="text-xs font-bold bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition"
          >
            🏠 Ver Tienda
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <form onSubmit={handleSubmitProduct} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto *</label>
              <input 
                type="text" 
                placeholder="Ej. Arroz Costeño Extra 1kg"
                className="w-full p-3 border rounded-xl bg-gray-50 text-gray-800 focus:outline-green-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Descripción / Detalles</label>
              <textarea 
                placeholder="Ej. Arroz de máxima calidad, grano seleccionado..."
                className="w-full p-3 border rounded-xl bg-gray-50 text-gray-800 h-24 focus:outline-green-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">URL de la imagen</label>
              <input
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full p-3 border rounded-xl bg-gray-50 text-gray-800 focus:outline-green-500"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Opcional. Escribe una URL de la imagen o sube un archivo desde tu PC.</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Subir imagen desde la PC</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="w-full text-sm text-gray-700"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Precio (S/.) *</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00"
                  className="w-full p-3 border rounded-xl bg-gray-50 text-gray-800 focus:outline-green-500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Stock Inicial *</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full p-3 border rounded-xl bg-gray-50 text-gray-800 focus:outline-green-500"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-700">
              💡 <strong>Nota del Servidor:</strong> Si ingresas una URL válida en <code>URL de la imagen</code>, se usará esa imagen. Si la dejas vacía, se generará una imagen automática.
            </div>

            {statusMsg && (
              <div className={`p-4 rounded-xl text-sm font-medium text-center ${isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {statusMsg}
              </div>
            )}

            <button type="submit" className="w-full bg-green-600 text-white font-black p-4 rounded-xl hover:bg-green-700 shadow-md transition duration-200">
              {isEditing ? ' Actualizar producto' : ' Registrar Abarrote en Render'}
            </button>
          </form>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Productos Registrados</h2>
          {products.length === 0 ? (
            <div className="text-center p-6 bg-white rounded-3xl border border-gray-100 text-gray-500">
              No hay productos cargados todavía.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-24 h-24 rounded-2xl object-cover bg-gray-100"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">S/. {Number(product.price).toFixed(2)} · Stock: {product.stock}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="px-3 py-2 rounded-xl bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{product.description || 'Sin descripción'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';

interface FormState {
  name: string;
  description: string;
  image_url: string;
  price: string;
  stock: string;
}

export default function AddProductForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    image_url: '',
    price: '',
    stock: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    if (!form.name || !form.price || !form.stock) {
      setStatus({ type: 'error', message: 'Nombre, precio y stock son obligatorios.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          image_url: form.image_url,
          price: Number(form.price),
          stock: Number(form.stock)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo registrar el producto.');
      }

      setStatus({ type: 'success', message: 'Producto registrado correctamente.' });
      setForm({ name: '', description: '', image_url: '', price: '', stock: '' });
    } catch (error: unknown) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al conectar con el backend.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Añadir producto</h2>

      {status.message ? (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {status.message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-200 bg-gray-50 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="Ej. Arroz blanco 1kg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-200 bg-gray-50 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="Opcional"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">URL de imagen</label>
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border-gray-200 bg-gray-50 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-400 mt-1">Deja vacío para usar una imagen automática.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border-gray-200 bg-gray-50 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="12.50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border-gray-200 bg-gray-50 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="20"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center w-full rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
        >
          {loading ? 'Guardando...' : 'Registrar producto'}
        </button>
      </form>
    </section>
  );
}

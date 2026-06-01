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

export default async function Home() {
  let products: Product[] = [];
  let errorMsg = "";

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error();
    products = await res.json();
  } catch (err) {
    errorMsg = "No se pudo conectar con el servidor del Minimarket. Asegúrate de que el backend esté encendido.";
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-green-700">🛒 Minimarket Luz Divina</h1>
        <div className="flex flex-col items-center gap-3 mb-8">
          <p className="text-center text-gray-500">Panel de Control e Inventario de Abarrotes</p>
          <a href="/admin" className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">Registrar producto</a>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center mb-6">
            {errorMsg}
          </div>
        )}

        <section>
          {products.length === 0 && !errorMsg ? (
            <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-lg">No hay productos registrados en el inventario.</p>
              <p className="text-gray-400 text-sm mt-1">
                Si eres administrador, registra nuevos productos en <strong>/admin</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100 transition duration-200 hover:scale-[1.02] hover:shadow-lg">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-44 object-cover rounded-lg bg-gray-100"
                  />
                  <h2 className="text-lg font-bold mt-4 text-gray-800">{product.name}</h2>
                  <p className="text-gray-500 text-xs mt-1 h-10 overflow-hidden">{product.description}</p>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xl font-black text-green-600">S/. {Number(product.price).toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Stock: {product.stock} unids
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
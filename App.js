import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Html5QrcodeScanner } from "html5-qrcode";
import { jsPDF } from "jspdf";
import { Package, ShoppingCart, Barcode, FileText, Plus, Trash2 } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('inventory');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
  }

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render((decodedText) => {
      const product = products.find(p => p.barcode === decodedText);
      if (product) {
        addToCart(product);
        scanner.clear();
        setView('checkout');
      }
    });
  };

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Math.random() }]);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("SHOP RECEIPT", 70, 20);
    let y = 60;
    let total = 0;
    cart.forEach((item) => {
      doc.text(`${item.name} - $${item.price}`, 20, y);
      y += 10;
      total += parseFloat(item.price);
    });
    doc.text(`TOTAL: $${total.toFixed(2)}`, 150, y + 10);
    doc.save("receipt.pdf");
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      <nav className="w-full md:w-64 bg-indigo-900 text-white p-6 space-y-6">
        <h1 className="text-2xl font-bold border-b border-indigo-700 pb-4">Shop Admin</h1>
        <button onClick={() => setView('inventory')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded text-left"><Package /> Inventory</button>
        <button onClick={() => {setView('scanner'); setTimeout(startScanner, 100)}} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded text-left"><Barcode /> Scan Item</button>
        <button onClick={() => setView('checkout')} className="flex items-center gap-3 w-full p-3 hover:bg-indigo-800 rounded text-left"><ShoppingCart /> Checkout ({cart.length})</button>
      </nav>

      <main className="flex-1 p-10">
        {view === 'inventory' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Current Stock</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length === 0 ? <p className="text-gray-500">No products found. Add some in Supabase!</p> : 
                products.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <p className="text-indigo-600 font-bold text-xl">${p.price}</p>
                  <p className="text-gray-500 text-sm">Stock: {p.stock}</p>
                  <button onClick={() => addToCart(p)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Add to Cart</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'scanner' && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Scan Barcode</h2>
            <div id="reader" className="w-full max-w-md bg-white p-4 shadow-lg rounded-xl overflow-hidden"></div>
          </div>
        )}

        {view === 'checkout' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Your Cart</h2>
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between py-3 border-b">
                <span>{item.name}</span>
                <span className="font-bold">${item.price}</span>
              </div>
            ))}
            <div className="mt-6 flex justify-between text-xl font-bold text-indigo-900">
              <span>Total</span>
              <span>${cart.reduce((sum, i) => sum + parseFloat(i.price), 0).toFixed(2)}</span>
            </div>
            <button onClick={generatePDF} className="mt-8 w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700">Print Invoice</button>
          </div>
        )}
      </main>
    </div>
  );
}

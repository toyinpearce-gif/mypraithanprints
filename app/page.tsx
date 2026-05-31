"use client";

import React, { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  tag: string;
  art?: string;
  sizes?: string[];
  colors?: string[];
  active?: boolean;
};

type CartItem = Product & {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
};

const starterProducts: Product[] = [
  { id: 1, name: "Signature Custom T-Shirt", category: "Shirts", price: 28.99, description: "Premium custom shirt for family, faith, business, and event designs.", tag: "Best Seller", sizes: ["S", "M", "L", "XL", "2XL"], colors: ["White", "Black", "Green", "Navy"], active: true },
  { id: 2, name: "Personalized Ceramic Mug", category: "Mugs", price: 16.99, description: "Bright printed mugs for photos, names, messages, and gift ideas.", tag: "Gift Ready", sizes: ["11 oz", "15 oz"], colors: ["White", "Black Rim", "Green Rim"], active: true },
  { id: 3, name: "Custom Printed Cap", category: "Caps", price: 24.99, description: "Stylish caps with your brand, phrase, logo, or personal message.", tag: "New", sizes: ["Adjustable"], colors: ["Black", "White", "Green", "Tan"], active: true },
  { id: 4, name: "Printed Tumbler Cup", category: "Tumblers", price: 32.5, description: "Insulated tumblers with wraparound custom designs.", tag: "Popular", sizes: ["20 oz", "30 oz"], colors: ["White", "Silver", "Green"], active: true }
];

const categories = ["All", "Shirts", "Mugs", "Caps", "Tumblers"];
const CART_KEY = "praithan-cart-v5-2";

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-xl font-black text-white">P</div>
      <div>
        <p className="text-2xl font-black">Prai<span className="text-emerald-700">Than</span></p>
        <p className="-mt-1 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Print The Story</p>
      </div>
    </div>
  );
}

function ProductArt({ name }: { name: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-green-100">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-950 to-emerald-700 text-3xl font-black text-white shadow-xl">
        {name.charAt(0)}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(starterProducts);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");
  const [checkout, setCheckout] = useState({ customerName: "", email: "", phone: "", address: "" });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products) && data.products.length > 0) setProducts(data.products);
      })
      .catch(() => setProducts(starterProducts));

    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const filtered = useMemo(() => products.filter((p) => {
    const matchesCategory = category === "All" || p.category === category;
    const matchesSearch = `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(query.toLowerCase());
    return (p.active ?? true) && matchesCategory && matchesSearch;
  }), [products, category, query]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const shipping = subtotal > 75 || subtotal === 0 ? 0 : 7.99;
  const total = subtotal + shipping;

  const addToCart = (product: Product) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, {
        ...product,
        quantity: 1,
        selectedSize: product.sizes?.[0] || "Standard",
        selectedColor: product.colors?.[0] || "Custom"
      }];
    });
    setCartOpen(true);
  };

  const payWithStripe = async () => {
    if (cart.length === 0) return;
    setPaying(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart })
    });
    const result = await response.json();
    setPaying(false);

    if (!response.ok) {
      alert(result.error || "Stripe checkout is not configured yet.");
      return;
    }

    if (result.url) window.location.href = result.url;
  };

  const placeManualOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...checkout, items: cart, subtotal, shipping, total })
    });
    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Order failed.");
      return;
    }

    setOrderSuccess(result.order?.id || "Order received");
    setCart([]);
    setCartOpen(false);
    setCheckoutOpen(false);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-emerald-800 px-4 py-2 text-sm font-bold text-white">
        <div className="mx-auto flex max-w-7xl justify-between">
          <span>Free shipping on orders over $75</span>
          <span className="hidden sm:inline">Support: support@praithanprints.com</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <a href="/login" className="hidden rounded-2xl border px-4 py-3 text-sm font-bold text-emerald-800 sm:block">Admin Login</a>
            <button onClick={() => setCartOpen(true)} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">Cart ({cartCount})</button>
          </div>
        </div>
      </header>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">PraiThan • Print The Story</p>
            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">Custom prints made for real business systems.</h1>
            <p className="mt-6 max-w-xl text-slate-700">This version adds a visible Stripe payment button inside the cart while keeping manual orders as a backup.</p>
            <a href="#shop" className="mt-8 inline-flex rounded-2xl bg-emerald-700 px-7 py-4 font-bold text-white">Shop Collection</a>
          </div>
          <div className="grid grid-cols-2 gap-4 rounded-[2rem] bg-slate-50 p-4 shadow-xl">
            {starterProducts.map((p) => <ProductArt key={p.id} name={p.name} />)}
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Shop</p>
            <h2 className="mt-3 text-3xl font-black">Choose your product.</h2>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products..." className="rounded-2xl border bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-100 lg:w-96" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-2xl px-5 py-3 text-sm font-bold ${category === c ? "bg-emerald-700 text-white" : "bg-white text-slate-700 shadow-sm"}`}>{c}</button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-[2rem] bg-white p-3 shadow-sm">
              <ProductArt name={p.name} />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{p.tag}</span>
                  <strong>${Number(p.price).toFixed(2)}</strong>
                </div>
                <h3 className="mt-4 text-lg font-black">{p.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{p.description}</p>
                <button onClick={() => addToCart(p)} className="mt-5 w-full rounded-2xl bg-emerald-700 px-4 py-3 font-bold text-white">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <Logo />
          <p className="mt-5 text-slate-300">PraiThan — Print The Story.</p>
        </div>
      </footer>

      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 p-4" onClick={() => setCartOpen(false)}>
          <aside className="ml-auto flex h-full max-w-md flex-col rounded-[2rem] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-xl font-black">Shopping Cart</h3>
                <p className="text-sm text-slate-500">Stripe payment is now available here.</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black">Close</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-8 text-center">
                  <p className="text-lg font-black">Your cart is empty.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="rounded-3xl border p-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-black">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.selectedSize} • {item.selectedColor}</p>
                          <p className="mt-2 font-bold">${Number(item.price).toFixed(2)}</p>
                          <p className="text-sm">Qty: {item.quantity}</p>
                        </div>
                        <button onClick={() => setCart(cart.filter((_, i) => i !== index))} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t p-5">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
                <div className="flex justify-between"><span>Shipping</span><strong>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</strong></div>
                <div className="flex justify-between text-lg"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
              </div>

              <button disabled={cart.length === 0 || paying} onClick={payWithStripe} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white disabled:opacity-50">
                {paying ? "Opening Stripe..." : "Pay with Stripe"}
              </button>

              <button disabled={cart.length === 0} onClick={() => setCheckoutOpen(true)} className="mt-3 w-full rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white disabled:opacity-50">
                Place Manual Order
              </button>
            </div>
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/60 p-4" onClick={() => setCheckoutOpen(false)}>
          <form onSubmit={placeManualOrder} className="mx-auto my-10 max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Manual Order</h2>
                <p className="text-sm text-slate-500">Stores order in Supabase without card payment.</p>
              </div>
              <button type="button" onClick={() => setCheckoutOpen(false)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black">Close</button>
            </div>

            <div className="mt-6 grid gap-4">
              <input required value={checkout.customerName} onChange={(e) => setCheckout({ ...checkout, customerName: e.target.value })} placeholder="Full name" className="rounded-2xl border px-4 py-3" />
              <input required type="email" value={checkout.email} onChange={(e) => setCheckout({ ...checkout, email: e.target.value })} placeholder="Email address" className="rounded-2xl border px-4 py-3" />
              <input required value={checkout.phone} onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })} placeholder="Phone number" className="rounded-2xl border px-4 py-3" />
              <textarea required value={checkout.address} onChange={(e) => setCheckout({ ...checkout, address: e.target.value })} placeholder="Shipping address" className="min-h-24 rounded-2xl border px-4 py-3" />
            </div>

            <button type="submit" className="mt-6 w-full rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white">Place Manual Order</button>
          </form>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 z-[70] bg-slate-950/60 p-4" onClick={() => setOrderSuccess("")}>
          <div className="mx-auto mt-20 max-w-lg rounded-[2rem] bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black">Order Received</h2>
            <p className="mt-3 text-slate-600">Order reference:</p>
            <p className="mt-4 rounded-2xl bg-emerald-50 p-4 font-black text-emerald-700">{orderSuccess}</p>
            <button onClick={() => setOrderSuccess("")} className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

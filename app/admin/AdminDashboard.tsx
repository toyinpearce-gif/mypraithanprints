"use client";

import React, { useEffect, useMemo, useState } from "react";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
};

type Order = {
  id: string;
  customer_name: string;
  email: string;
  phone?: string;
  address: string;
  items: OrderItem[];
  subtotal?: number;
  shipping?: number;
  total: number;
  status: string;
  created_at?: string;
};

const statusOptions = [
  "Pending",
  "Order Received",
  "Processing",
  "Ready for Pickup",
  "Shipped",
  "Completed",
  "Cancelled"
];

function formatDate(value?: string) {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mode, setMode] = useState("loading");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.orders || []);
      setMode(data.mode || "unknown");
    } catch {
      setMode("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const haystack = `${order.id} ${order.customer_name} ${order.email} ${order.phone || ""} ${order.address}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || order.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pending = orders.filter((order) => ["Pending", "Order Received"].includes(order.status)).length;
    const shipped = orders.filter((order) => order.status === "Shipped").length;
    return { totalRevenue, pending, shipped };
  }, [orders]);

  const updateStatus = async (order: Order, status: string) => {
    const oldOrders = orders;
    setOrders((current) =>
      current.map((item) => (item.id === order.id ? { ...item, status } : item))
    );
    setSelectedOrder((current) =>
      current && current.id === order.id ? { ...current, status } : current
    );

    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      setOrders(oldOrders);
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Failed to update order status.");
      return;
    }

    const data = await res.json();
    if (data.order) {
      setOrders((current) => current.map((item) => item.id === data.order.id ? data.order : item));
      setSelectedOrder(data.order);
    }
  };

  const logout = async () => {
    await fetch("/api/admin-logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-300">PraiThan Admin</p>
              <h1 className="mt-2 text-3xl font-black">Protected Order Dashboard</h1>
              <p className="mt-2 text-slate-300">Search and manage Supabase orders. Mode: {mode}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="/" className="rounded-2xl bg-white px-5 py-3 font-black text-slate-950">Back to Store</a>
              <button onClick={loadOrders} className="rounded-2xl bg-emerald-700 px-5 py-3 font-black text-white">
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <button onClick={logout} className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white">
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Total Orders</p>
            <p className="mt-2 text-3xl font-black">{orders.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Revenue</p>
            <p className="mt-2 text-3xl font-black">${metrics.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Pending</p>
            <p className="mt-2 text-3xl font-black">{metrics.pending}</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">Shipped</p>
            <p className="mt-2 text-3xl font-black">{metrics.shipped}</p>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by order ID, customer, email, phone, or address"
              className="flex-1 rounded-2xl border px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-100"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border px-4 py-3"
            >
              <option>All</option>
              {statusOptions.map((status) => <option key={status}>{status}</option>)}
            </select>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">Order</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">No matching orders found.</td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-4 font-black">{order.id}</td>
                    <td>
                      <p className="font-bold">{order.customer_name}</p>
                      <p className="text-xs text-slate-500">{order.address}</p>
                    </td>
                    <td>
                      <p>{order.email}</p>
                      <p className="text-xs text-slate-500">{order.phone || "No phone"}</p>
                    </td>
                    <td className="font-black">${Number(order.total || 0).toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status || "Pending"}
                        onChange={(event) => updateStatus(order, event.target.value)}
                        className="rounded-xl border px-3 py-2"
                      >
                        {statusOptions.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <button onClick={() => setSelectedOrder(order)} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
            <div className="mx-auto my-10 max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">Order Details</p>
                  <h2 className="mt-2 text-2xl font-black">{selectedOrder.id}</h2>
                  <p className="mt-1 text-slate-500">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black">Close</button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-black">Customer</h3>
                  <p className="mt-3 font-bold">{selectedOrder.customer_name}</p>
                  <p>{selectedOrder.email}</p>
                  <p>{selectedOrder.phone || "No phone"}</p>
                  <p className="mt-3 text-sm text-slate-600">{selectedOrder.address}</p>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <h3 className="font-black">Fulfillment</h3>
                  <select
                    value={selectedOrder.status || "Pending"}
                    onChange={(event) => updateStatus(selectedOrder, event.target.value)}
                    className="mt-3 w-full rounded-2xl border px-4 py-3"
                  >
                    {statusOptions.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                <h3 className="font-black">Items</h3>
                <div className="mt-4 grid gap-3">
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="rounded-2xl bg-white p-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-black">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.selectedSize || "Standard"} • {item.selectedColor || "Custom"}</p>
                        </div>
                        <p className="font-black">Qty {item.quantity} × ${Number(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-emerald-50 p-5">
                <div className="flex justify-between"><span>Subtotal</span><strong>${Number(selectedOrder.subtotal || 0).toFixed(2)}</strong></div>
                <div className="mt-2 flex justify-between"><span>Shipping</span><strong>${Number(selectedOrder.shipping || 0).toFixed(2)}</strong></div>
                <div className="mt-2 flex justify-between text-xl"><span>Total</span><strong>${Number(selectedOrder.total || 0).toFixed(2)}</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

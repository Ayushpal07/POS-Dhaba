import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export default function usePOSData() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('pos');
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [business, setBusiness] = useState(null);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(null);
  const [method, setMethod] = useState('CASH');
  const [modal, setModal] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const admin = user?.role === 'ADMIN';
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart]);
  const active = selected && orders.find(order => order.table === selected.id && ['OPEN', 'BILL_REQUESTED'].includes(order.status));

  async function load() {
    try {
      const base = await Promise.all([
        api('/api/auth/me/'), api('/api/tables/'), api('/api/menu-items/'), api('/api/orders/'),
      ]);
      setUser(base[0]); setTables(base[1]); setMenu(base[2]); setOrders(base[3]);
      if (base[0]?.role === 'ADMIN') {
        const adminData = await Promise.all([
          api('/api/categories/'), api('/api/bills/?ordering=-issued_at'), api('/api/payments/'),
          api('/api/users/'), api('/api/businesses/'),
        ]);
        setCategories(adminData[0]); setBills(adminData[1]); setPayments(adminData[2]); setUsers(adminData[3]); setBusiness(adminData[4][0] || null);
      }
    } catch (error) {
      localStorage.removeItem('access_token');
      setUser(null);
      setMsg(error.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { if (localStorage.getItem('access_token')) load(); else setLoading(false); }, []);

  const add = item => setCart(current => {
    const existing = current.find(x => x.id === item.id);
    return existing ? current.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x) : [...current, { ...item, quantity: 1 }];
  });
  const qty = (id, delta) => setCart(current => current.map(item => item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter(item => item.quantity));

  async function post(path, body, success) { try { await api(path, { method: 'POST', body: JSON.stringify(body) }); setModal(null); setMsg(success); await load(); } catch (error) { setMsg(error.message); } }
  async function patch(path, body, success) { try { await api(path, { method: 'PATCH', body: JSON.stringify(body) }); setModal(null); setMsg(success); await load(); } catch (error) { setMsg(error.message); } }
  async function del(path, success) { if (!window.confirm('Delete this record?')) return; try { await api(path, { method: 'DELETE' }); setMsg(success); await load(); } catch (error) { setMsg(error.message); } }

  async function send() {
    if (!selected || !cart.length) return;
    try {
      const result = active
        ? await api(`/api/orders/${active.id}/add_round/`, { method: 'POST', body: JSON.stringify({ items: cart.map(item => ({ menu_item: item.id, quantity: item.quantity })) }) })
        : await api('/api/orders/', { method: 'POST', body: JSON.stringify({ table: selected.id, items: cart.map(item => ({ menu_item: item.id, quantity: item.quantity })) }) });
      setCart([]); setMsg(active ? 'New round sent.' : `Order #${result.id} sent.`); await load();
    } catch (error) { setMsg(error.message); }
  }

  async function requestBill() {
    if (!active) return;
    try { setBill(await api(`/api/orders/${active.id}/request_bill/`, { method: 'POST', body: '{}' })); await load(); }
    catch (error) { setMsg(error.message); }
  }

  async function pay() {
    try {
      await api('/api/payments/', { method: 'POST', body: JSON.stringify({ bill: bill.id, amount: bill.total, method }) });
      setBill(null); setSelected(null); setMsg('Payment completed. Table is available.'); await load();
    } catch (error) { setMsg(error.message); }
  }

  function logout() { localStorage.clear(); setUser(null); setSelected(null); setCart([]); }

  return { user, setUser, admin, page, setPage, tables, menu, categories, orders, bills, payments, users, business, selected, setSelected, cart, setCart, bill, setBill, method, setMethod, modal, setModal, msg, setMsg, loading, subtotal, active, add, qty, post, patch, del, send, requestBill, pay, load, logout };
}

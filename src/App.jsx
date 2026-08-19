import { useEffect, useMemo, useState } from 'react';
import { api, login } from './services/api';

const money = (value) => `₹${Number(value || 0).toFixed(2)}`;

function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { const data = await login(username, password); onLogin(data.user); }
    catch { setError('Login failed. Run the backend seed command first.'); }
    finally { setBusy(false); }
  }

  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <div className="brand"><span className="brand-mark">PD</span><div><h1>POS Dhaba</h1><p>Restaurant point of sale</p></div></div>
    <label>Username<input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" /></label>
    <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
    {error && <div className="error">{error}</div>}
    <button className="primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    <small>Demo: admin / admin123</small>
  </form></main>;
}

function App() {
  const [user, setUser] = useState(null);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bill, setBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart]);

  async function loadData() {
    setLoading(true);
    try {
      const [me, tableData, menuData, orderData] = await Promise.all([
        api('/api/auth/me/'), api('/api/tables/'), api('/api/menu-items/'), api('/api/orders/')
      ]);
      setUser(me); setTables(tableData); setMenu(menuData); setOrders(orderData);
    } catch { localStorage.removeItem('access_token'); setUser(null); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (localStorage.getItem('access_token')) loadData(); else setLoading(false); }, []);

  function addItem(item) {
    setCart(current => {
      const existing = current.find(x => x.id === item.id);
      return existing ? current.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x) : [...current, { ...item, quantity: 1 }];
    });
  }

  async function sendOrder() {
    if (!selectedTable || !cart.length) return;
    try {
      const order = await api('/api/orders/', { method: 'POST', body: JSON.stringify({ table: selectedTable.id, items: cart.map(x => ({ menu_item: x.id, quantity: x.quantity })) }) });
      setCart([]); setMessage(`Order #${order.id} sent to Table ${selectedTable.number}`); await loadData();
    } catch (e) { setMessage(e.message); }
  }

  async function addRound() {
    const active = orders.find(o => o.table === selectedTable?.id && ['OPEN', 'DRAFT'].includes(o.status));
    if (!active || !cart.length) return;
    try { await api(`/api/orders/${active.id}/add_round/`, { method: 'POST', body: JSON.stringify({ items: cart.map(x => ({ menu_item: x.id, quantity: x.quantity })) }) }); setCart([]); setMessage('New round added.'); await loadData(); }
    catch (e) { setMessage(e.message); }
  }

  async function requestBill() {
    const active = orders.find(o => o.table === selectedTable?.id && ['OPEN', 'BILL_REQUESTED'].includes(o.status));
    if (!active) return;
    try { const data = await api(`/api/orders/${active.id}/request_bill/`, { method: 'POST', body: JSON.stringify({}) }); setBill(data); await loadData(); }
    catch (e) { setMessage(e.message); }
  }

  async function payBill() {
    if (!bill) return;
    try { await api('/api/payments/', { method: 'POST', body: JSON.stringify({ bill: bill.id, amount: bill.total, method: paymentMethod }) }); setBill(null); setSelectedTable(null); setMessage('Payment completed. Table is available again.'); await loadData(); }
    catch (e) { setMessage(e.message); }
  }

  function logout() { localStorage.clear(); setUser(null); }
  if (!user && !loading) return <Login onLogin={u => { setUser(u); loadData(); }} />;
  if (loading) return <main className="loading">Loading POS Dhaba…</main>;

  const activeOrder = selectedTable && orders.find(o => o.table === selectedTable.id && ['OPEN', 'BILL_REQUESTED'].includes(o.status));

  return <div className="pos-shell">
    <header className="topbar"><div className="brand compact"><span className="brand-mark">PD</span><strong>POS Dhaba</strong></div><div className="userbox"><span>{user.first_name || user.username} · {user.role}</span><button className="ghost" onClick={logout}>Logout</button></div></header>
    {message && <div className="toast" onClick={() => setMessage('')}>{message}</div>}
    <main className="workspace">
      <section className="content">
        <div className="page-head"><div><h2>Tables</h2><p>Select a table to start or continue an order.</p></div><span className="date">Today</span></div>
        <div className="table-grid">{tables.map(table => <button key={table.id} className={`table-card ${table.status.toLowerCase()}`} onClick={() => setSelectedTable(table)}><div className="table-icon">{table.number}</div><strong>{table.name || `Table ${table.number}`}</strong><span>{table.status.replace('_', ' ')}</span><small>{table.capacity} seats</small></button>)}</div>
        <div className="page-head menu-head"><div><h2>Menu</h2><p>Add items to the current table.</p></div></div>
        <div className="menu-grid">{menu.map(item => <button key={item.id} className="menu-card" onClick={() => addItem(item)}><div><span className="category">{item.category_name || 'Menu'}</span><h3>{item.name}</h3><p>{item.description || 'Freshly prepared'}</p></div><strong>{money(item.price)}</strong></button>)}</div>
      </section>
      <aside className="order-panel"><div className="order-head"><div><span className="eyebrow">CURRENT TABLE</span><h2>{selectedTable ? `Table ${selectedTable.number}` : 'Select a table'}</h2></div>{selectedTable && <span className={`status ${selectedTable.status.toLowerCase()}`}>{selectedTable.status.replace('_', ' ')}</span>}</div>
        {selectedTable && <div className="round-banner">{activeOrder ? `Open order #${activeOrder.id} · ${activeOrder.rounds?.length || 1} round(s)` : 'New order'}</div>}
        <div className="cart">{cart.length ? cart.map(item => <div className="cart-row" key={item.id}><div><strong>{item.name}</strong><small>{money(item.price)} × {item.quantity}</small></div><strong>{money(Number(item.price) * item.quantity)}</strong></div>) : <div className="empty">No items yet.<br/>Choose a menu item above.</div>}</div>
        <div className="totals"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Tax</span><strong>₹0.00</strong></div><div className="grand"><span>Total</span><strong>{money(subtotal)}</strong></div></div>
        <div className="actions"><button className="primary full" disabled={!selectedTable || !cart.length} onClick={activeOrder ? addRound : sendOrder}>{activeOrder ? 'Send New Round' : 'Send Order'}</button><button className="secondary full" disabled={!activeOrder || activeOrder.status === 'BILL_REQUESTED'} onClick={requestBill}>Request Bill</button></div>
      </aside>
    </main>
    {bill && <div className="modal-backdrop"><div className="modal"><h2>Bill #{bill.id}</h2><div className="bill-total">{money(bill.total)}</div><label>Payment method<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option></select></label><button className="primary full" onClick={payBill}>Complete Payment</button><button className="ghost full" onClick={() => setBill(null)}>Close</button></div></div>}
  </div>;
}

export default App;

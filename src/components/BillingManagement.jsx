import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const money = value => `₹${Number(value || 0).toFixed(2)}`;
const dt = value => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const statusLabel = value => String(value || '').replaceAll('_', ' ');

function Status({ value }) {
  return <span className={`status ${String(value || '').toLowerCase()}`}>{statusLabel(value)}</span>;
}

export default function BillingManagement({ orders = [], setMsg, onRefresh }) {
  const [bills, setBills] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [range, setRange] = useState('today');
  const [loading, setLoading] = useState(false);

  const dates = useMemo(() => {
    const now = new Date();
    const iso = date => date.toISOString().slice(0, 10);
    if (range === 'all') return { date_from: '', date_to: '' };
    if (range === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const day = iso(yesterday);
      return { date_from: day, date_to: day };
    }
    const today = iso(now);
    return { date_from: today, date_to: today };
  }, [range]);

  async function loadBills() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      if (dates.date_from) params.set('date_from', dates.date_from);
      if (dates.date_to) params.set('date_to', dates.date_to);
      const data = await api(`/api/bills/?${params.toString()}`);
      setBills(data);
    } catch (error) {
      setMsg(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBills(); }, [status, range]);

  async function refresh() {
    await loadBills();
    if (onRefresh) await onRefresh();
  }

  async function updateOrder(orderId, newStatus) {
    try {
      await api(`/api/orders/${orderId}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });
      setSelected(null);
      setMsg(`Order #${orderId} marked ${statusLabel(newStatus).toLowerCase()}.`);
      await refresh();
    } catch (error) {
      setMsg(error.message);
    }
  }

  const totals = {
    bills: bills.length,
    paid: bills.filter(b => b.status === 'PAID').length,
    issued: bills.filter(b => b.status === 'ISSUED').length,
    cancelled: bills.filter(b => b.status === 'CANCELLED').length,
    value: bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0),
  };

  const selectedOrder = selected ? orders.find(order => order.id === selected.order) : null;

  return <section className="page">
    <div className="head">
      <div>
        <h2>Billing Management</h2>
        <p>Today's bills, billing history and complete order sessions.</p>
      </div>
      <button className="btn secondary" onClick={refresh} disabled={loading}>{loading ? 'Refreshing…' : '↻ Refresh'}</button>
    </div>

    <div className="stats">
      <div className="stat"><small>Bills</small><strong>{totals.bills}</strong><span>Selected period</span></div>
      <div className="stat"><small>Paid</small><strong>{totals.paid}</strong><span>Completed payments</span></div>
      <div className="stat"><small>Pending</small><strong>{totals.issued}</strong><span>Awaiting payment</span></div>
      <div className="stat"><small>Value</small><strong>{money(totals.value)}</strong><span>Gross bill value</span></div>
    </div>

    <div className="panel billing-toolbar">
      <input value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => event.key === 'Enter' && loadBills()} placeholder="Search Bill #, Order # or Table #" />
      <select value={range} onChange={event => setRange(event.target.value)}>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="all">All history</option>
      </select>
      <select value={status} onChange={event => setStatus(event.target.value)}>
        <option value="">All statuses</option>
        <option value="PAID">Paid</option>
        <option value="ISSUED">Issued</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      <button className="btn primary" onClick={loadBills}>Search</button>
    </div>

    <div className="panel table-wrap">
      <table>
        <thead><tr><th>Bill</th><th>Order</th><th>Table</th><th>Total</th><th>Bill Status</th><th>Order Status</th><th>Issued</th></tr></thead>
        <tbody>
          {bills.map(bill => <tr key={bill.id} onClick={() => setSelected(bill)} style={{ cursor: 'pointer' }}>
            <td>#{bill.id}</td>
            <td>#{bill.order}</td>
            <td>Table {bill.table_number}</td>
            <td><b>{money(bill.total)}</b></td>
            <td><Status value={bill.status} /></td>
            <td><Status value={bill.order_status} /></td>
            <td>{dt(bill.issued_at)}</td>
          </tr>)}
        </tbody>
      </table>
      {!loading && !bills.length && <div className="empty"><b>No bills found</b><span>Try another date, status or search term.</span></div>}
    </div>

    {selected && <div className="modal-bg" onMouseDown={() => setSelected(null)}>
      <div className="modal bill-detail" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-head">
          <div><h2>Bill #{selected.id}</h2><small>Order #{selected.order} · Table {selected.table_number}</small></div>
          <button onClick={() => setSelected(null)}>×</button>
        </div>

        <div className="bill-summary">
          <div><span>Bill status</span><Status value={selected.status} /></div>
          <div><span>Order status</span><Status value={selected.order_status} /></div>
          <div><span>Total</span><b>{money(selected.total)}</b></div>
        </div>

        <div className="bill-lines">
          <p>Subtotal <b>{money(selected.subtotal)}</b></p>
          <p>Tax <b>{money(selected.tax)}</b></p>
          <p>Discount <b>-{money(selected.discount)}</b></p>
          <p className="bill-grand">Total <b>{money(selected.total)}</b></p>
        </div>

        <div className="order-history">
          <h3>Complete order history</h3>
          {selectedOrder?.rounds?.map(round => <div className="round-detail" key={round.id}>
            <div><b>Round {round.number}</b><small>{dt(round.sent_at || round.created_at)}</small></div>
            {round.items?.map(item => <div className="history-item" key={item.id}>
              <span>{item.menu_item_name} × {item.quantity}</span>
              <b>{money(item.line_total ?? Number(item.unit_price) * item.quantity)}</b>
            </div>)}
          </div>)}
          {!selectedOrder && <div className="empty"><b>Order details unavailable</b><span>Refresh the order list and open the bill again.</span></div>}
        </div>

        {selectedOrder && !['COMPLETED', 'CANCELLED'].includes(selectedOrder.status) && <div className="status-actions">
          <strong>Order actions</strong>
          <div className="status-buttons">
            <button className="btn secondary" onClick={() => updateOrder(selectedOrder.id, 'OPEN')}>Keep Open</button>
            <button className="btn secondary" onClick={() => updateOrder(selectedOrder.id, 'BILL_REQUESTED')}>Bill Requested</button>
            <button className="btn primary" onClick={() => updateOrder(selectedOrder.id, 'COMPLETED')}>Complete & Free Table</button>
            <button className="btn secondary" onClick={() => updateOrder(selectedOrder.id, 'CANCELLED')}>Cancel & Free Table</button>
          </div>
        </div>}
      </div>
    </div>}
  </section>;
}

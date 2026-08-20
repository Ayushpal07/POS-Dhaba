import { useMemo, useState } from 'react';
import { api } from '../services/api';

const money = value => `₹${Number(value || 0).toFixed(2)}`;
const dt = value => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const label = value => String(value || '').replaceAll('_', ' ');

function Status({ value }) {
  return <span className={`status ${String(value).toLowerCase()}`}>{label(value)}</span>;
}

export default function Billing({ bills, orders, setMsg, onRefresh }) {
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [busy, setBusy] = useState(false);

  const selectedBill = useMemo(() => bills.find(b => b.id === selectedBillId) || null, [bills, selectedBillId]);
  const order = useMemo(() => selectedBill ? orders.find(o => o.id === selectedBill.order) : null, [orders, selectedBill]);
  const effectiveStatus = order?.status === 'CANCELLED' ? 'CANCELLED' : selectedBill?.status;
  const paid = effectiveStatus === 'PAID';
  const cancelled = effectiveStatus === 'CANCELLED';
  const issued = bills.filter(b => b.status === 'ISSUED' && !orders.some(o => o.id === b.order && o.status === 'CANCELLED'));
  const paidBills = bills.filter(b => b.status === 'PAID');
  const gross = bills.reduce((sum, b) => sum + Number(b.total || 0), 0);

  async function closeOrderWithoutPayment() {
    if (!order || busy) return;
    if (!window.confirm(`Close Order #${order.id} and free Table ${order.table_number} without recording payment?`)) return;
    setBusy(true);
    try {
      await api(`/api/orders/${order.id}/status/`, { method: 'POST', body: JSON.stringify({ status: 'COMPLETED' }) });
      setMsg(`Order #${order.id} completed. Table ${order.table_number} is available.`);
      setSelectedBillId(null);
      await onRefresh();
    } catch (error) { setMsg(error.message); } finally { setBusy(false); }
  }

  async function cancelOrder() {
    if (!order || busy) return;
    if (!window.confirm(`Cancel Order #${order.id}? This will free Table ${order.table_number}.`)) return;
    setBusy(true);
    try {
      await api(`/api/orders/${order.id}/status/`, { method: 'POST', body: JSON.stringify({ status: 'CANCELLED' }) });
      setMsg(`Order #${order.id} cancelled. Bill voided and Table ${order.table_number} is available.`);
      setSelectedBillId(null);
      await onRefresh();
    } catch (error) { setMsg(error.message); } finally { setBusy(false); }
  }

  async function collectPayment() {
    if (!selectedBill || paid || cancelled || busy) return;
    setBusy(true);
    try {
      await api('/api/payments/', { method: 'POST', body: JSON.stringify({ bill: selectedBill.id, amount: selectedBill.total, method: paymentMethod }) });
      setMsg(`Payment recorded. Order #${selectedBill.order} completed and table is available.`);
      setSelectedBillId(null);
      await onRefresh();
    } catch (error) { setMsg(error.message); } finally { setBusy(false); }
  }

  return <section className="page">
    <div className="head"><div><h2>Billing</h2><p>Review every bill, inspect the complete table order and close the table when finished.</p></div></div>
    <div className="stats">
      <div className="stat"><small>Bills</small><strong>{bills.length}</strong><span>All generated</span></div>
      <div className="stat"><small>Paid</small><strong>{paidBills.length}</strong><span>Completed</span></div>
      <div className="stat"><small>Awaiting payment</small><strong>{issued.length}</strong><span>Active bills</span></div>
      <div className="stat"><small>Gross value</small><strong>{money(gross)}</strong><span>All bills</span></div>
    </div>
    <div className="panel table-wrap">
      <table><thead><tr><th>Bill</th><th>Table</th><th>Order</th><th>Subtotal</th><th>Total</th><th>Status</th><th>Issued</th></tr></thead>
      <tbody>{bills.map(bill => {
        const billOrder = orders.find(o => o.id === bill.order);
        const status = billOrder?.status === 'CANCELLED' ? 'CANCELLED' : bill.status;
        return <tr key={bill.id} onClick={() => setSelectedBillId(bill.id)} style={{ cursor: 'pointer' }}>
          <td>#{bill.id}</td><td>Table {bill.table_number || '—'}</td><td>#{bill.order}</td><td>{money(bill.subtotal)}</td><td><b>{money(bill.total)}</b></td><td><Status value={status} /></td><td>{dt(bill.issued_at || bill.created_at)}</td>
        </tr>;
      })}</tbody></table>
      {!bills.length && <div className="empty"><b>No bills yet</b><span>Completed or bill-requested orders will appear here.</span></div>}
    </div>

    {selectedBill && <div className="modal-bg" onMouseDown={() => !busy && setSelectedBillId(null)}>
      <div className="modal bill-detail" onMouseDown={event => event.stopPropagation()}>
        <div className="modal-head"><div><h2>Bill #{selectedBill.id}</h2><small>Table {selectedBill.table_number} · Order #{selectedBill.order}</small></div><button onClick={() => setSelectedBillId(null)} disabled={busy}>×</button></div>
        <div className="bill-summary"><div><span>Order status</span><Status value={order?.status} /></div><div><span>Bill status</span><Status value={effectiveStatus} /></div><div><span>Table</span><b>Table {selectedBill.table_number}</b></div></div>
        <div className="bill-history"><div className="panel-head"><div><h3>Complete order history</h3><small>Every round served to this table</small></div></div>
          {order?.rounds?.map(round => <div className="round" key={round.id}><div className="round-head"><b>Round {round.number}</b><small>{dt(round.sent_at || round.created_at)}</small></div>{round.items?.map(item => <div className="order-line" key={item.id}><div><strong>{item.menu_item_name}</strong>{item.notes && <small>{item.notes}</small>}</div><span>{item.quantity} × {money(item.unit_price)}</span><b>{money(item.line_total ?? Number(item.quantity) * Number(item.unit_price))}</b></div>)}</div>)}
          {!order?.rounds?.length && <div className="empty"><b>Order details unavailable</b><span>Refresh and open the bill again.</span></div>}
        </div>
        <div className="bill-lines"><p>Subtotal <b>{money(selectedBill.subtotal)}</b></p><p>Tax <b>{money(selectedBill.tax)}</b></p><p>Discount <b>-{money(selectedBill.discount)}</b></p><p className="bill-grand">Total <b>{money(selectedBill.total)}</b></p></div>
        {cancelled && <div className="error">This order was cancelled. The bill is void and the table has been released.</div>}
        {!paid && !cancelled && order && <>
          <label>Payment method<select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} disabled={busy}><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option></select></label>
          <button className="btn primary wide" onClick={collectPayment} disabled={busy}>{busy ? 'Processing…' : `Collect ${money(selectedBill.total)} & Free Table`}</button>
          <button className="btn secondary wide" onClick={closeOrderWithoutPayment} disabled={busy}>Complete & Free Table Without Payment</button>
          <button className="btn danger-action wide" onClick={cancelOrder} disabled={busy}>Cancel Order & Free Table</button>
        </>}
        {paid && <div className="success-box">Payment completed. This table is already available for the next customer.</div>}
      </div>
    </div>}
  </section>;
}

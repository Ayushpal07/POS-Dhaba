import { Empty, Head, Stat, Status, dt, money } from './common';

export default function Dashboard({ tables, orders, payments, menu, users, setPage }) {
  const revenue = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.amount), 0);
  return <section className="page"><Head title="Good day, admin" sub="Here's what's happening in your restaurant." action={<button className="btn primary" onClick={() => setPage('pos')}>Open POS →</button>}/>
    <div className="stats"><Stat label="Revenue" value={money(revenue)} note="Completed payments"/><Stat label="Open orders" value={orders.filter(o => ['OPEN','BILL_REQUESTED'].includes(o.status)).length} note="Live orders"/><Stat label="Tables" value={tables.length} note={`${tables.filter(t => t.status === 'AVAILABLE').length} available`}/><Stat label="Menu items" value={menu.length} note={`${users.length} team members`}/></div>
    <div className="cols"><div className="panel"><div className="panel-head"><div><h3>Recent orders</h3><small>Latest activity</small></div><button onClick={() => setPage('orders')}>View all</button></div>{orders.slice(0,7).map(order => <div className="list-row" key={order.id}><b>#{order.id}</b><div><strong>Table {order.table_number}</strong><small>{order.created_by_name} · {dt(order.created_at)}</small></div><Status value={order.status}/></div>)}{!orders.length && <Empty text="No orders yet"/>}</div>
      <div className="panel"><div className="panel-head"><div><h3>Table overview</h3><small>Live floor status</small></div><button onClick={() => setPage('tables')}>Manage</button></div><div className="mini-tables">{tables.map(table => <div className={`mini ${table.status.toLowerCase()}`} key={table.id}><b>{table.number}</b><span>{table.status === 'AVAILABLE' ? 'Free' : table.status === 'BILL_REQUESTED' ? 'Bill' : 'Busy'}</span></div>)}</div></div></div>
  </section>;
}

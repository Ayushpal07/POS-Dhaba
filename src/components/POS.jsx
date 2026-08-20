import { Empty, Head, Status, money } from './common';

export default function POS({ tables, menu, selected, setSelected, cart, add, qty, subtotal, active, send, requestBill }) {
  return <section className="page pos"><div className="pos-left">
    <Head title="Tables & menu" sub="Select a table, then add items." />
    <h3 className="section">Tables</h3>
    <div className="table-grid">{tables.map(table => <button className={`table ${table.status.toLowerCase()} ${selected?.id === table.id ? 'selected' : ''}`} key={table.id} onClick={() => setSelected(table)}>
      <b>{table.number}</b><strong>{table.name || `Table ${table.number}`}</strong><Status value={table.status}/><small>{table.capacity} seats</small>
    </button>)}</div>
    <h3 className="section">Menu</h3>
    <div className="menu-grid">{menu.map(item => <button className="menu-card" key={item.id} onClick={() => add(item)}>
      <span>{item.category_name || 'Menu'}</span><h3>{item.name}</h3><p>{item.description || 'Freshly prepared'}</p><b>{money(item.price)}</b>
    </button>)}</div>
  </div><aside className="cart">
    <small>CURRENT ORDER</small><h2>{selected ? `Table ${selected.number}` : 'Select a table'}</h2>
    {selected && <div className="order-meta">{active ? `Order #${active.id} · ${active.rounds?.length || 1} round(s)` : 'New order'}</div>}
    <div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><div><b>{item.name}</b><small>{money(item.price)} each</small></div><div className="qty"><button onClick={() => qty(item.id, -1)}>−</button><b>{item.quantity}</b><button onClick={() => qty(item.id, 1)}>+</button></div><b>{money(item.price * item.quantity)}</b></div>)}{!cart.length && <Empty text="Your cart is empty"/>}</div>
    <div className="total"><p>Subtotal <b>{money(subtotal)}</b></p><p>Tax <b>₹0.00</b></p><h3>Total <b>{money(subtotal)}</b></h3></div>
    <button className="btn primary wide" disabled={!selected || !cart.length} onClick={send}>{active ? 'Send new round' : 'Send order'}</button>
    <button className="btn secondary wide" disabled={!active || active.status === 'BILL_REQUESTED'} onClick={requestBill}>Request bill</button>
  </aside></section>;
}

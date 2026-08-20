import { Head } from './common';

export default function Menu({ menu, categories, setModal, del }) {
  return <section className="page"><Head title="Menu management" sub="Manage categories, prices and availability." action={<><button className="btn secondary" onClick={() => setModal({ type: 'category' })}>＋ Category</button> <button className="btn primary" onClick={() => setModal({ type: 'item' })}>＋ Menu item</button></>}/>
    <div className="chips">{categories.map(category => <span key={category.id}>{category.name}</span>)}</div>
    <div className="admin-grid">{menu.map(item => <div className="admin-card" key={item.id}><div className="food">{item.name[0]}</div><div><small>{item.category_name}</small><h3>{item.name}</h3><p>{item.description || 'No description'}</p><b>₹{Number(item.price).toFixed(2)}</b><div><button onClick={() => setModal({ type: 'item', record: item })}>Edit</button><button className="danger" onClick={() => del(`/api/menu-items/${item.id}/`, 'Menu item deleted.')}>Delete</button></div></div></div>)}</div>
  </section>;
}

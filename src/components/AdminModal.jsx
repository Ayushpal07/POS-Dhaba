import { useState } from 'react';
import { Field, Form, Modal } from './common';

export default function AdminModal({ modal, setModal, post, patch, categories }) {
  const record = modal.record;
  if (modal.type === 'table') {
    const [value, setValue] = useState({ number: record?.number || '', name: record?.name || '', capacity: record?.capacity || 4 });
    return <Modal title={record ? 'Edit table' : 'Add table'} onClose={() => setModal(null)}><Form onSubmit={e => { e.preventDefault(); (record ? patch : post)(record ? `/api/tables/${record.id}/` : '/api/tables/', { ...value, number: +value.number, capacity: +value.capacity }, record ? 'Table updated.' : 'Table created.'); }}><Field label="Number"><input type="number" value={value.number} onChange={e => setValue({ ...value, number: e.target.value })} required /></Field><Field label="Name"><input value={value.name} onChange={e => setValue({ ...value, name: e.target.value })} /></Field><Field label="Capacity"><input type="number" value={value.capacity} onChange={e => setValue({ ...value, capacity: e.target.value })} /></Field><button className="btn primary wide">Save</button></Form></Modal>;
  }
  if (modal.type === 'category') {
    const [name, setName] = useState(record?.name || '');
    return <Modal title="Category" onClose={() => setModal(null)}><Form onSubmit={e => { e.preventDefault(); (record ? patch : post)(record ? `/api/categories/${record.id}/` : '/api/categories/', { name }, 'Category saved.'); }}><Field label="Name"><input value={name} onChange={e => setName(e.target.value)} required /></Field><button className="btn primary wide">Save category</button></Form></Modal>;
  }
  if (modal.type === 'item') {
    const [value, setValue] = useState({ category: record?.category || '', name: record?.name || '', description: record?.description || '', price: record?.price || '', is_available: record?.is_available ?? true });
    return <Modal title="Menu item" onClose={() => setModal(null)}><Form onSubmit={e => { e.preventDefault(); (record ? patch : post)(record ? `/api/menu-items/${record.id}/` : '/api/menu-items/', { ...value, category: +value.category }, 'Menu item saved.'); }}><Field label="Category"><select value={value.category} onChange={e => setValue({ ...value, category: e.target.value })}><option value="">Select category</option>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field><Field label="Name"><input value={value.name} onChange={e => setValue({ ...value, name: e.target.value })} required /></Field><Field label="Price"><input type="number" step="0.01" value={value.price} onChange={e => setValue({ ...value, price: e.target.value })} required /></Field><Field label="Description"><textarea value={value.description} onChange={e => setValue({ ...value, description: e.target.value })}/></Field><button className="btn primary wide">Save item</button></Form></Modal>;
  }
  const [value, setValue] = useState({ username: '', password: '', first_name: '', last_name: '', email: '', role: 'WAITER' });
  return <Modal title="Add user" onClose={() => setModal(null)}><Form onSubmit={e => { e.preventDefault(); post('/api/users/', value, 'User created.'); }}>{[['username','Username','text'],['password','Password','password'],['first_name','First name','text'],['last_name','Last name','text'],['email','Email','email']].map(([key, label, type]) => <Field label={label} key={key}><input type={type} value={value[key]} onChange={e => setValue({ ...value, [key]: e.target.value })} required={key === 'username' || key === 'password'} /></Field>)}<Field label="Role"><select value={value.role} onChange={e => setValue({ ...value, role: e.target.value })}><option>WAITER</option><option>ADMIN</option></select></Field><button className="btn primary wide">Create user</button></Form></Modal>;
}

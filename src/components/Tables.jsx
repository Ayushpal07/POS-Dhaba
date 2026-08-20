import { Head, Status } from './common';

export default function Tables({ tables, setModal, del }) {
  return <section className="page"><Head title="Tables" sub="Configure your restaurant floor." action={<button className="btn primary" onClick={() => setModal({ type: 'table' })}>＋ Add table</button>}/>
    <div className="admin-grid">{tables.map(table => <div className="admin-card" key={table.id}><div className={`big-table ${table.status.toLowerCase()}`}>{table.number}</div><div><h3>{table.name || `Table ${table.number}`}</h3><Status value={table.status}/><p>{table.capacity} seats</p><button onClick={() => setModal({ type: 'table', record: table })}>Edit</button><button className="danger" onClick={() => del(`/api/tables/${table.id}/`, 'Table deleted.')}>Delete</button></div></div>)}</div>
  </section>;
}

import { Head, Status, dt } from './common';

export default function Orders({ orders }) {
  return <section className="page"><Head title="Order management" sub="Track orders and multiple rounds."/><div className="panel table-wrap"><table><thead><tr><th>Order</th><th>Table</th><th>Waiter</th><th>Rounds</th><th>Status</th><th>Created</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td>#{order.id}</td><td>Table {order.table_number}</td><td>{order.created_by_name}</td><td>{order.rounds?.length || 0}</td><td><Status value={order.status}/></td><td>{dt(order.created_at)}</td></tr>)}</tbody></table></div></section>;
}

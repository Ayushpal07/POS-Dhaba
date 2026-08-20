import { Head, Status, dt, money } from './common';

export default function Payments({ payments }) {
  return <section className="page"><Head title="Payment history" sub="Completed transactions."/><div className="panel table-wrap"><table><thead><tr><th>Payment</th><th>Bill</th><th>Method</th><th>Amount</th><th>Status</th><th>Paid at</th></tr></thead><tbody>{payments.map(payment => <tr key={payment.id}><td>#{payment.id}</td><td>#{payment.bill}</td><td>{payment.method}</td><td><b>{money(payment.amount)}</b></td><td><Status value={payment.status}/></td><td>{dt(payment.paid_at)}</td></tr>)}</tbody></table></div></section>;
}

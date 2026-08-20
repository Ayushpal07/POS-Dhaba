import './styles.css';
import { api } from './services/api';
import usePOSData from './hooks/usePOSData';
import Login from './components/Login';
import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Tables from './components/Tables';
import Menu from './components/Menu';
import Orders from './components/Orders';
import BillingManagement from './components/BillingManagement';
import Payments from './components/Payments';
import Users from './components/Users';
import AdminModal from './components/AdminModal';
import { Field, Modal, money } from './components/common';

const NAV_ADMIN = [['dashboard','Dashboard','⌂'],['pos','POS Terminal','▦'],['tables','Tables','□'],['menu','Menu','≡'],['orders','Orders','↔'],['billing','Billing','₹'],['payments','Payments','◈'],['users','Users','♙']];
const NAV_WAITER = [['pos','POS Terminal','▦'],['orders','My Orders','↔']];

export default function App() {
  const state = usePOSData();
  const { user, setUser, admin, page, setPage, bill, setBill, method, setMethod, modal, setModal, loading, msg, setMsg, business, logout, pay, ...props } = state;

  if (!user && !loading) return <Login onLogin={loggedUser => { setUser(loggedUser); state.load(); }} />;
  if (loading) return <main className="loading">Loading POS Dhaba…</main>;

  const nav = admin ? NAV_ADMIN : NAV_WAITER;
  const overlays = <>
    {bill && <Modal title={`Bill #${bill.id}`} onClose={() => setBill(null)}>
      <div className="bill-total">{money(bill.total)}</div>
      <div className="bill-lines"><p>Subtotal <b>{money(bill.subtotal)}</b></p><p>Tax <b>{money(bill.tax)}</b></p><p>Discount <b>-{money(bill.discount)}</b></p></div>
      <Field label="Payment method"><select value={method} onChange={event => setMethod(event.target.value)}><option>CASH</option><option>UPI</option><option>CARD</option></select></Field>
      <button className="btn primary wide" onClick={pay}>Complete payment</button>
    </Modal>}
    {modal && <AdminModal modal={modal} setModal={setModal} post={state.post} patch={state.patch} categories={state.categories} />}
  </>;

  const pages = {
    dashboard: <Dashboard {...props} setPage={setPage} />,
    pos: <POS {...props} />,
    tables: <Tables tables={state.tables} setModal={setModal} del={state.del} />,
    menu: <Menu menu={state.menu} categories={state.categories} setModal={setModal} del={state.del} />,
    orders: <Orders orders={state.orders} />,
    billing: <BillingManagement orders={state.orders} setMsg={setMsg} onRefresh={state.load} />,
    payments: <Payments payments={state.payments} />,
    users: <Users users={state.users} setModal={setModal} del={state.del} />,
  };

  return <AppShell user={user} business={business} page={page} setPage={setPage} nav={nav} onLogout={logout} msg={msg} setMsg={setMsg} overlays={overlays}>{pages[page]}</AppShell>;
}

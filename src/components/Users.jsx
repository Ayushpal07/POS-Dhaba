import { Head } from './common';

export default function Users({ users, setModal, del }) {
  return <section className="page"><Head title="Team & roles" sub="Manage admin and waiter access." action={<button className="btn primary" onClick={() => setModal({ type: 'user' })}>＋ Add user</button>}/><div className="user-grid">{users.map(user => <div className="user-card" key={user.id}><div className="avatar">{(user.first_name || user.username)[0]}</div><div><h3>{user.first_name || user.username}</h3><span>@{user.username}</span><p><b className="role">{user.role}</b> · {user.is_active ? 'Active' : 'Inactive'}</p></div><button className="danger" onClick={() => del(`/api/users/${user.id}/`, 'User deleted.')}>Delete</button></div>)}</div></section>;
}

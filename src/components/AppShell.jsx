export default function AppShell({ user, business, page, setPage, nav, onLogout, msg, setMsg, children, overlays }) {
  return <div className="app">
    <aside>
      <div className="side-brand"><span>PD</span><div><b>POS Dhaba</b><small>Restaurant POS</small></div></div>
      <nav>{nav.map(item => <button className={page === item[0] ? 'active' : ''} onClick={() => setPage(item[0])} key={item[0]}><i>{item[2]}</i>{item[1]}</button>)}</nav>
      <div className="side-user"><div className="avatar">{(user.first_name || user.username)[0].toUpperCase()}</div><div><b>{user.first_name || user.username}</b><small>{user.role}</small></div><button onClick={onLogout}>↪</button></div>
    </aside>
    <main className="main">
      <header><div><small>{business?.name || 'POS DHABA'}</small><h1>{nav.find(item => item[0] === page)?.[1]}</h1></div><span className="online">● Local server connected</span></header>
      {msg && <button className="toast" onClick={() => setMsg('')}>{msg} ×</button>}
      {children}
    </main>
    {overlays}
  </div>;
}

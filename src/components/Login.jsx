import { useState } from 'react';
import { login } from '../services/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const data = await login(username, password); onLogin(data.user); }
    catch (err) { setError(err.message || 'Login failed'); }
    finally { setBusy(false); }
  }

  return <main className="auth"><form onSubmit={submit} className="auth-card">
    <div className="brand"><span>PD</span><div><b>POS Dhaba</b><small>Restaurant management system</small></div></div>
    <div className="auth-copy">
      <label>Username<input value={username} onChange={e => setUsername(e.target.value)} /></label>
      <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <div className="error">{error}</div>}
      <button className="btn primary wide" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <small>Demo: admin / admin123</small>
    </div>
  </form></main>;
}

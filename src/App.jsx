import { useEffect, useState } from 'react';
import { api } from './services/api';

function App() {
  const [health, setHealth] = useState('Checking backend...');

  useEffect(() => {
    api('/api/auth/me/')
      .then(() => setHealth('Backend connected'))
      .catch(() => setHealth('Backend ready — login required'));
  }, []);

  return (
    <main className="app-shell">
      <section className="card">
        <h1>POS Dhaba</h1>
        <p>Restaurant POS frontend</p>
        <span>{health}</span>
      </section>
    </main>
  );
}

export default App;

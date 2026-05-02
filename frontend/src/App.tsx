import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IncidentDetail from './pages/IncidentDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">🚨</div>
            <div>
              <div className="logo-text">Incident Management System</div>
              <div className="logo-sub">Real-time infrastructure monitoring</div>
            </div>
          </div>
          <div className="live">
            <div className="live-dot"></div>
            Live — refreshing every 5s
          </div>
        </header>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/incident/:id" element={<IncidentDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWorkItems } from '../api/client';

export default function Dashboard() {
  const [workItems, setWorkItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await fetchWorkItems();
      setWorkItems(res.data);
    } catch (err) {
      console.error('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const p0 = workItems.filter(i => i.severity === 'P0').length;
  const p1 = workItems.filter(i => i.severity === 'P1').length;
  const totalSignals = workItems.reduce((a, i) => a + (i.signal_count || 0), 0);

  const sevBar = (s: string) => {
    if (s === 'P0') return 'sev-bar sev-p0';
    if (s === 'P1') return 'sev-bar sev-p1';
    return 'sev-bar sev-p2';
  };

  const sevBadge = (s: string) => {
    if (s === 'P0') return 'sev-badge b-p0';
    if (s === 'P1') return 'sev-badge b-p1';
    return 'sev-badge b-p2';
  };

  const statusPill = (s: string) => {
    const map: Record<string, string> = {
      OPEN: 's-open', INVESTIGATING: 's-investigating',
      RESOLVED: 's-resolved', CLOSED: 's-closed'
    };
    return `status-pill ${map[s] || 's-open'}`;
  };

  if (loading) return <div className="loading">Loading incidents...</div>;

  return (
    <div>
      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Total incidents</div>
          <div className="metric-value v-white">{workItems.length}</div>
          <div className="metric-sub">across all components</div>
        </div>
        <div className="metric">
          <div className="metric-label">Critical (P0)</div>
          <div className="metric-value v-p0">{p0}</div>
          <div className="metric-sub">immediate action needed</div>
        </div>
        <div className="metric">
          <div className="metric-label">High (P1)</div>
          <div className="metric-value v-p1">{p1}</div>
          <div className="metric-sub">under investigation</div>
        </div>
        <div className="metric">
          <div className="metric-label">Signals ingested</div>
          <div className="metric-value v-p2">{totalSignals}</div>
          <div className="metric-sub">total raw signals</div>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">Active incidents</span>
        <span className="count-badge">{workItems.length} total</span>
      </div>

      {workItems.length === 0 ? (
        <div className="empty">No incidents found — all systems operational</div>
      ) : (
        workItems.map((item) => (
          <div key={item.id} className="incident" onClick={() => navigate(`/incident/${item.id}`)}>
            <div className={sevBar(item.severity)}></div>
            <div className="inc-main">
              <div className="inc-name">{item.component_id}</div>
              <div className="inc-meta">
                <span>{item.signal_count} signals</span>
                <span>Started {new Date(item.start_time).toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="inc-right">
              <span className={sevBadge(item.severity)}>{item.severity}</span>
              <span className={statusPill(item.status)}>{item.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

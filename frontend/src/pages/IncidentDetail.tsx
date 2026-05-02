import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWorkItem, transitionWorkItem, submitRCA } from '../api/client';

const ROOT_CAUSES = [
  'Database Failure', 'Network Outage', 'Memory Leak',
  'CPU Spike', 'Disk Full', 'Config Error', 'Code Bug', 'External Dependency'
];

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rca, setRca] = useState({
    incident_start: '',
    incident_end: '',
    root_cause_category: '',
    fix_applied: '',
    prevention_steps: ''
  });
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const res = await fetchWorkItem(id!);
      setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleTransition = async () => {
    try {
      const res = await transitionWorkItem(id!);
      setMessage(`✅ Status changed to ${res.data.status}`);
      load();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Transition failed'}`);
    }
  };

  const handleRCA = async () => {
    try {
      const res = await submitRCA(id!, rca);
      setMessage(`✅ RCA submitted! MTTR: ${res.data.mttr_minutes} minutes`);
      load();
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'RCA failed'}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!data) return <div className="loading">Not found</div>;

  const { workItem, signals, rca: existingRca } = data;

  return (
    <div className="detail">
      <button className="back" onClick={() => navigate('/')}>← Back</button>
      <div className="detail-header">
        <h2>{workItem.component_id}</h2>
        <span className="badge">{workItem.severity}</span>
        <span className="badge">{workItem.status}</span>
      </div>
      {message && <div className="message">{message}</div>}
      <div className="detail-grid">
        <div className="detail-card">
          <h3>📊 Work Item Info</h3>
          <p><b>Signals:</b> {workItem.signal_count}</p>
          <p><b>Started:</b> {new Date(workItem.start_time).toLocaleString()}</p>
          {workItem.mttr_minutes && <p><b>MTTR:</b> {workItem.mttr_minutes} minutes</p>}
          {workItem.status !== 'CLOSED' && (
            <button className="btn-primary" onClick={handleTransition}>
              Advance Status →
            </button>
          )}
        </div>
        <div className="detail-card">
          <h3>📡 Raw Signals ({signals.length})</h3>
          <div className="signals-list">
            {signals.slice(0, 10).map((s: any, i: number) => (
              <div key={i} className="signal-item">
                <span>{s.errorType}</span>
                <span>{new Date(s.receivedAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {!existingRca && workItem.status !== 'CLOSED' && (
        <div className="rca-form">
          <h3>📝 Root Cause Analysis</h3>
          <div className="form-grid">
            <label>Incident Start
              <input type="datetime-local" value={rca.incident_start}
                onChange={e => setRca({...rca, incident_start: e.target.value})} />
            </label>
            <label>Incident End
              <input type="datetime-local" value={rca.incident_end}
                onChange={e => setRca({...rca, incident_end: e.target.value})} />
            </label>
            <label>Root Cause Category
              <select value={rca.root_cause_category}
                onChange={e => setRca({...rca, root_cause_category: e.target.value})}>
                <option value="">Select...</option>
                {ROOT_CAUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label>Fix Applied
              <textarea value={rca.fix_applied}
                onChange={e => setRca({...rca, fix_applied: e.target.value})}
                placeholder="Describe what fix was applied..." />
            </label>
            <label>Prevention Steps
              <textarea value={rca.prevention_steps}
                onChange={e => setRca({...rca, prevention_steps: e.target.value})}
                placeholder="How to prevent this in future..." />
            </label>
          </div>
          <button className="btn-primary" onClick={handleRCA}>Submit RCA</button>
        </div>
      )}
      {existingRca && (
        <div className="rca-form">
          <h3>✅ RCA Submitted</h3>
          <p><b>Category:</b> {existingRca.root_cause_category}</p>
          <p><b>Fix:</b> {existingRca.fix_applied}</p>
          <p><b>Prevention:</b> {existingRca.prevention_steps}</p>
        </div>
      )}
    </div>
  );
}

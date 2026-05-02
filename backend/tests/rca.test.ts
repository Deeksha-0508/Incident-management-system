import { getState } from '../src/workflow/states/WorkItemState';
import { getAlertStrategy } from '../src/workflow/strategies/AlertStrategy';

describe('WorkItem State Machine', () => {
  test('OPEN transitions to INVESTIGATING', () => {
    const state = getState('OPEN');
    expect(state.next()).toBe('INVESTIGATING');
  });

  test('INVESTIGATING transitions to RESOLVED', () => {
    const state = getState('INVESTIGATING');
    expect(state.next()).toBe('RESOLVED');
  });

  test('RESOLVED transitions to CLOSED', () => {
    const state = getState('RESOLVED');
    expect(state.next()).toBe('CLOSED');
  });

  test('CLOSED stays CLOSED', () => {
    const state = getState('CLOSED');
    expect(state.next()).toBe('CLOSED');
  });
});

describe('Alert Strategy', () => {
  test('RDBMS gets P0 alert', () => {
    const strategy = getAlertStrategy('RDBMS_PRIMARY');
    expect(strategy.priority()).toBe('P0');
  });

  test('API gets P1 alert', () => {
    const strategy = getAlertStrategy('API_GATEWAY');
    expect(strategy.priority()).toBe('P1');
  });

  test('Cache gets P2 alert', () => {
    const strategy = getAlertStrategy('CACHE_CLUSTER_01');
    expect(strategy.priority()).toBe('P2');
  });
});

describe('RCA Validation', () => {
  test('RCA with all fields is valid', () => {
    const rca = {
      incident_start: '2024-01-01T00:00:00Z',
      incident_end: '2024-01-01T02:00:00Z',
      root_cause_category: 'Database Failure',
      fix_applied: 'Restarted DB',
      prevention_steps: 'Add monitoring'
    };
    const isValid = Object.values(rca).every(v => v !== '' && v !== null);
    expect(isValid).toBe(true);
  });

  test('RCA with missing fields is invalid', () => {
    const rca = {
      incident_start: '2024-01-01T00:00:00Z',
      incident_end: '',
      root_cause_category: '',
      fix_applied: '',
      prevention_steps: ''
    };
    const isValid = Object.values(rca).every(v => v !== '' && v !== null);
    expect(isValid).toBe(false);
  });
});

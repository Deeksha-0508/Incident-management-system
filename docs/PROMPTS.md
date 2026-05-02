# Prompts and Planning Documentation

## Tool Used
Claude (Anthropic) - claude.ai

## Approach
Built incrementally using Claude as a pair programmer.

## Key Prompts Used

1. System Design: Build a mission-critical IMS with Node.js, TypeScript, PostgreSQL, MongoDB, Redis, BullMQ and React

2. Debouncing: 100 signals for same componentId within 10 seconds = one work item

3. State Machine: OPEN to INVESTIGATING to RESOLVED to CLOSED using State design pattern

4. Alert Strategy: P0 for RDBMS, P1 for API/MCP, P2 for Cache using Strategy pattern

5. RCA Validation: Block CLOSED if RCA missing, calculate MTTR automatically

6. Frontend: Modern dark-themed React dashboard with live auto-refresh

## Design Decisions

- BullMQ over direct DB writes: handles burst traffic
- MongoDB for raw signals: flexible schema fast writes
- PostgreSQL for work items: ACID transactions
- Redis for cache: avoid DB query on every UI refresh
- In-memory debounce map: fastest deduplication

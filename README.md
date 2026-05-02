# Incident Management System

A real-time IMS for monitoring distributed infrastructure.

## Tech Stack
- Backend: Node.js + TypeScript
- Queue: BullMQ + Redis
- Database: PostgreSQL + MongoDB
- Cache: Redis
- Frontend: React + Vite

## Quick Start
1. docker compose up -d
2. cd backend and npm run dev
3. cd frontend and npm run dev
4. bash simulate-failure.sh

## Backpressure Handling
- BullMQ buffers all signals instantly
- 10 concurrent workers
- Debouncing: 100 signals = 1 work item
- Rate limiting: 500 req/sec

## Workflow
OPEN -> INVESTIGATING -> RESOLVED -> CLOSED
- CLOSED requires RCA
- MTTR auto-calculated

## Tests
cd backend and npm test

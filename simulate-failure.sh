#!/bin/bash
echo "🚨 Simulating infrastructure failure..."

# RDBMS Failure (P0)
for i in {1..20}; do
curl -s -X POST http://localhost:3000/api/signals \
  -H "Content-Type: application/json" \
  -d '{"componentId":"RDBMS_PRIMARY","errorType":"Connection timeout","severity":"P0","payload":{"db":"postgres","latency":5000}}' > /dev/null
done
echo "✅ Sent 20 RDBMS failure signals"

# Cache Failure (P2)
for i in {1..15}; do
curl -s -X POST http://localhost:3000/api/signals \
  -H "Content-Type: application/json" \
  -d '{"componentId":"CACHE_CLUSTER_01","errorType":"Cache miss spike","severity":"P2","payload":{"missRate":0.95}}' > /dev/null
done
echo "✅ Sent 15 Cache failure signals"

# API Gateway Failure (P1)
for i in {1..10}; do
curl -s -X POST http://localhost:3000/api/signals \
  -H "Content-Type: application/json" \
  -d '{"componentId":"API_GATEWAY","errorType":"5xx errors spike","severity":"P1","payload":{"errorRate":0.45}}' > /dev/null
done
echo "✅ Sent 10 API Gateway failure signals"

# MCP Failure (P1)
for i in {1..10}; do
curl -s -X POST http://localhost:3000/api/signals \
  -H "Content-Type: application/json" \
  -d '{"componentId":"MCP_HOST_01","errorType":"MCP connection lost","severity":"P1","payload":{"host":"mcp-01"}}' > /dev/null
done
echo "✅ Sent 10 MCP failure signals"

echo "🎉 Simulation complete! Check your dashboard."

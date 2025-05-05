#!/bin/bash
# Exit on errors, except where explicitly handled
set -eu

# Health check configuration
HOST=127.0.0.1
PORT=4173
MAX_RETRIES=30
RETRY_INTERVAL=1

# Try up to MAX_RETRIES times (waiting RETRY_INTERVAL seconds between attempts)
for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf --ipv4 "http://${HOST}:${PORT}" >/dev/null; then
    exit 0
  fi
  sleep $RETRY_INTERVAL
done

echo "ERROR: SvelteKit preview did not respond after ${MAX_RETRIES} seconds at ${HOST}:${PORT}"
exit 1
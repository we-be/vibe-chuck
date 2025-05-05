#!/bin/bash
set -eux

# Wait up to 30s for the SvelteKit server to respond
timeout=30
count=0
while ! curl -sf http://localhost:4173; do
  ((count++))
  if [ $count -ge $timeout ]; then
    echo "ERROR: SvelteKit frontend failed to come up"
    exit 1
  fi
  sleep 1
done
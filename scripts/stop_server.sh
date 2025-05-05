#!/bin/bash
set -eux

# Stop any running SvelteKit preview server
if [ -f /opt/vibe-chuck/server.pid ]; then
  kill "$(cat /opt/vibe-chuck/server.pid)" || true
  rm /opt/vibe-chuck/server.pid
fi

# Fallback: kill any lingering preview processes
pkill -f "vite preview" || true
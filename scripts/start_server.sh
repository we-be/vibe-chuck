#!/bin/bash
set -eux

# Start the SvelteKit preview server in the background
cd /opt/vibe-chuck
nohup npm run preview -- --port 4173 > /opt/vibe-chuck/server.log 2>&1 &
# Record the process ID for later shutdown
echo $! > /opt/vibe-chuck/server.pid
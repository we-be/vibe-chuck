#!/bin/bash
set -eux

# Ensure the deployment directory exists and is owned by ec2-user
mkdir -p /opt/vibe-chuck
chown -R ec2-user:ec2-user /opt/vibe-chuck
#!/bin/bash
set -e

# Define project path
PROJECT_PATH="/var/www/pawan-temp-backend"

echo "========================================"
echo "Starting Deployment at $(date)"
echo "========================================"

# Navigate to project directory
cd $PROJECT_PATH
echo "-> Changed directory to $PROJECT_PATH"

# Fix Git Ownership (just in case)
git config --global --add safe.directory $PROJECT_PATH

# Force Reset to avoid conflicts (Crucial for your issue)
echo "-> Resetting git state..."
git fetch origin main
git reset --hard origin/main

# Pull latest changes
echo "-> Pulling latest code..."
git pull origin main

# Install Backend Dependencies
echo "-> Installing Server Dependencies..."
cd server
npm install

# Install Frontend Dependencies (if you are building on server, otherwise skip)
# echo "-> Installing Client Dependencies..."
# cd ../client
# npm install
# npm run build

# Go back to root
cd ..

# Restart Backend
echo "-> Restarting Server..."
pm2 restart pawan-temp-server || pm2 start server/server.js --name pawan-temp-server

echo "========================================"
echo "Deployment Completed Successfully!"
echo "========================================"

#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Start Gunicorn for Flask app in the background
echo "Starting Flask API with Gunicorn..."
# Run Gunicorn from the /app directory, but tell it where the app is (model.app)
# Make sure predict_visitors.py and its model files are found relative to /app/model
gunicorn --workers 2 --bind 0.0.0.0:5000 --chdir /app/model app:app --timeout 120 --log-level info &

# Start Next.js app in the foreground
echo "Starting Next.js application..."
npm start -p 3000

    
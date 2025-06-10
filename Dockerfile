
# Stage 1: Base image with Node.js and Python
FROM node:18-slim AS base
LABEL authors="firebase-studio"

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip curl git && \
    rm -rf /var/lib/apt/lists/*

# Set working directory for the app
WORKDIR /app

# Stage 2: Install Python dependencies
FROM base AS python-deps
WORKDIR /app
# Copy requirements first to leverage Docker cache
COPY ./requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir -r ./requirements.txt
# Copy the entire model directory which includes Python scripts, model files, and data
COPY ./model ./model

# Stage 3: Install Node.js dependencies
FROM base AS builder
WORKDIR /app
COPY ./package.json ./package-lock.json* ./
RUN npm install

# Stage 4: Build Next.js app
COPY . .
# If a Genkit key is needed for other parts of the app (not the Python model)
# ARG NEXT_PUBLIC_GOOGLE_API_KEY
# ENV NEXT_PUBLIC_GOOGLE_API_KEY=${NEXT_PUBLIC_GOOGLE_API_KEY}
RUN npm run build

# Stage 5: Production image
FROM base AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
# ENV NEXT_PUBLIC_GOOGLE_API_KEY=${NEXT_PUBLIC_GOOGLE_API_KEY} # Inherit from build stage if needed
ENV NEXT_PUBLIC_PYTHON_API_URL="http://localhost:5000/predict" # Next.js will call Flask on this URL

# Copy built Next.js app from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts # or next.config.js

# Copy Python app and dependencies from python-deps stage
COPY --from=python-deps /app/model ./model
COPY --from=python-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
# Ensure the Python executable used by gunicorn is findable
# Python was installed to system path by apt-get, so /usr/bin/python3 should work

# Create a startup script
COPY ./start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose Next.js port (default 3000) and Flask port (5000)
EXPOSE 3000
EXPOSE 5000

# Start both services using the script
CMD ["./start.sh"]

    
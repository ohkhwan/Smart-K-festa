# 1. Base Node.js image
FROM node:18-slim AS base

# Set working directory
WORKDIR /app

# Install Python and pip, and other common dependencies
RUN apt-get update && apt-get install -y python3 python3-pip curl build-essential --no-install-recommends && rm -rf /var/lib/apt/lists/*

# --- Python Dependencies ---
# This stage installs Python dependencies using requirements.txt from the project root.
FROM base AS python-deps
WORKDIR /app
COPY ./requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir -r ./requirements.txt

# --- Next.js Dependencies ---
# This stage installs Node.js dependencies.
FROM base AS nextjs-deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
# Choose your package manager. If you use pnpm, adapt the RUN command.
# Using npm:
RUN npm install --frozen-lockfile
# If using pnpm (example):
# RUN curl -fsSL https://get.pnpm.io/install.sh | SHELL=/bin/bash bash -
# RUN /root/.local/share/pnpm/pnpm install --frozen-lockfile

# --- Build Next.js App ---
# This stage builds the Next.js application.
FROM base AS builder
WORKDIR /app
COPY --from=nextjs-deps /app/node_modules ./node_modules
COPY . .
# Ensure PYTHON_EXECUTABLE is available if build scripts need it (usually not for `npm run build`)
# ENV PYTHON_EXECUTABLE=/usr/bin/python3
RUN npm run build

# --- Final Production Image ---
# This stage creates the lean production image.
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Set PYTHON_EXECUTABLE for runtime, so the Next.js app can spawn the Python script.
ENV PYTHON_EXECUTABLE=/usr/bin/python3

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Python dependencies from the python-deps stage.
# The exact path might depend on the Python version and how pip installs them.
# For python3.11 (often in node:18-slim's debian base), it's /usr/local/lib/python3.11/site-packages
COPY --from=python-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copy built Next.js app artifacts
COPY --from=builder /app/public ./public
# Next.js 13+ output structure
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy the model directory containing Python scripts and data
COPY ./model ./model

# Set ownership for the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose port (default Next.js port is 3000)
EXPOSE 3000

# Start Next.js app
# If using pnpm, change npm to pnpm
CMD ["npm", "start", "-p", "3000"]

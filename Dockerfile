# 1. Base Node.js and Python image
FROM node:18-slim AS base

# Set working directory
WORKDIR /app

# Install Python 3.11, pip, and build tools
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python3.11 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# --- Python Dependencies ---
# Install Python dependencies in the virtual environment
FROM base AS python-deps
WORKDIR /app
COPY ./requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# Verify joblib installation
RUN python -c "import joblib; print('joblib version:', joblib.__version__)"

# --- Next.js Dependencies ---
# Install Node.js dependencies
FROM base AS nextjs-deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
# Using npm (change to pnpm if needed)
RUN npm install --frozen-lockfile

# --- Build Next.js App ---
# Build the Next.js application
FROM base AS builder
WORKDIR /app
COPY --from=nextjs-deps /app/node_modules ./node_modules
COPY --from=python-deps /app/venv ./venv
COPY . .
RUN npm run build

# --- Final Production Image ---
# Create the lean production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Set Python executable to the virtual environment
ENV PATH="/app/venv/bin:$PATH"
ENV PYTHON_EXECUTABLE=/app/venv/bin/python

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Python virtual environment
COPY --from=python-deps /app/venv /app/venv

# Copy built Next.js app artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy the model directory containing Python scripts and data
COPY --chown=nextjs:nodejs ./model ./model

# Set ownership for the app directory to the non-root user
RUN chown -R nextjs:nodejs /app

# Switch to the non-root user
USER nextjs

# Expose port (default Next.js port is 3000)
EXPOSE 3000

# Start Next.js app
CMD ["npm", "start", "--", "-p", "3000"]

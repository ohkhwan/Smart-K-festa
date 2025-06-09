
# --- Base Node.js Stage ---
FROM node:18-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init

# --- Dependencies Stage ---
FROM base AS deps
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install --frozen-lockfile

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Final Production Image ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# ENV PYTHON_EXECUTABLE=/usr/bin/python3 # No longer needed if Python script is removed

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
# COPY --from=builder /app/model ./model # No longer needed if Python script and its data are removed

# Set user to non-root
USER node

EXPOSE 3000
ENV PORT=3000 NEXT_TELEMETRY_DISABLED=1

# CMD ["dumb-init", "node", "server.js"]
# The default CMD for Next.js standalone output is usually `node server.js`
# For Turbopack dev, it's different. For production, `npm start` or `node server.js` is common.
# Assuming `npm start` is configured in package.json to run the standalone server:
CMD ["dumb-init", "npm", "start", "-p", "3000"]


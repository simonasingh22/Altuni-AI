# Stage 1: Build environment
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root configurations and workspace definitions
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install build dependencies
RUN npm ci

# Copy all source files
COPY . .

# Run validation checks and builds
RUN npm run lint && npm run build

# Stage 2: Production environment
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy root and workspace package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install only essential production dependencies
RUN npm ci --omit=dev

# Copy compiled frontend client assets and backend server source
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Ensure historical reports data directories exist with correct permissions
RUN mkdir -p data/history

EXPOSE 4000

# Launch backend Express server
CMD ["node", "server/src/server.js"]

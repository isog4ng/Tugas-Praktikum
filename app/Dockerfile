# ===========================
# Stage 1: Build dependencies
# ===========================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (leverage Docker layer cache)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# ===========================
# Stage 2: Production image
# ===========================
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 3000

# Health check for the app container
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"]

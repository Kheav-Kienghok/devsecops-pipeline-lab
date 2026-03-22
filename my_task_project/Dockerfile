# Multi-stage Dockerfile for NestJS app

# --------------------
# 1) Build stage
# --------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Enable pnpm via corepack
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies (only using lockfile for reproducibility)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy project files and build
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN pnpm build

# --------------------
# 2) Runtime stage
# --------------------
FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Enable pnpm in runtime image as well
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy compiled app from builder
COPY --from=builder /app/dist ./dist

# Expose Nest default port
EXPOSE 3000

# Use the production start script
CMD ["pnpm", "start:prod"]

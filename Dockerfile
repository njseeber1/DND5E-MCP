# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Set the entrypoint
ENTRYPOINT ["node", "dist/server.js"]

# Add labels
LABEL org.opencontainers.image.title="D&D 5e MCP Server"
LABEL org.opencontainers.image.description="Model Context Protocol server for D&D 5e API"
LABEL org.opencontainers.image.version="1.0.0"
# -------- STAGE 1: Build the Next.js app --------
FROM node:18-alpine AS builder

# Install required packages for build
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy only necessary files first (for caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the source files
COPY . .

# Build the app
RUN npm run build

# -------- STAGE 2: Run the app with only production deps --------
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built output from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Set environment to production
ENV NODE_ENV=production

# Expose the port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]


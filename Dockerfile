# Multi-stage Build Dockerfile for Azure App Service Deployment

# --- Stage 1: Build the Frontend ---
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Setup the Backend ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY backend/package*.json ./backend/
RUN npm install --prefix backend --only=production

COPY backend/ ./backend/
# Copy the built frontend static assets into the backend public folder for unified hosting
COPY --from=frontend-builder /app/frontend/dist ./backend/public

EXPOSE 8080

CMD ["node", "backend/src/server.js"]

# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .


FROM node:18-alpine
WORKDIR /app

RUN apk add --no-cache curl \
    && addgroup appgroup \
    && adduser -D -G appgroup appuser
COPY --from=builder --chown=appuser:appgroup /app .

USER appuser

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "src/server.js"]

# ---- Stage 1: builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ---- Stage 2: production ----
FROM node:20-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

RUN chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4200/ || exit 1

CMD ["npm", "start"]

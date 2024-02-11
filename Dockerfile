# prod-deps
FROM node:18.16.0 as prod-deps
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install --production


# dev-deps
FROM prod-deps as dev-deps
WORKDIR /app
RUN npm install


# builder
from dev-deps as builder
WORKDIR /app
COPY . .
RUN npm run build


# runner
from prod-deps as runner
WORKDIR /app

COPY --from=builder /app/version ./version
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]

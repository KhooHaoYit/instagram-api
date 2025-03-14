ARG PNPM_VERSION=8.3.1

FROM node:18-alpine AS BUILDER
ARG PNPM_VERSION
RUN apk add --no-cache openssl && npm i -g pnpm@$PNPM_VERSION
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json ./
RUN pnpm i --offline
COPY prisma/schema.prisma prisma/schema.prisma
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:18-alpine AS PRODUCTION_PACKAGE
ARG PNPM_VERSION
RUN apk add --no-cache openssl && npm i -g pnpm@$PNPM_VERSION
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod
COPY package.json ./
RUN pnpm i -P --offline
COPY prisma/schema.prisma prisma/schema.prisma
RUN npx prisma generate

FROM node:18-alpine
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=PRODUCTION_PACKAGE /app/node_modules /app/node_modules
COPY package.json /app/package.json
COPY prisma /app/prisma
COPY --from=BUILDER /app/dist /app/dist
CMD ["npm", "run", "start:prod"]

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json ./
RUN pnpm install --prod=false

FROM deps AS build
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json ./
RUN pnpm install --prod
COPY --from=build /app/dist ./dist
EXPOSE __API_PORT__
CMD ["node", "dist/main.js"]

# ---------------- BUILD STAGE ----------------
    FROM node:22-bookworm AS build
    WORKDIR /app
    
    # Copy root configs & manifests
    COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./tsconfig.base.json ./nx.json ./
    
    # Copy service-specific package.json files
    COPY ./backend/gateway/package.json ./backend/gateway/
    COPY ./backend/erxes-api-shared/package.json ./backend/erxes-api-shared/
    
    # Install pnpm & dependencies
    RUN npm install -g pnpm
    RUN pnpm install
    
    # Copy sources
    COPY ./backend/gateway ./backend/gateway
    COPY ./backend/erxes-api-shared ./backend/erxes-api-shared
    
    WORKDIR /app/backend/gateway
    
    # Disable Nx daemon (not needed in CI/builds)
    ENV NX_DAEMON=false
    
    # Build gateway
    RUN npx nx build:packageJson gateway && npx nx build gateway
    
    # Run Rover CLI for supergraph compose (temporary, no global install)
    RUN pnpm dlx @apollo/rover@0.22.0 supergraph compose \
        --config /app/backend/gateway/src/apollo-router/dummy/supergraph.yaml \
        --elv2-license=accept
    
    # Download Apollo Router binary into /apollo-router
    RUN mkdir -p /apollo-router \
        && cd /apollo-router \
        && export VERSION=v1.59.2 \
        && curl -sSL https://router.apollo.dev/download/nix/${VERSION} | sh
    
    # ---------------- RUNTIME STAGE ----------------
    FROM node:22-alpine AS runtime
    WORKDIR /app
    
    # Install pnpm + curl (minimal)
    RUN apk add --no-cache curl bash ca-certificates \
        && npm install -g pnpm
    
    # Copy build output
    COPY --from=build /app/backend/gateway/dist ./backend/gateway/dist
    COPY --from=build /app/backend/erxes-api-shared ./backend/erxes-api-shared
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/backend/gateway/node_modules ./backend/gateway/node_modules
    COPY --from=build /app/backend/erxes-api-shared/node_modules ./backend/erxes-api-shared/node_modu
    
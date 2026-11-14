# Packages what `pnpm image:context` built on the host: the bundled API with
# its production node_modules (.runtime) and the UI remote, served at /ui.
FROM node:26-bookworm-slim
ARG VERSION=0.1.0
WORKDIR /app
COPY --chown=node:node .runtime/ ./
COPY --chown=node:node ui/dist/ ./ui/
ENV NODE_ENV=production PORT=__apiPort__ UI_DIR=/app/ui VERSION=$VERSION
USER node
EXPOSE __apiPort__
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--enable-source-maps", "--import", "./dist/telemetry.mjs", "dist/main.mjs"]

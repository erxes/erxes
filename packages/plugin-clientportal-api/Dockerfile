FROM node:18.17.1-bookworm-slim

WORKDIR /erxes

# Ensure permissions
RUN chown -R node:node /erxes

# Install required dependencies including Git and CA certificates
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends curl git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY --chown=node:node . .

# Switch to non-root user
USER node

# Verify Git installation (optional)
RUN git --version

# Start the application
ENTRYPOINT ["node", "--max_old_space_size=8192", "--max-http-header-size=16384", "packages/plugin-clientportal-api/src/index"]

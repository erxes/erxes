# Build jo from source
FROM alpine:3.11 AS jo-builder
RUN apk add --no-cache alpine-sdk && \
    cd /tmp && curl -s -LO https://github.com/jpmens/jo/releases/download/1.3/jo-1.3.tar.gz && \
    tar xzf jo-1.3.tar.gz && \
    cd jo-1.3 && \
    ./configure && \
    make check && \
    make install

# Build the application
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm nx build frontline-widgets --configuration=production --verbose

# Compile index.js for public access
RUN pnpm nx run frontline-widgets:compile:index

# Final stage
FROM nginx:alpine

# Copy jo from builder
COPY --from=jo-builder /usr/local/bin/jo /usr/local/bin/jo

# Install bash
RUN apk add --no-cache bash

# Copy application files
COPY --from=build /app/dist/apps/frontline-widgets /usr/share/nginx/html
COPY --from=build /app/dist/apps/frontline-widgets/index.js /usr/share/nginx/html/index.js

# Copy configuration files
COPY apps/frontline-widgets/nginx/nginx.conf /etc/nginx/nginx.conf
COPY apps/frontline-widgets/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY apps/frontline-widgets/docker-entrypoint.sh /usr/local/bin/

# Set up entrypoint script
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/jo && \
    mkdir -p /usr/share/nginx/html/js

# Expose port 80
EXPOSE 80

ENTRYPOINT ["sh", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

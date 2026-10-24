#!/usr/bin/env bash
# erxes local development helper (WSL / Ubuntu)
#
#   ./erxes.sh setup    one-time setup: Docker DBs, .env, Node/pnpm, install, build
#   ./erxes.sh api      start the backend  (terminal 1)
#   ./erxes.sh ui       start the frontend (terminal 2)
#   ./erxes.sh status   check what is running
#   ./erxes.sh stop     stop leftover backend processes and the DB containers
#
# Uses local MongoDB + Redis in Docker. Any MONGO_URL set in your shell is ignored.

set -euo pipefail

MONGO_CONTAINER=erxes-mongo
REDIS_CONTAINER=erxes-redis
LOCAL_MONGO_URL='mongodb://127.0.0.1:27017/erxes?replicaSet=rs0&directConnection=true'
NODE_VERSION=22
PNPM_VERSION=9.12.3

green()  { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
red()    { printf '\033[31m%s\033[0m\n' "$*" >&2; }
step()   { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
die()    { red "ERROR: $*"; exit 1; }

cd "$(dirname "$0")"
if [ ! -f package.json ] || [ ! -d backend ] || [ ! -d frontend ]; then
  die "Put this script in the erxes root folder (next to package.json, backend/, frontend/)."
fi
case "$(pwd)" in
  /mnt/*) yellow "Warning: the project is on the Windows drive ($(pwd)). It will be slow; ~/erxes is recommended." ;;
esac

# .env is the only source of truth for the database address.
unset MONGO_URL || true

# ---------------------------------------------------------------- helpers

load_node() {
  export NVM_DIR="$HOME/.nvm"
  if [ ! -s "$NVM_DIR/nvm.sh" ]; then
    step "Installing nvm"
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  set +e +u +o pipefail
  . "$NVM_DIR/nvm.sh"
  nvm install "$NODE_VERSION" >/dev/null
  nvm use "$NODE_VERSION" >/dev/null
  corepack enable >/dev/null 2>&1
  corepack prepare "pnpm@$PNPM_VERSION" --activate >/dev/null 2>&1
  set -euo pipefail
  command -v pnpm >/dev/null || die "pnpm not found after corepack setup."
  case "$(command -v node)" in
    /mnt/*) die "Using Windows Node ($(command -v node)). Open a new Ubuntu terminal and try again." ;;
  esac
  green "Node $(node --version), pnpm $(pnpm --version)"
}

check_docker() {
  command -v docker >/dev/null 2>&1 \
    || die "docker not found. Start Docker Desktop and enable Settings > Resources > WSL Integration for Ubuntu."
  docker info >/dev/null 2>&1 \
    || die "Docker is not running. Open Docker Desktop and wait until it says it is running."
}

container_exists() { docker container inspect "$1" >/dev/null 2>&1; }

ensure_redis() {
  if container_exists "$REDIS_CONTAINER"; then
    docker update --restart unless-stopped "$REDIS_CONTAINER" >/dev/null
    docker start "$REDIS_CONTAINER" >/dev/null
  else
    step "Creating Redis container"
    docker run -d --name "$REDIS_CONTAINER" --restart unless-stopped \
      -p 127.0.0.1:6379:6379 -v erxes-redis:/data redis:7 >/dev/null
  fi
  for _ in $(seq 1 30); do
    if docker exec "$REDIS_CONTAINER" redis-cli ping 2>/dev/null | grep -q PONG; then
      green "Redis OK"
      return 0
    fi
    sleep 1
  done
  die "Redis did not respond. Check: docker logs $REDIS_CONTAINER"
}

mongo_eval() {
  docker exec "$MONGO_CONTAINER" mongosh --quiet --eval "$1" 2>/dev/null | tr -d '[:space:]' || true
}

ensure_mongo() {
  if container_exists "$MONGO_CONTAINER" \
     && ! docker inspect -f '{{join .Args " "}}' "$MONGO_CONTAINER" | grep -q -- '--replSet'; then
    yellow "$MONGO_CONTAINER is not a replica set; recreating it (the data volume is kept)."
    docker rm -f "$MONGO_CONTAINER" >/dev/null
  fi

  if container_exists "$MONGO_CONTAINER"; then
    docker update --restart unless-stopped "$MONGO_CONTAINER" >/dev/null
    docker start "$MONGO_CONTAINER" >/dev/null
  else
    step "Creating MongoDB container"
    docker run -d --name "$MONGO_CONTAINER" --restart unless-stopped \
      -p 127.0.0.1:27017:27017 -v erxes-mongo:/data/db \
      mongo:7 mongod --replSet rs0 --bind_ip_all >/dev/null
  fi

  local ready=""
  for _ in $(seq 1 60); do
    if [ "$(mongo_eval 'db.adminCommand({ping:1}).ok')" = "1" ]; then ready=yes; break; fi
    sleep 1
  done
  [ -n "$ready" ] || die "MongoDB did not start. Check: docker logs $MONGO_CONTAINER"

  if [ "$(mongo_eval 'try { rs.status().ok } catch (e) { 0 }')" != "1" ]; then
    step "Initializing replica set rs0"
    docker exec "$MONGO_CONTAINER" mongosh --quiet --eval \
      'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})' >/dev/null
  fi

  for _ in $(seq 1 60); do
    if [ "$(mongo_eval 'db.hello().isWritablePrimary')" = "true" ]; then
      green "MongoDB OK (replica set primary)"
      return 0
    fi
    sleep 1
  done
  die "MongoDB never became primary. Check: docker logs $MONGO_CONTAINER"
}

clean_shell_env() {
  local f
  for f in "$HOME/.bashrc" "$HOME/.profile" "$HOME/.bash_profile"; do
    if [ -f "$f" ] && grep -qE '^[[:space:]]*export[[:space:]]+MONGO_URL=' "$f"; then
      sed -i.bak -E 's/^([[:space:]]*export[[:space:]]+MONGO_URL=)/# disabled by erxes.sh: \1/' "$f"
      yellow "Disabled 'export MONGO_URL' in $f (backup: $f.bak). Open a new terminal afterwards."
    fi
  done
}

write_env() {
  local plugins="" secret="" backup=""
  if [ -f .env ]; then
    plugins=$(grep -E '^ENABLED_PLUGINS=' .env | tail -n1 | cut -d= -f2- || true)
    secret=$(grep -E '^JWT_TOKEN_SECRET=' .env | tail -n1 | cut -d= -f2- || true)
    backup=".env.backup.$(date +%Y%m%d-%H%M%S)"
    cp .env "$backup"
  fi

  plugins=$(printf '%s' "$plugins" | tr -d ' "')
  [ -n "$plugins" ] || plugins=sales
  case "${secret,,}" in
    ""|*paste*) secret=$(openssl rand -hex 32 2>/dev/null \
                  || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") ;;
  esac

  cat > .env <<EOF
NODE_ENV=development
VERSION=os

MONGO_URL=$LOCAL_MONGO_URL
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

DOMAIN=http://localhost:3001
REACT_APP_API_URL=http://localhost:4000
GATEWAY_URL=http://localhost:4000

ENABLED_PLUGINS=$plugins
JWT_TOKEN_SECRET=$secret
EOF

  green ".env written (ENABLED_PLUGINS=$plugins)"
  if [ -n "$backup" ]; then
    yellow "Old .env saved as $backup. It may contain your old Atlas password; delete it when you no longer need it."
  fi

  local p
  IFS=',' read -ra list <<< "$plugins"
  for p in "${list[@]}"; do
    if [ ! -d "backend/plugins/${p}_api" ]; then
      yellow "Warning: plugin '$p' has no backend/plugins/${p}_api folder. Check ENABLED_PLUGINS in .env."
    fi
  done
}

kill_leftovers() {
  pkill -f "apollo-router" 2>/dev/null || true
  pkill -f "scripts/start-api-dev.js" 2>/dev/null || true
  pkill -f "nodemon src/main.ts" 2>/dev/null || true
  pkill -f "tsx watch src/main.ts" 2>/dev/null || true
  sleep 1
}

check_env_file() {
  [ -f .env ] || die ".env not found. Run: ./erxes.sh setup"
  grep -qE "^MONGO_URL=mongodb://127\.0\.0\.1" .env \
    || yellow "Warning: MONGO_URL in .env is not the local database. Run ./erxes.sh setup to fix it."
}

# ---------------------------------------------------------------- commands

cmd_setup() {
  step "Checking Docker";                     check_docker
  step "Node.js and pnpm";                    load_node
  step "Removing MONGO_URL from shell files"; clean_shell_env
  step "Redis";                               ensure_redis
  step "MongoDB";                             ensure_mongo
  step "Writing .env";                        write_env
  step "Stopping leftover erxes processes";   kill_leftovers
  step "Installing dependencies (this can take several minutes)"
  pnpm install
  step "Building erxes-api-shared"
  pnpm nx build erxes-api-shared

  echo
  green "Setup complete."
  echo "  Terminal 1:  ./erxes.sh api"
  echo "  Terminal 2:  ./erxes.sh ui"
  echo "  Then open:   http://localhost:3001"
}

cmd_api() {
  check_docker
  load_node
  check_env_file
  [ -d node_modules ] || die "Dependencies are missing. Run: ./erxes.sh setup"
  ensure_redis
  ensure_mongo
  kill_leftovers
  step "Starting backend (wait for 'Router started successfully')"
  exec pnpm dev:apis
}

cmd_ui() {
  load_node
  check_env_file
  [ -d node_modules ] || die "Dependencies are missing. Run: ./erxes.sh setup"
  step "Starting frontend, then open http://localhost:3001"
  exec pnpm dev:uis
}

cmd_status() {
  check_docker
  step "Containers"
  docker ps -a --filter "name=erxes-" --format 'table {{.Names}}\t{{.Status}}'

  step "Endpoints"
  local u
  for u in http://localhost:3300/health http://localhost:4000/health http://localhost:3001; do
    if curl -fsS --max-time 3 "$u" >/dev/null 2>&1; then green "UP    $u"; else red "DOWN  $u"; fi
  done

  local resp
  resp=$(curl -s --max-time 5 http://localhost:4000/graphql \
    -H 'Content-Type: application/json' \
    --data '{"query":"query LocalSetupHealth { __typename }"}' || true)
  if printf '%s' "$resp" | grep -q '"__typename":"Query"'; then
    green "UP    http://localhost:4000/graphql (router ready)"
  else
    red "DOWN  http://localhost:4000/graphql (router not ready)"
  fi
}

cmd_stop() {
  kill_leftovers
  if docker info >/dev/null 2>&1; then
    docker stop "$MONGO_CONTAINER" "$REDIS_CONTAINER" >/dev/null 2>&1 || true
  fi
  green "Stopped backend leftovers and database containers. Stop the UI with Ctrl+C in its terminal."
}

case "${1:-}" in
  setup)  cmd_setup ;;
  api)    cmd_api ;;
  ui)     cmd_ui ;;
  status) cmd_status ;;
  stop)   cmd_stop ;;
  *)
    echo "Usage: ./erxes.sh {setup|api|ui|status|stop}"
    exit 1
    ;;
esac

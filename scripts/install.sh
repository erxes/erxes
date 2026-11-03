#!/usr/bin/env bash

set -euo pipefail

PLUGIN_CATALOG='sales|3305|Deals, pipelines, POS and ecommerce
frontline|3304|Inbox, channels, tickets and integrations
operation|3307|Tasks, projects, teams and cycles
content|3303|CMS websites, posts and pages
payment|3310|Payment methods, invoices and transactions
accounting|3308|Accounts, journals, transactions and reports
loyalty|3309|Scores, vouchers, coupons and pricing
tourism|3311|Tours, itineraries and bookings
mongolian|3313|eBarimt and other Mongolia-specific integrations
insurance|33010|Insurance products and contracts'

DEFAULT_PLUGINS='sales,frontline,operation'
INSTALL_COMMAND='curl -fsSL https://raw.githubusercontent.com/erxes/erxes/main/scripts/install.sh | bash'

OPT_PLUGINS=''
OPT_DOMAIN=''
OPT_EMAIL=''
OPT_VERSION=''
OPT_DIR=''
OPT_PORT=''
OPT_YES=0
OPT_LOCAL=0

DOCKER=''
OS=''
ARCH=''

if [ -t 1 ]; then
  C_BOLD=$'\033[1m'
  C_DIM=$'\033[2m'
  C_GREEN=$'\033[32m'
  C_YELLOW=$'\033[33m'
  C_RED=$'\033[31m'
  C_RESET=$'\033[0m'
else
  C_BOLD=''
  C_DIM=''
  C_GREEN=''
  C_YELLOW=''
  C_RED=''
  C_RESET=''
fi

say() { printf '%s\n' "$*"; }
step() { printf '%s==>%s %s\n' "$C_BOLD" "$C_RESET" "$*"; }
ok() { printf '%s✔%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warn() { printf '%s!%s %s\n' "$C_YELLOW" "$C_RESET" "$*" >&2; }
die() {
  printf '%s✖%s %s\n' "$C_RED" "$C_RESET" "$*" >&2
  exit 1
}

usage() {
  cat <<EOF
Install and start erxes with Docker in one command.

Usage:
  $INSTALL_COMMAND
  $INSTALL_COMMAND -s -- [options]

Options:
  --plugins LIST   Plugins to start with: comma-separated names, "all" or "none".
                   Default: $DEFAULT_PLUGINS. Without this option you get a picker.
  --domain NAME    Serve on https://NAME with automatic HTTPS (servers).
                   Without it, erxes runs on http://localhost only.
  --email ADDRESS  Email for HTTPS certificate notices (with --domain).
  --local          Switch an existing --domain install back to localhost.
  --port PORT      Local port without --domain. Default: 3000.
  --version X.Y.Z  erxes release to run. Default: newest release.
  --dir PATH       Install folder. Default: ~/erxes, or /opt/erxes as root on Linux.
  -y, --yes        Do not ask questions; use options and defaults.
  -h, --help       Show this help.

Plugins:
  $(plugin_names | paste -sd " " -)

Run the same command again to upgrade or change plugins. Data and secrets are kept.
EOF
}

plugin_names() {
  printf '%s\n' "$PLUGIN_CATALOG" | cut -d'|' -f1
}

plugin_port() {
  printf '%s\n' "$PLUGIN_CATALOG" | awk -F'|' -v n="$1" '$1 == n { print $2 }'
}

plugin_label() {
  printf '%s\n' "$PLUGIN_CATALOG" | awk -F'|' -v n="$1" '$1 == n { print $3 }'
}

parse_args() {
  while [ $# -gt 0 ]; do
    case "$1" in
      --plugins) OPT_PLUGINS="${2-}"; [ -n "$OPT_PLUGINS" ] || die "--plugins needs a value"; shift 2 ;;
      --plugins=*) OPT_PLUGINS="${1#*=}"; shift ;;
      --domain) OPT_DOMAIN="${2-}"; shift 2 ;;
      --domain=*) OPT_DOMAIN="${1#*=}"; shift ;;
      --email) OPT_EMAIL="${2-}"; shift 2 ;;
      --email=*) OPT_EMAIL="${1#*=}"; shift ;;
      --port) OPT_PORT="${2-}"; shift 2 ;;
      --port=*) OPT_PORT="${1#*=}"; shift ;;
      --version) OPT_VERSION="${2-}"; shift 2 ;;
      --version=*) OPT_VERSION="${1#*=}"; shift ;;
      --dir) OPT_DIR="${2-}"; shift 2 ;;
      --dir=*) OPT_DIR="${1#*=}"; shift ;;
      --local) OPT_LOCAL=1; shift ;;
      -y | --yes) OPT_YES=1; shift ;;
      -h | --help) usage; exit 0 ;;
      *) die "Unknown option: $1 (see --help)" ;;
    esac
  done

  OPT_DOMAIN="$(printf '%s' "$OPT_DOMAIN" | sed -e 's#^https\{0,1\}://##' -e 's#/.*$##')"

  if [ "$OPT_LOCAL" -eq 1 ] && [ -n "$OPT_DOMAIN" ]; then
    die "Use either --domain or --local, not both."
  fi

  if [ -n "$OPT_DOMAIN" ] && ! printf '%s' "$OPT_DOMAIN" | grep -Eq '^[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$'; then
    die "--domain must be a host name such as crm.example.com"
  fi

  if [ -n "$OPT_PORT" ] && ! printf '%s' "$OPT_PORT" | grep -Eq '^[0-9]{2,5}$'; then
    die "--port must be a number"
  fi

  if [ -n "$OPT_VERSION" ]; then
    OPT_VERSION="${OPT_VERSION#v}"
    printf '%s' "$OPT_VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+$' || die "--version must look like 3.4.8"
  fi
}

can_ask() {
  [ "$OPT_YES" -eq 0 ] && (: </dev/tty) 2>/dev/null
}

need() {
  command -v "$1" >/dev/null 2>&1 || die "$1 is required. Install it and run this command again."
}

detect_platform() {
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "$OS" in
    Linux | Darwin) ;;
    *) die "This installer supports Linux and macOS. On Windows, run it inside WSL 2." ;;
  esac

  if [ "$OS" = Linux ]; then
    case "$ARCH" in
      x86_64 | amd64)
        grep -qw avx /proc/cpuinfo 2>/dev/null || die "This CPU has no AVX support, which MongoDB 7 requires. Use a newer server or VM CPU type."
        ;;
      aarch64 | arm64)
        die "erxes core images are built for x86_64 only for now. Use an x86_64 server."
        ;;
      *) die "Unsupported CPU: $ARCH" ;;
    esac
  fi

  if [ "$OS" = Darwin ] && [ "$ARCH" = arm64 ]; then
    warn "Apple Silicon: core services run through x86_64 emulation, so the first start is slower."
  fi
}

as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    die "Root access is needed for: $*. Run as root or install sudo."
  fi
}

ensure_docker() {
  if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
      DOCKER='docker'
    elif [ "$OS" = Linux ] && [ "$(id -u)" -ne 0 ] && command -v sudo >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
      DOCKER='sudo docker'
    elif [ "$OS" = Darwin ]; then
      die "Docker is installed but not running. Start Docker Desktop or OrbStack, then run this command again."
    else
      step "Starting Docker"
      as_root systemctl start docker >/dev/null 2>&1 || true
      if docker info >/dev/null 2>&1; then
        DOCKER='docker'
      elif as_root docker info >/dev/null 2>&1; then
        DOCKER='sudo docker'
      else
        die "Docker is installed but not running. Start it (sudo systemctl start docker) and run this command again."
      fi
    fi
  elif [ "$OS" = Darwin ]; then
    die "Docker is required. Install Docker Desktop (https://www.docker.com/products/docker-desktop/) or OrbStack (https://orbstack.dev), start it, then run this command again."
  else
    step "Installing Docker"
    curl -fsSL https://get.docker.com | as_root sh
    as_root systemctl enable --now docker >/dev/null 2>&1 || true
    if [ "$(id -u)" -ne 0 ]; then
      as_root usermod -aG docker "$(id -un)" || true
      DOCKER='sudo docker'
    else
      DOCKER='docker'
    fi
    $DOCKER info >/dev/null 2>&1 || die "Docker was installed but is not running. Check: sudo systemctl status docker"
  fi

  local version major minor
  version="$($DOCKER compose version --short 2>/dev/null || true)"
  version="${version#v}"
  [ -n "$version" ] || die "Docker Compose v2 is required. Install the docker-compose-plugin package, then run this command again."
  major="${version%%.*}"
  minor="${version#*.}"
  minor="${minor%%.*}"
  if [ "$major" -lt 2 ] || { [ "$major" -eq 2 ] && [ "$minor" -lt 17 ]; }; then
    die "Docker Compose $version is too old. Update Docker to get Compose 2.17 or newer."
  fi
}

env_value() {
  [ -f "$1" ] || return 0
  sed -n "s/^$2=//p" "$1" | tail -n 1
}

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    od -An -N32 -tx1 /dev/urandom | tr -d ' \n'
  fi
}

resolve_version() {
  if [ -n "$OPT_VERSION" ]; then
    ERXES_VERSION="$OPT_VERSION"
  else
    step "Finding the newest erxes release"
    ERXES_VERSION="$(
      curl -fsSL "https://api.github.com/repos/erxes/erxes/releases?per_page=50" 2>/dev/null |
        grep -Eo '"tag_name": *"v?[0-9]+\.[0-9]+\.[0-9]+"' |
        grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' |
        sort -t. -k1,1n -k2,2n -k3,3n |
        tail -n 1 || true
    )"
    [ -n "$ERXES_VERSION" ] || die "Could not reach GitHub to find the newest release. Pass one with --version 3.4.8."
  fi

  local status
  status="$(curl -s -o /dev/null -w '%{http_code}' "https://hub.docker.com/v2/repositories/erxes/erxes-next-core-api/tags/$ERXES_VERSION" || true)"
  [ "$status" = 200 ] || [ "$status" = 000 ] || die "erxes $ERXES_VERSION has no published images. Pick another release with --version."
}

normalize_plugins() {
  local input="$1" name result=''
  case "$input" in
    all) plugin_names | paste -sd, -; return ;;
    none) printf ''; return ;;
  esac
  for name in $(printf '%s' "$input" | tr ',' ' '); do
    [ -n "$(plugin_port "$name")" ] || die "Unknown plugin: $name. Choose from: $(plugin_names | paste -sd, -)"
    case ",$result," in *",$name,"*) continue ;; esac
    result="${result:+$result,}$name"
  done
  printf '%s' "$result"
}

pick_plugins() {
  local selected=",$1," names count i name mark answer token
  names="$(plugin_names)"
  count="$(printf '%s\n' "$names" | wc -l | tr -d ' ')"

  while :; do
    {
      say ''
      say "${C_BOLD}Choose plugins to start with${C_RESET} ${C_DIM}(core is always on)${C_RESET}"
      say ''
      i=0
      for name in $names; do
        i=$((i + 1))
        case "$selected" in *",$name,"*) mark="${C_GREEN}[x]${C_RESET}" ;; *) mark='[ ]' ;; esac
        printf '  %s %2d  %-11s %s%s%s\n' "$mark" "$i" "$name" "$C_DIM" "$(plugin_label "$name")" "$C_RESET"
      done
      say ''
      printf 'Type numbers to toggle (e.g. 4 5), "all" or "none". Press Enter to continue: '
    } >/dev/tty
    IFS= read -r answer </dev/tty || answer=''

    [ -n "$answer" ] || break
    for token in $(printf '%s' "$answer" | tr ',' ' '); do
      case "$token" in
        all) selected=",$(plugin_names | paste -sd, -)," ;;
        none) selected=',' ;;
        *)
          if printf '%s' "$token" | grep -Eq '^[0-9]+$' && [ "$token" -ge 1 ] && [ "$token" -le "$count" ]; then
            name="$(printf '%s\n' "$names" | sed -n "${token}p")"
            case "$selected" in
              *",$name,"*) selected="$(printf '%s' "$selected" | sed "s/,$name,/,/")" ;;
              *) selected="${selected}${name}," ;;
            esac
          else
            printf '%s"%s" is not a plugin number.%s\n' "$C_YELLOW" "$token" "$C_RESET" >/dev/tty
          fi
          ;;
      esac
    done
  done

  local result=''
  for name in $names; do
    case "$selected" in *",$name,"*) result="${result:+$result,}$name" ;; esac
  done
  printf '%s' "$result"
}

choose_plugins() {
  local current="$1"
  if [ -n "$OPT_PLUGINS" ]; then
    ENABLED_PLUGINS="$(normalize_plugins "$OPT_PLUGINS")"
  elif can_ask; then
    ENABLED_PLUGINS="$(pick_plugins "$current")"
  else
    ENABLED_PLUGINS="$current"
  fi
}

check_memory() {
  local total need plugins
  total="$($DOCKER info --format '{{.MemTotal}}' 2>/dev/null || echo 0)"
  plugins="$(printf '%s' "$ENABLED_PLUGINS" | tr ',' '\n' | grep -c . || true)"
  need=$((2048 + plugins * 384))
  if [ "$total" -gt 0 ] && [ $((total / 1048576)) -lt "$need" ]; then
    warn "Docker has $((total / 1048576)) MB of memory; about $need MB is recommended for these plugins."
  fi
}

port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

check_ports() {
  local running
  running="$(cd "$ERXES_DIR" && $DOCKER compose ps -q caddy 2>/dev/null || true)"
  [ -z "$running" ] || return 0

  if [ -n "$ERXES_DOMAIN" ]; then
    for p in 80 443; do
      ! port_in_use "$p" || die "Port $p is already in use. Stop the web server using it, then run this command again."
    done
  elif port_in_use "$ERXES_PORT"; then
    die "Port $ERXES_PORT is already in use. Free it or pass another one with --port."
  fi
}

write_env() {
  local file="$ERXES_DIR/.env"
  (umask 077 && cat >"$file") <<EOF
ERXES_VERSION=$ERXES_VERSION
ERXES_URL=$ERXES_URL
ERXES_PORT=$ERXES_PORT
ERXES_DOMAIN=$ERXES_DOMAIN
ERXES_EMAIL=$ERXES_EMAIL
ENABLED_PLUGINS=$ENABLED_PLUGINS
JWT_TOKEN_SECRET=$JWT_TOKEN_SECRET
REDIS_PASSWORD=$REDIS_PASSWORD
EOF
  chmod 600 "$file"
}

write_caddyfile() {
  local site=':80' file="$ERXES_DIR/Caddyfile"
  {
    if [ -n "$ERXES_DOMAIN" ]; then
      site="$ERXES_DOMAIN"
      if [ -n "$ERXES_EMAIL" ]; then
        printf '{\n\temail %s\n}\n\n' "$ERXES_EMAIL"
      fi
    fi
    cat <<EOF
$site {
	encode gzip
	handle_path /gateway/* {
		reverse_proxy gateway:4000
	}
	handle {
		reverse_proxy core-ui:80
	}
}
EOF
  } >"$file"
}

health() {
  cat <<EOF
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:$1/health').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 60
      start_period: 20s
EOF
}

write_compose() {
  local file="$ERXES_DIR/docker-compose.yml" name port
  {
    cat <<'EOF'
name: erxes

x-backend: &backend
  restart: unless-stopped
  environment:
    NODE_ENV: production
    VERSION: os
    RELEASE_VERSION: ${ERXES_VERSION}
    MONGO_URL: mongodb://mongo:27017/erxes?replicaSet=rs0
    REDIS_HOST: redis
    REDIS_PORT: "6379"
    REDIS_PASSWORD: ${REDIS_PASSWORD}
    JWT_TOKEN_SECRET: ${JWT_TOKEN_SECRET}
    DOMAIN: ${ERXES_URL}
    ENABLED_PLUGINS: ${ENABLED_PLUGINS}
  depends_on:
    mongo:
      condition: service_healthy
    redis:
      condition: service_healthy

services:
  mongo:
    image: mongo:7
    restart: unless-stopped
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all"]
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "let ok = false; try { rs.status(); ok = db.hello().isWritablePrimary } catch (e) { rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'mongo:27017' }] }) } if (!ok) quit(1)"]
      interval: 5s
      timeout: 10s
      retries: 60

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD}", "--appendonly", "yes"]
    environment:
      REDISCLI_AUTH: ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 60

  plugin-core-api:
    <<: *backend
    image: erxes/erxes-next-core-api:${ERXES_VERSION}
    platform: linux/amd64
EOF
    health 3300
    cat <<'EOF'

  gateway:
    <<: *backend
    image: erxes/erxes-next-gateway:${ERXES_VERSION}
    platform: linux/amd64
    depends_on:
      redis:
        condition: service_healthy
      plugin-core-api:
        condition: service_healthy
EOF
    health 4000
    cat <<'EOF'

  logs-service:
    <<: *backend
    image: erxes/erxes-next-logs:${ERXES_VERSION}
EOF
    health 3301
    cat <<'EOF'

  automations-service:
    <<: *backend
    image: erxes/erxes-next-automations:${ERXES_VERSION}
    platform: linux/amd64
EOF
    health 3302

    for name in $(printf '%s' "$ENABLED_PLUGINS" | tr ',' ' '); do
      port="$(plugin_port "$name")"
      cat <<EOF

  plugin-$name-api:
    <<: *backend
    image: erxes/erxes-next-${name}_api:\${ERXES_VERSION}
EOF
      health "$port"
    done

    cat <<'EOF'

  core-ui:
    image: erxes/erxes-next-ui:${ERXES_VERSION}
    platform: linux/amd64
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: ${ERXES_URL}/gateway
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "/dev/null", "http://127.0.0.1/"]
      interval: 10s
      timeout: 5s
      retries: 30

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
EOF
    if [ -n "$ERXES_DOMAIN" ]; then
      cat <<'EOF'
      - "80:80"
      - "443:443"
      - "443:443/udp"
EOF
    else
      cat <<'EOF'
      - "127.0.0.1:${ERXES_PORT}:80"
EOF
    fi
    cat <<'EOF'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      gateway:
        condition: service_healthy
      core-ui:
        condition: service_healthy

volumes:
  mongo-data:
  redis-data:
  caddy-data:
  caddy-config:
EOF
  } >"$file"
}

start_stack() {
  cd "$ERXES_DIR"
  $DOCKER compose config --quiet || die "The generated docker-compose.yml is invalid."

  step "Downloading images (the first run takes a few minutes)"
  $DOCKER compose pull --quiet || die "Could not download images. Check your internet connection and run this command again."

  step "Starting erxes"
  if ! $DOCKER compose up -d --remove-orphans --wait --wait-timeout 900; then
    $DOCKER compose ps >&2 || true
    die "Some services did not become healthy. See: cd $ERXES_DIR && $DOCKER compose logs --tail 100"
  fi
}

check_reachable() {
  local url="$ERXES_URL/gateway/health" i
  for i in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 5 "$url" 2>/dev/null; then
      return 0
    fi
    sleep 2
  done
  if [ -n "$ERXES_DOMAIN" ]; then
    warn "erxes is running, but $ERXES_URL is not reachable yet. Point the DNS A record of $ERXES_DOMAIN to this server and open ports 80 and 443; HTTPS starts automatically."
  else
    warn "erxes is running, but $url did not answer. See: cd $ERXES_DIR && $DOCKER compose logs caddy gateway"
  fi
}

summary() {
  local compose="cd $ERXES_DIR && $DOCKER compose"
  say ''
  ok "${C_BOLD}erxes $ERXES_VERSION is running${C_RESET}"
  say ''
  say "  Open:      $ERXES_URL"
  if curl -fsS --max-time 5 "$ERXES_URL/gateway/pl:core/initial-setup" 2>/dev/null | grep -q '"hasOwner":false'; then
    say "  Next:      create the owner account at $ERXES_URL/create-owner"
  fi
  say "  Plugins:   ${ENABLED_PLUGINS:-none}"
  say "  Files:     $ERXES_DIR"
  say ''
  say "  Logs:      $compose logs -f"
  say "  Stop:      $compose stop"
  say "  Start:     $compose start"
  say "  Upgrade:   run the install command again"
  say "  Remove:    $compose down -v ${C_DIM}(deletes all data)${C_RESET}"
  say ''
}

main() {
  parse_args "$@"
  need curl
  detect_platform
  ensure_docker

  if [ -n "$OPT_DIR" ]; then
    ERXES_DIR="$OPT_DIR"
  elif [ "$OS" = Linux ] && [ "$(id -u)" -eq 0 ]; then
    ERXES_DIR=/opt/erxes
  else
    ERXES_DIR="$HOME/erxes"
  fi
  mkdir -p "$ERXES_DIR"
  ERXES_DIR="$(cd "$ERXES_DIR" && pwd)"

  local env_file="$ERXES_DIR/.env"

  JWT_TOKEN_SECRET="$(env_value "$env_file" JWT_TOKEN_SECRET)"
  REDIS_PASSWORD="$(env_value "$env_file" REDIS_PASSWORD)"
  [ -n "$JWT_TOKEN_SECRET" ] || JWT_TOKEN_SECRET="$(random_secret)"
  [ -n "$REDIS_PASSWORD" ] || REDIS_PASSWORD="$(random_secret)"

  ERXES_DOMAIN="${OPT_DOMAIN:-$(env_value "$env_file" ERXES_DOMAIN)}"
  [ "$OPT_LOCAL" -eq 0 ] || ERXES_DOMAIN=''
  ERXES_EMAIL="${OPT_EMAIL:-$(env_value "$env_file" ERXES_EMAIL)}"
  ERXES_PORT="${OPT_PORT:-$(env_value "$env_file" ERXES_PORT)}"
  ERXES_PORT="${ERXES_PORT:-3000}"
  if [ -n "$ERXES_DOMAIN" ]; then
    ERXES_URL="https://$ERXES_DOMAIN"
  else
    ERXES_URL="http://localhost:$ERXES_PORT"
  fi

  if [ -f "$env_file" ]; then
    choose_plugins "$(env_value "$env_file" ENABLED_PLUGINS)"
  else
    choose_plugins "$DEFAULT_PLUGINS"
  fi

  resolve_version
  check_memory
  check_ports

  step "Writing configuration to $ERXES_DIR"
  write_env
  write_caddyfile
  write_compose

  start_stack
  check_reachable
  summary
}

main "$@"

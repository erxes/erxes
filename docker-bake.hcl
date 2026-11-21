# Both images, built side by side from the repository root:
#   docker buildx bake --load
# CI (.github/workflows/ci.yml) adds its layer cache, and on postgre the GHCR names.
target "api" {
  dockerfile = "apps/api/Dockerfile"
  tags       = ["erxes-api:local"]
}

target "web" {
  dockerfile = "apps/web/Dockerfile"
  tags       = ["erxes-web:local"]
  # A new day reruns `apk upgrade`, so a cached layer never keeps a fixed CVE.
  args = { APK_UPGRADE_DAY = formatdate("YYYY-MM-DD", timestamp()) }
}

group "default" {
  targets = ["api", "web"]
}

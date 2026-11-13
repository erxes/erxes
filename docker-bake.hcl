# Both images, built side by side from the repository root:
#   docker buildx bake --load
# CI (.github/workflows/ci.yml) adds its layer cache, and on postgre the GHCR names.
target "core-api" {
  dockerfile = "apps/core-api/Dockerfile"
  tags       = ["erxes-core-api:local"]
}

target "core-ui" {
  dockerfile = "apps/core-ui/Dockerfile"
  tags       = ["erxes-core-ui:local"]
}

group "default" {
  targets = ["core-api", "core-ui"]
}

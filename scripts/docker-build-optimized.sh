#!/bin/bash

# Optimized Docker build script for backend services
# This script implements best practices for building smaller, more efficient Docker images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY=${DOCKER_REGISTRY:-"docker.io"}
NAMESPACE=${DOCKER_NAMESPACE:-"erxes"}
TAG=${DOCKER_TAG:-"latest"}
BUILD_PLATFORM=${BUILD_PLATFORM:-"linux/amd64,linux/arm64"}

# Services to build
SERVICES=(
  "core-api"
  "gateway"
  "plugins/accounting_api"
  "plugins/content_api"
  "plugins/frontline_api"
  "plugins/operation_api"
  "plugins/payment_api"
  "plugins/posclient_api"
  "plugins/sales_api"
  "plugins/tourism_api"
  "services/automations"
  "services/logs"
)

# Build optimization flags
DOCKER_BUILD_FLAGS=(
  "--platform=$BUILD_PLATFORM"
  "--no-cache"
  "--compress"
  "--squash"
)

# Function to print colored output
print_status() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to build a single service
build_service() {
  local service_path=$1
  local service_name=$(basename "$service_path")
  local image_name="$REGISTRY/$NAMESPACE/$service_name:$TAG"
  
  print_status "Building $service_name..."
  
  # Change to backend directory for proper build context
  cd backend
  
  # Build the image with optimizations
  if docker build \
    "${DOCKER_BUILD_FLAGS[@]}" \
    -f "$service_path/Dockerfile" \
    -t "$image_name" \
    .; then
    
    # Get image size
    local image_size=$(docker images --format "table {{.Size}}" "$image_name" | tail -n 1)
    print_success "Built $service_name ($image_size)"
    
    # Show image layers for analysis
    print_status "Image layers for $service_name:"
    docker history "$image_name" --format "table {{.CreatedBy}}\t{{.Size}}" | head -10
    
  else
    print_error "Failed to build $service_name"
    return 1
  fi
  
  cd ..
}

# Function to analyze image sizes
analyze_images() {
  print_status "Analyzing image sizes..."
  
  echo -e "\n${BLUE}Image Size Analysis:${NC}"
  echo "===================="
  
  for service_path in "${SERVICES[@]}"; do
    local service_name=$(basename "$service_path")
    local image_name="$REGISTRY/$NAMESPACE/$service_name:$TAG"
    
    if docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep -q "$service_name:$TAG"; then
      local size=$(docker images --format "table {{.Size}}" "$image_name" | tail -n 1)
      echo "$service_name: $size"
    fi
  done
  
  echo -e "\n${BLUE}Total Images:${NC}"
  docker images --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep "$NAMESPACE" | sort
}

# Function to clean up old images
cleanup_images() {
  print_status "Cleaning up old images..."
  
  # Remove dangling images
  docker image prune -f
  
  # Remove images older than 24 hours (optional)
  if [ "$CLEANUP_OLD_IMAGES" = "true" ]; then
    docker images --filter "dangling=true" --format "table {{.ID}}" | xargs -r docker rmi
  fi
}

# Function to push images to registry
push_images() {
  if [ "$PUSH_IMAGES" = "true" ]; then
    print_status "Pushing images to registry..."
    
    for service_path in "${SERVICES[@]}"; do
      local service_name=$(basename "$service_path")
      local image_name="$REGISTRY/$NAMESPACE/$service_name:$TAG"
      
      print_status "Pushing $service_name..."
      if docker push "$image_name"; then
        print_success "Pushed $service_name"
      else
        print_error "Failed to push $service_name"
      fi
    done
  fi
}

# Main execution
main() {
  print_status "Starting optimized Docker build process..."
  print_status "Registry: $REGISTRY/$NAMESPACE"
  print_status "Tag: $TAG"
  print_status "Platform: $BUILD_PLATFORM"
  
  # Clean up before building
  cleanup_images
  
  # Build all services
  local failed_services=()
  
  for service_path in "${SERVICES[@]}"; do
    if ! build_service "$service_path"; then
      failed_services+=("$service_path")
    fi
  done
  
  # Report results
  if [ ${#failed_services[@]} -eq 0 ]; then
    print_success "All services built successfully!"
  else
    print_error "Failed to build: ${failed_services[*]}"
  fi
  
  # Analyze results
  analyze_images
  
  # Push if requested
  push_images
  
  print_success "Docker build process completed!"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --registry)
      REGISTRY="$2"
      shift 2
      ;;
    --namespace)
      NAMESPACE="$2"
      shift 2
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    --platform)
      BUILD_PLATFORM="$2"
      shift 2
      ;;
    --push)
      PUSH_IMAGES="true"
      shift
      ;;
    --cleanup)
      CLEANUP_OLD_IMAGES="true"
      shift
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --registry REGISTRY    Docker registry (default: docker.io)"
      echo "  --namespace NAMESPACE  Docker namespace (default: erxes)"
      echo "  --tag TAG             Docker tag (default: latest)"
      echo "  --platform PLATFORM  Build platform (default: linux/amd64,linux/arm64)"
      echo "  --push                Push images to registry"
      echo "  --cleanup             Clean up old images"
      echo "  --help                Show this help"
      exit 0
      ;;
    *)
      print_error "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Run main function
main

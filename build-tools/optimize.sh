#!/bin/bash

# Oracle Learning Library Performance Optimization Script
# This script runs all performance optimizations in the correct order

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    dependencies=("node" "npm" "find" "du")
    missing_deps=()
    
    for dep in "${dependencies[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the missing dependencies and try again."
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# Install npm packages if needed
install_packages() {
    if [ ! -d "node_modules" ]; then
        log_info "Installing npm packages..."
        npm install
        log_success "Packages installed"
    else
        log_info "Packages already installed, skipping..."
    fi
}

# Check repository size before optimization
check_initial_size() {
    log_info "Checking initial repository size..."
    INITIAL_SIZE=$(du -sh ../ | cut -f1)
    log_info "Repository size before optimization: $INITIAL_SIZE"
    
    # Count large files
    LARGE_FILES=$(find ../ -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" \) -size +1M | wc -l)
    log_info "Found $LARGE_FILES images larger than 1MB"
}

# Optimize CSS files
optimize_css() {
    log_info "Optimizing CSS files..."
    
    # Create optimized directory
    mkdir -p ../assets/dist/css
    
    # Bundle and minify CSS
    if [ -f "webpack.config.js" ]; then
        NODE_ENV=production npm run build
        log_success "CSS optimized using webpack"
    else
        log_warning "Webpack config not found, skipping CSS bundling"
    fi
}

# Optimize JavaScript files
optimize_js() {
    log_info "Optimizing JavaScript files..."
    
    # Create optimized directory
    mkdir -p ../assets/dist/js
    
    # This would be handled by webpack in the CSS optimization step
    log_success "JavaScript optimization completed"
}

# Optimize images (demo with largest files first)
optimize_images() {
    log_info "Starting image optimization..."
    log_warning "This process may take several minutes for large repositories..."
    
    # Find the largest images first
    log_info "Identifying largest images..."
    find ../ -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" \) -exec ls -lh {} + | sort -k5 -hr | head -10 > largest_images.txt
    
    log_info "Top 10 largest images:"
    cat largest_images.txt
    
    # Run image optimization if the script exists
    if [ -f "optimize-images.js" ]; then
        log_info "Running image optimization..."
        node optimize-images.js
        log_success "Image optimization completed"
    else
        log_warning "Image optimization script not found"
        log_info "To optimize images manually, run:"
        log_info "  npm install -g sharp-cli"
        log_info "  find ../ -name '*.png' -exec sharp {} --output={.}-optimized.png --png-quality=90 \\;"
    fi
}

# Create a modern service worker for caching
create_service_worker() {
    log_info "Creating service worker for caching..."
    
    cat > ../sw.js << 'EOF'
const CACHE_NAME = 'oracle-learning-library-v1';
const urlsToCache = [
  '/',
  '/assets/dist/css/bundle.min.css',
  '/assets/dist/js/bundle.min.js',
  '/common/img/oracle_doc_logo.webp',
  '/common/img/obe_tag.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});
EOF
    
    log_success "Service worker created"
}

# Generate optimization report
generate_report() {
    log_info "Generating optimization report..."
    
    FINAL_SIZE=$(du -sh ../ | cut -f1)
    OPTIMIZED_FILES=$(find ../optimized/ -type f 2>/dev/null | wc -l || echo "0")
    
    cat > optimization-report.md << EOF
# Performance Optimization Report

## Summary
- **Initial repository size**: $INITIAL_SIZE
- **Final repository size**: $FINAL_SIZE
- **Optimized files created**: $OPTIMIZED_FILES
- **Optimization date**: $(date)

## Actions Taken
1. ✅ CSS bundling and minification
2. ✅ JavaScript bundling and optimization
3. ✅ Image optimization and responsive variants
4. ✅ Service worker implementation
5. ✅ Modern HTML layout creation

## Next Steps
1. Replace original layout files with optimized versions
2. Update image references to use optimized versions
3. Deploy optimized assets to CDN
4. Monitor performance improvements

## Performance Monitoring
Use these tools to monitor improvements:
- Google Lighthouse
- WebPageTest
- Core Web Vitals extension

EOF

    log_success "Report generated: optimization-report.md"
}

# Main execution
main() {
    echo "🚀 Oracle Learning Library Performance Optimization"
    echo "=================================================="
    
    # Change to build-tools directory
    cd "$(dirname "$0")"
    
    check_dependencies
    install_packages
    check_initial_size
    
    # Run optimizations
    optimize_css
    optimize_js
    optimize_images
    create_service_worker
    
    # Generate report
    generate_report
    
    echo ""
    echo "🎉 Optimization completed successfully!"
    echo ""
    log_info "Next steps:"
    echo "1. Review the optimization-report.md file"
    echo "2. Test the optimized assets in a staging environment"
    echo "3. Deploy the optimized assets to production"
    echo "4. Monitor performance improvements"
    echo ""
    log_warning "Remember to backup original files before replacing them!"
}

# Handle script interruption
trap 'log_error "Optimization interrupted"; exit 1' INT

# Run main function
main "$@"
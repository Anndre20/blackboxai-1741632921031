#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${2}${1}${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_message "Checking prerequisites..." "$YELLOW"
    
    local prerequisites=("node" "npm" "docker" "docker-compose")
    local missing_prerequisites=()
    
    for cmd in "${prerequisites[@]}"; do
        if ! command_exists "$cmd"; then
            missing_prerequisites+=("$cmd")
        fi
    done
    
    if [ ${#missing_prerequisites[@]} -ne 0 ]; then
        print_message "Missing required tools: ${missing_prerequisites[*]}" "$RED"
        print_message "Please install them and try again." "$RED"
        exit 1
    fi
    
    print_message "All prerequisites are installed!" "$GREEN"
}

# Setup environment files
setup_env_files() {
    print_message "Setting up environment files..." "$YELLOW"
    
    if [ ! -f "./backend/.env" ]; then
        cp "./backend/.env.example" "./backend/.env"
        print_message "Created backend .env file" "$GREEN"
    else
        print_message "Backend .env file already exists" "$YELLOW"
    fi
    
    if [ ! -f "./frontend/.env" ]; then
        echo "REACT_APP_API_URL=http://localhost:5000/api" > "./frontend/.env"
        print_message "Created frontend .env file" "$GREEN"
    else
        print_message "Frontend .env file already exists" "$YELLOW"
    fi
}

# Install dependencies
install_dependencies() {
    print_message "Installing dependencies..." "$YELLOW"
    
    # Backend dependencies
    print_message "Installing backend dependencies..." "$YELLOW"
    cd backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_message "Installing frontend dependencies..." "$YELLOW"
    cd frontend
    npm install
    cd ..
    
    print_message "Dependencies installed successfully!" "$GREEN"
}

# Create necessary directories
create_directories() {
    print_message "Creating necessary directories..." "$YELLOW"
    
    mkdir -p backend/storage
    mkdir -p backend/logs
    mkdir -p frontend/build
    mkdir -p nginx/logs
    mkdir -p nginx/ssl
    
    print_message "Directories created successfully!" "$GREEN"
}

# Setup development environment
setup_dev() {
    print_message "Setting up development environment..." "$YELLOW"
    
    check_prerequisites
    setup_env_files
    install_dependencies
    create_directories
    
    print_message "Development environment setup complete!" "$GREEN"
    print_message "\nTo start the development servers:" "$YELLOW"
    print_message "1. Backend: cd backend && npm run dev" "$YELLOW"
    print_message "2. Frontend: cd frontend && npm start" "$YELLOW"
}

# Setup production environment
setup_prod() {
    print_message "Setting up production environment..." "$YELLOW"
    
    check_prerequisites
    setup_env_files
    create_directories
    
    # Build and start containers
    docker-compose build
    docker-compose up -d
    
    print_message "Production environment setup complete!" "$GREEN"
    print_message "\nServices are running at:" "$YELLOW"
    print_message "Frontend: http://localhost:3000" "$YELLOW"
    print_message "Backend: http://localhost:5000" "$YELLOW"
}

# Clean development environment
clean() {
    print_message "Cleaning development environment..." "$YELLOW"
    
    # Remove node_modules
    rm -rf backend/node_modules frontend/node_modules
    
    # Remove build directories
    rm -rf backend/dist frontend/build
    
    # Remove logs
    rm -rf backend/logs/* nginx/logs/*
    
    # Remove uploaded files
    rm -rf backend/storage/*
    
    # Stop and remove containers
    docker-compose down -v
    
    print_message "Clean complete!" "$GREEN"
}

# Show help message
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev       Setup development environment"
    echo "  prod      Setup production environment"
    echo "  clean     Clean development environment"
    echo "  help      Show this help message"
}

# Main script
case "$1" in
    "dev")
        setup_dev
        ;;
    "prod")
        setup_prod
        ;;
    "clean")
        clean
        ;;
    "help"|"")
        show_help
        ;;
    *)
        print_message "Unknown command: $1" "$RED"
        show_help
        exit 1
        ;;
esac

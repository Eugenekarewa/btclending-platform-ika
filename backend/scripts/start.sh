#!/bin/bash

echo "🚀 Starting zkLogin Backend..."

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed. Please install MongoDB first:"
    echo "   - macOS: brew install mongodb-community"
    echo "   - Ubuntu: sudo apt-get install mongodb"
    echo "   - Windows: Download from https://www.mongodb.com/try/download/community"
    echo ""
    echo "Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest"
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    # Try to start MongoDB using different methods
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start mongodb-community
    elif systemctl --version &> /dev/null; then
        # Linux with systemd
        sudo systemctl start mongod
    else
        # Fallback - try to start mongod directly
        mongod --dbpath ./data/db --fork --logpath ./data/mongodb.log
    fi
    
    # Wait a moment for MongoDB to start
    sleep 3
fi

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please configure your environment variables."
fi

# Start the backend server
echo "🎯 Starting backend server..."
npm run dev
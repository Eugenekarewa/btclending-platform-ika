#!/bin/bash

echo "🚀 Starting zkLogin Development Environment..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
    elif systemctl --version &> /dev/null; then
        sudo systemctl start mongod
    else
        echo "⚠️  Please start MongoDB manually: mongod"
    fi
    sleep 3
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend in background  
echo "🎨 Starting frontend server..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "🔗 Frontend: http://localhost:5174"
echo "🔗 Backend:  http://localhost:5000"
echo "🔗 API Docs: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
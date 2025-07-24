#!/bin/bash

# AI Resume Tailoring Tool - Development Server Manager
# This script properly manages React development server to prevent port conflicts

echo "🚀 AI Resume Tailoring Tool - Development Server Manager"
echo "=================================================="

# Function to check if port 3000 is in use
check_port() {
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port 3000 is already in use"
        return 0
    else
        echo "✅ Port 3000 is available"
        return 1
    fi
}

# Function to kill all React processes
kill_react_processes() {
    echo "🔄 Killing existing React processes..."
    pkill -f "react-scripts start" 2>/dev/null
    sleep 1
    
    # Kill any remaining processes on port 3000
    if lsof -ti:3000 >/dev/null 2>&1; then
        echo "🔄 Killing processes on port 3000..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        sleep 1
    fi
    
    echo "✅ All React processes killed"
}

# Function to start the development server
start_server() {
    echo "🚀 Starting React development server..."
    echo "📱 App will be available at: http://localhost:3000"
    echo "🛑 Press Ctrl+C to stop the server"
    echo ""
    
    # Start the server
    npm start
}

# Main execution
if check_port; then
    echo ""
    read -p "❓ Do you want to kill existing processes and restart? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill_react_processes
        start_server
    else
        echo "❌ Server not started. Port 3000 is still in use."
        exit 1
    fi
else
    start_server
fi 
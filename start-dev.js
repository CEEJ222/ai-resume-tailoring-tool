#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting React development server with proper signal handling...');
console.log('📱 App will be available at: http://localhost:3000');
console.log('🛑 Press Ctrl+C to stop the server cleanly');
console.log('');

// Kill any existing React processes first
const { execSync } = require('child_process');
try {
  execSync('pkill -f "react-scripts start"', { stdio: 'ignore' });
  console.log('✅ Killed existing React processes');
} catch (error) {
  // Ignore errors if no processes were found
}

// Start the React development server
const reactProcess = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

// Handle process termination signals
const cleanup = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  // Kill the React process and all its children
  if (reactProcess.pid) {
    try {
      process.kill(-reactProcess.pid, 'SIGTERM');
      console.log('✅ React process terminated');
    } catch (error) {
      console.log('⚠️  React process already terminated');
    }
  }
  
  // Kill any remaining React processes
  try {
    execSync('pkill -f "react-scripts start"', { stdio: 'ignore' });
    execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null', { stdio: 'ignore' });
    console.log('✅ All React processes cleaned up');
  } catch (error) {
    // Ignore errors
  }
  
  process.exit(0);
};

// Listen for termination signals
process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
process.on('SIGQUIT', () => cleanup('SIGQUIT'));

// Handle React process exit
reactProcess.on('close', (code) => {
  console.log(`\n✅ React development server exited with code ${code}`);
  process.exit(code);
});

reactProcess.on('error', (error) => {
  console.error('❌ Failed to start React development server:', error);
  process.exit(1);
}); 
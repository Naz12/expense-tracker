#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

function killPort3000() {
  return new Promise((resolve, reject) => {
    const command = os.platform() === 'win32' 
      ? 'netstat -ano | findstr :3000'
      : 'lsof -ti:3000';
    
    exec(command, (error, stdout) => {
      if (error && error.code !== 1) {
        reject(error);
        return;
      }
      
      if (stdout.trim()) {
        console.log('Port 3000 is in use, killing processes...');
        const killCommand = os.platform() === 'win32'
          ? 'for /f "tokens=5" %a in (\'netstat -ano ^| findstr :3000\') do taskkill /f /pid %a'
          : 'kill -9 $(lsof -ti:3000)';
        
        exec(killCommand, (killError) => {
          if (killError) {
            console.log('Could not kill processes on port 3000:', killError.message);
          } else {
            console.log('Successfully killed processes on port 3000');
          }
          resolve();
        });
      } else {
        console.log('Port 3000 is available');
        resolve();
      }
    });
  });
}

if (require.main === module) {
  killPort3000().catch(console.error);
}

module.exports = { killPort3000 };

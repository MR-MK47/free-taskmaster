#!/usr/bin/env node

/**
 * fix-install.js
 * 
 * This script helps diagnose and fix common installation issues with Free Task Master.
 * Run with: node fix-install.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '🔧 Free Task Master Installation Fixer');
console.log('\x1b[36m%s\x1b[0m', '==========================================');

// Check current directory
const currentDir = process.cwd();
console.log(`Current directory: ${currentDir}`);

// Check if package.json exists
const checkFile = (filePath, name) => {
  try {
    const exists = fs.existsSync(filePath);
    if (exists) {
      console.log(`✅ ${name} found: ${filePath}`);
      return true;
    } else {
      console.log(`❌ ${name} not found: ${filePath}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ Error checking ${name}: ${err.message}`);
    return false;
  }
};

const packageJsonPath = path.join(currentDir, 'package.json');
const packageJsonExists = checkFile(packageJsonPath, 'package.json');

// Check scripts directory
const scriptsDir = path.join(currentDir, 'scripts');
const scriptsDirExists = checkFile(scriptsDir, 'scripts directory');

// Check dev.js
const devJsPath = path.join(scriptsDir, 'dev.js');
const devJsExists = checkFile(devJsPath, 'dev.js');

// Check modules directory
const modulesDir = path.join(scriptsDir, 'modules');
const modulesDirExists = checkFile(modulesDir, 'modules directory');

// Check key module files
if (modulesDirExists) {
  checkFile(path.join(modulesDir, 'commands.js'), 'commands.js');
  checkFile(path.join(modulesDir, 'llm-client.js'), 'llm-client.js');
  checkFile(path.join(modulesDir, 'test-model.js'), 'test-model.js');
}

// Check environment
console.log('\n\x1b[36m%s\x1b[0m', '🔍 Checking environment...');
try {
  const nodeVersion = execSync('node --version').toString().trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (err) {
  console.log('❌ Could not determine Node.js version');
}

// Check if .env exists and has required configs
const envPath = path.join(currentDir, '.env');
const envExists = checkFile(envPath, '.env file');

if (envExists) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasGithubToken = envContent.includes('GITHUB_TOKEN=') && !envContent.includes('GITHUB_TOKEN=your');
    const hasOpenRouterKey = envContent.includes('OPENROUTER_API_KEY=') && !envContent.includes('OPENROUTER_API_KEY=your');
    
    if (hasGithubToken || hasOpenRouterKey) {
      console.log('✅ API credentials found in .env');
    } else {
      console.log('⚠️ API credentials may not be properly configured in .env');
    }
  } catch (err) {
    console.log(`❌ Error reading .env: ${err.message}`);
  }
}

// Suggest fixes based on diagnosis
console.log('\n\x1b[36m%s\x1b[0m', '💡 Suggestions:');

// Wrong directory fix
if (!packageJsonExists || !scriptsDirExists || !devJsExists) {
  console.log(`
  You may not be in the correct project directory.
  
  Try these steps:
  1. Clone the repository again:
     git clone https://github.com/MR-MK47/free-taskmaster.git
  
  2. Navigate to the correct directory:
     cd free-taskmaster
  
  3. Install dependencies:
     npm install
  `);
}

// Missing files fix
if (packageJsonExists && (!scriptsDirExists || !devJsExists || !modulesDirExists)) {
  console.log(`
  Some critical files are missing. Try:
  
  1. Pulling the latest version:
     git pull origin master
  
  2. Reinstalling dependencies:
     npm install
  `);
}

// Environment setup fix
if (!envExists) {
  console.log(`
  Your .env file is missing. Try:
  
  1. Creating a new .env file based on the example:
     cp .env.example .env
  
  2. Edit the .env file to add your API credentials
  `);
}

console.log('\n\x1b[36m%s\x1b[0m', '🚀 Next Steps:');
console.log(`
After fixing the issues, try running:
- npm run test-model  (to test if your setup works)
- npm run parse-prd -- scripts/example_prd.txt  (to test task generation)

For more help, see the Installation Guide: docs/INSTALLATION.md
`);

console.log('\x1b[36m%s\x1b[0m', '=========================================='); 
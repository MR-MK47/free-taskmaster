#!/usr/bin/env node

/**
 * Free Task Master Setup Script
 * Helps new users configure their environment 
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to ask a question and get user input
function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log(chalk.green.bold('\nFree Task Master Setup\n'));
  console.log(chalk.white('This script will help you set up Free Task Master with free AI models.\n'));
  
  try {
    // Check if .env already exists
    let envExists = false;
    try {
      await fs.access(path.join(__dirname, '.env'));
      envExists = true;
      console.log(chalk.yellow('An existing .env file was found. We will update it with your new settings.\n'));
    } catch (err) {
      // .env doesn't exist, which is fine
    }
    
    // Read the .env.example file as a template
    const envTemplate = await fs.readFile(path.join(__dirname, '.env.example'), 'utf8');
    
    // Ask which model they want to use
    const modelChoice = await askQuestion(chalk.cyan(
      'Which free AI model would you like to use?\n' +
      '1) GitHub DeepSeek (requires GitHub account)\n' +
      '2) Perplexity via OpenRouter (requires OpenRouter account)\n' +
      'Enter choice (1/2): '
    ));
    
    let envContent = envTemplate;
    
    if (modelChoice === '1') {
      console.log(chalk.white('\nYou selected GitHub DeepSeek.\n'));
      
      // Ask for GitHub token
      const githubToken = await askQuestion(chalk.cyan(
        'Please enter your GitHub personal access token (needs models:read scope):\n'
      ));
      
      // Update env content
      envContent = envContent.replace(/GITHUB_TOKEN=.*/, `GITHUB_TOKEN=${githubToken}`);
      envContent = envContent.replace(/USE_PERPLEXITY=.*/, 'USE_PERPLEXITY=false');
      
    } else if (modelChoice === '2') {
      console.log(chalk.white('\nYou selected Perplexity via OpenRouter.\n'));
      
      // Ask for OpenRouter API key
      const openrouterKey = await askQuestion(chalk.cyan(
        'Please enter your OpenRouter API key:\n'
      ));
      
      // Update env content
      envContent = envContent.replace(/OPENROUTER_API_KEY=.*/, `OPENROUTER_API_KEY=${openrouterKey}`);
      envContent = envContent.replace(/USE_PERPLEXITY=.*/, 'USE_PERPLEXITY=true');
      
      // Ask for site info for OpenRouter attribution
      const siteName = await askQuestion(chalk.cyan('Enter a site name for OpenRouter attribution (or press Enter for default): '));
      if (siteName) {
        envContent = envContent.replace(/SITE_NAME=.*/, `SITE_NAME=${siteName}`);
      }
      
    } else {
      console.log(chalk.red('\nInvalid choice. Using default (GitHub DeepSeek).\n'));
    }
    
    // Ask for project name
    const projectName = await askQuestion(chalk.cyan('\nEnter your project name (or press Enter for default): '));
    if (projectName) {
      envContent = envContent.replace(/PROJECT_NAME=.*/, `PROJECT_NAME=${projectName}`);
    }
    
    // Write the updated .env file
    await fs.writeFile(path.join(__dirname, '.env'), envContent);
    
    console.log(chalk.green.bold('\n✅ Setup complete!\n'));
    console.log(chalk.white('Your .env file has been created/updated with your settings.'));
    console.log(chalk.white('To test your configuration, run: npm run test-model'));
    console.log(chalk.white('To get started with task management, run: npm run parse-prd -- scripts/example_prd.txt\n'));
    
  } catch (error) {
    console.error(chalk.red('Error during setup:'), error.message);
  } finally {
    rl.close();
  }
}

// Run the setup function
setup(); 
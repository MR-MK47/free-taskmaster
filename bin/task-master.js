#!/usr/bin/env node

/**
 * Global CLI entry point for Task Master
 * Allows running commands like "task-master list" instead of "node scripts/dev.js list"
 */

import { runCLI } from '../scripts/modules/commands.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import chalk from 'chalk';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if .env exists, if not try to load from parent directory
const envPath = join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log(chalk.yellow('No .env file found in package directory. Using local .env if available.'));
}

// Handle version flag
if (process.argv.includes('-v') || process.argv.includes('--version')) {
  const packageJsonPath = join(__dirname, '..', 'package.json');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    console.log(`Free Task Master v${packageJson.version}`);
    process.exit(0);
  } catch (e) {
    console.log('Version information not available');
    process.exit(1);
  }
}

// Print welcome message for no arguments
if (process.argv.length <= 2) {
  console.log(chalk.green.bold('\nWelcome to Free Task Master! 🚀'));
  console.log(chalk.white('\nAvailable commands:'));
  console.log(chalk.gray(' - task-master list            List all tasks'));
  console.log(chalk.gray(' - task-master next            Show next task to work on'));
  console.log(chalk.gray(' - task-master show <id>       Show details of a specific task'));
  console.log(chalk.gray(' - task-master expand --id=<id> Break down a task into subtasks'));
  console.log(chalk.gray(' - task-master set-status --id=<id> --status=<status> Update task status'));
  console.log(chalk.gray(' - task-master analyze-complexity Analyze task complexity'));
  console.log(chalk.gray(' - task-master parse-prd <file> Generate tasks from requirements'));
  console.log(chalk.white('\nSee more options:'));
  console.log(chalk.gray(' - task-master --help          Show help for a specific command'));
  console.log(chalk.gray(' - task-master <command> --help Show help for a specific command\n'));
  process.exit(0);
}

// Run CLI with args
runCLI(process.argv); 
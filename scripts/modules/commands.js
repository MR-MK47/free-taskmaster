/**
 * commands.js - Main command module for Task Master
 * Coordinates commands and handles routing to appropriate handlers
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { createLLMClient } from './llm-client.js';

// Load environment variables
dotenv.config();

/**
 * Run the CLI with the provided arguments
 * @param {Array<string>} args - CLI arguments
 */
export function runCLI(args) {
  const program = new Command();
  
  program
    .name('task-master')
    .description('An AI-powered task management system for development')
    .version('1.0.0');

  // List command
  program
    .command('list')
    .description('List all tasks with their status')
    .option('-s, --status <status>', 'Filter by status')
    .option('--with-subtasks', 'Show subtasks for each task')
    .option('-f, --file <path>', 'Use alternative tasks.json file')
    .action(handleList);

  // Show command
  program
    .command('show')
    .description('Show detailed information about a task')
    .argument('[id]', 'Task ID to show')
    .option('--id <id>', 'Alternative way to specify task ID')
    .option('-f, --file <path>', 'Use alternative tasks.json file')
    .action(handleShow);

  // Next command
  program
    .command('next')
    .description('Show the next task to work on based on dependencies')
    .option('-f, --file <path>', 'Use alternative tasks.json file')
    .action(handleNext);

  // Expand command
  program
    .command('expand')
    .description('Expand a task with subtasks')
    .option('--id <id>', 'ID of task to expand')
    .option('--all', 'Expand all pending tasks')
    .option('--num <number>', 'Number of subtasks to generate')
    .option('--research', 'Use enhanced research capabilities (via OpenRouter)')
    .option('--prompt <text>', 'Additional context for subtask generation')
    .option('--force', 'Force regeneration of subtasks for tasks that already have them')
    .action(handleExpand);

  // Analyze-complexity command
  program
    .command('analyze-complexity')
    .description('Analyze task complexity and generate recommendations')
    .option('-o, --output <file>', 'Output file path')
    .option('-m, --model <model>', 'Override model to use')
    .option('-t, --threshold <number>', 'Minimum score for expansion recommendation')
    .option('-f, --file <path>', 'Use alternative tasks.json file')
    .option('-r, --research', 'Use enhanced research capabilities (via OpenRouter)')
    .action(handleAnalyzeComplexity);

  // Parse arguments and execute matching command
  program.parse(args);
}

/**
 * Handle list command
 */
function handleList(options) {
  console.log('Listing tasks...');
  // Implementation goes here
}

/**
 * Handle show command
 */
function handleShow(id, options) {
  const taskId = id || options.id;
  console.log(`Showing task ${taskId}...`);
  // Implementation goes here
}

/**
 * Handle next command
 */
function handleNext(options) {
  console.log('Finding next task...');
  // Implementation goes here
}

/**
 * Handle expand command with research flag support
 */
function handleExpand(options) {
  console.log('Expanding task...');
  
  // If research flag is enabled, temporarily set USE_PERPLEXITY=true
  let originalPerplexitySetting = null;
  if (options.research) {
    console.log('Research-backed expansion enabled via OpenRouter...');
    if (process.env.USE_PERPLEXITY !== 'true') {
      originalPerplexitySetting = process.env.USE_PERPLEXITY;
      process.env.USE_PERPLEXITY = 'true';
      console.log('Temporarily switching to Perplexity via OpenRouter for research...');
    }
  }
  
  try {
    // Get LLM client (will be Perplexity if research flag is set)
    const llmClient = createLLMClient();
    console.log(`Using LLM provider: ${llmClient.name}`);
    
    // Implementation goes here
    
    // Restore original setting if it was changed
    if (options.research && originalPerplexitySetting !== null) {
      process.env.USE_PERPLEXITY = originalPerplexitySetting;
      console.log('Restored original LLM provider setting');
    }
  } catch (error) {
    console.error('Error expanding task:', error.message);
    // Restore original setting if it was changed, even on error
    if (options.research && originalPerplexitySetting !== null) {
      process.env.USE_PERPLEXITY = originalPerplexitySetting;
    }
  }
}

/**
 * Handle analyze-complexity command with research flag support
 */
function handleAnalyzeComplexity(options) {
  console.log('Analyzing task complexity...');
  
  // If research flag is enabled, temporarily set USE_PERPLEXITY=true
  let originalPerplexitySetting = null;
  if (options.research) {
    console.log('Research-backed analysis enabled via OpenRouter...');
    if (process.env.USE_PERPLEXITY !== 'true') {
      originalPerplexitySetting = process.env.USE_PERPLEXITY;
      process.env.USE_PERPLEXITY = 'true';
      console.log('Temporarily switching to Perplexity via OpenRouter for research...');
    }
  }
  
  try {
    // Get LLM client (will be Perplexity if research flag is set)
    const llmClient = createLLMClient();
    console.log(`Using LLM provider: ${llmClient.name}`);
    
    // Implementation goes here
    
    // Restore original setting if it was changed
    if (options.research && originalPerplexitySetting !== null) {
      process.env.USE_PERPLEXITY = originalPerplexitySetting;
      console.log('Restored original LLM provider setting');
    }
  } catch (error) {
    console.error('Error analyzing task complexity:', error.message);
    // Restore original setting if it was changed, even on error
    if (options.research && originalPerplexitySetting !== null) {
      process.env.USE_PERPLEXITY = originalPerplexitySetting;
    }
  }
}

// Export other functions as needed 
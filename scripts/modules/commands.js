/**
 * commands.js - Main command module for Task Master
 * Coordinates commands and handles routing to appropriate handlers
 */

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { createLLMClient } from './llm-client.js';
import fs from 'fs/promises';
import path from 'path';

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

  // Parse PRD command
  program
    .command('parse-prd')
    .description('Parse a PRD file and generate initial tasks')
    .argument('<file>', 'Path to the PRD file')
    .action(handleParsePRD);

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

  // Set-status command
  program
    .command('set-status')
    .description('Update the status of a task')
    .option('--id <id>', 'ID of task to update (can be a subtask ID like "1.2")', String)
    .option('--status <status>', 'New status value (done, pending, deferred)', String)
    .option('-f, --file <path>', 'Use alternative tasks.json file')
    .action(handleSetStatus);

  // Parse arguments and execute matching command
  program.parse(args);
}

/**
 * Handle list command
 */
async function handleList(options) {
  try {
    console.log(chalk.blue('Listing tasks...'));
    
    // Read tasks.json
    const tasksPath = options.file || path.join(process.cwd(), 'tasks', 'tasks.json');
    const tasksData = JSON.parse(await fs.readFile(tasksPath, 'utf-8'));
    
    if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
      throw new Error('Invalid tasks.json format: missing tasks array');
    }
    
    // Filter tasks by status if specified
    let tasks = tasksData.tasks;
    if (options.status) {
      tasks = tasks.filter(task => task.status.toLowerCase() === options.status.toLowerCase());
    }
    
    if (tasks.length === 0) {
      console.log(chalk.yellow('\nNo tasks found.'));
      return;
    }
    
    // Print project info
    console.log(chalk.white.bold(`\n${tasksData.metadata?.projectName || 'Task Master Project'}`));
    console.log(chalk.gray(`Version: ${tasksData.metadata?.version || '1.0.0'}`));
    console.log(chalk.gray(`Generated: ${tasksData.metadata?.generatedAt || 'Unknown'}`));
    console.log(chalk.gray(`Provider: ${tasksData.metadata?.provider || 'Unknown'}\n`));
    
    // Print tasks
    tasks.forEach(task => {
      // Task status indicator
      const statusIcon = task.status === 'done' ? '✅' : 
                        task.status === 'pending' ? '⏳' : 
                        task.status === 'deferred' ? '⏸️' : '❔';
      
      // Task priority color
      const priorityColor = task.priority?.toLowerCase() === 'high' ? chalk.red :
                          task.priority?.toLowerCase() === 'medium' ? chalk.yellow :
                          task.priority?.toLowerCase() === 'low' ? chalk.green :
                          chalk.gray;
      
      // Print task header
      console.log(`${statusIcon} ${chalk.bold(`[${task.id}]`)} ${chalk.white(task.title)} ${priorityColor(`(${task.priority || 'unknown'})`)}`)
      
      // Print dependencies if any
      if (task.dependencies && task.dependencies.length > 0) {
        const deps = task.dependencies.map(depId => {
          const depTask = tasksData.tasks.find(t => t.id.toString() === depId.toString());
          const depStatus = depTask?.status === 'done' ? '✅' : '⏱️';
          return `${depStatus} ${depId}`;
        });
        console.log(chalk.gray(`   Dependencies: ${deps.join(', ')}`));
      }
      
      // Print description if available
      if (task.description) {
        console.log(chalk.gray(`   ${task.description}`));
      }
      
      // Print subtasks if requested and available
      if (options.withSubtasks && task.subtasks && task.subtasks.length > 0) {
        console.log(chalk.gray('   Subtasks:'));
        task.subtasks.forEach(subtask => {
          const subtaskStatus = subtask.status === 'done' ? '✅' : '⏳';
          console.log(chalk.gray(`   ${subtaskStatus} ${subtask.id}: ${subtask.title}`));
        });
      }
      
      console.log(''); // Empty line between tasks
    });
    
    // Print summary
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const deferredTasks = tasks.filter(t => t.status === 'deferred').length;
    
    console.log(chalk.white.bold('\nSummary:'));
    console.log(chalk.gray(`Total Tasks: ${totalTasks}`));
    console.log(chalk.green(`Completed: ${doneTasks}`));
    console.log(chalk.yellow(`Pending: ${pendingTasks}`));
    console.log(chalk.blue(`Deferred: ${deferredTasks}`));
    
    // Print next steps
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('1. Run `task-master next` to see the next task to work on'));
    console.log(chalk.gray('2. Run `task-master show <id>` to see detailed task information'));
    console.log(chalk.gray('3. Run `task-master expand --id=<id>` to break down a task into subtasks'));
    
  } catch (error) {
    console.error(chalk.red('\nError listing tasks:'), error.message);
    if (process.env.DEBUG?.toLowerCase() === 'true') {
      console.error(chalk.gray('\nDebug information:'));
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Handle show command
 */
async function handleShow(id, options) {
  try {
    const taskId = id || options.id;
    if (!taskId) {
      throw new Error('Task ID must be specified');
    }
    
    console.log(chalk.blue(`Showing task ${taskId}...`));
    
    // Read tasks.json
    const tasksPath = options.file || path.join(process.cwd(), 'tasks', 'tasks.json');
    const tasksData = JSON.parse(await fs.readFile(tasksPath, 'utf-8'));
    
    if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
      throw new Error('Invalid tasks.json format: missing tasks array');
    }
    
    // Handle subtask notation (e.g., "1.2" for subtask 2 of task 1)
    const [parentId, subtaskId] = taskId.toString().split('.');
    const parentTask = tasksData.tasks.find(t => t.id.toString() === parentId);
    
    if (!parentTask) {
      throw new Error(`Task ${parentId} not found`);
    }
    
    if (subtaskId) {
      // Show subtask
      if (!parentTask.subtasks || !Array.isArray(parentTask.subtasks)) {
        throw new Error(`Task ${parentId} has no subtasks`);
      }
      
      const subtask = parentTask.subtasks.find(s => s.id === taskId);
      if (!subtask) {
        throw new Error(`Subtask ${taskId} not found`);
      }
      
      // Print subtask details
      console.log(chalk.white.bold(`\nSubtask ${subtask.id}: ${subtask.title}`));
      console.log(chalk.gray(`Parent Task: ${parentTask.title}`));
      console.log(chalk.gray(`Status: ${subtask.status || 'pending'}`));
      
      if (subtask.description) {
        console.log(chalk.white('\nDescription:'));
        console.log(chalk.gray(subtask.description));
      }
      
      if (subtask.dependencies && subtask.dependencies.length > 0) {
        console.log(chalk.white('\nDependencies:'));
        subtask.dependencies.forEach(depId => {
          const [depParentId, depSubId] = depId.toString().split('.');
          const depParent = tasksData.tasks.find(t => t.id.toString() === depParentId);
          const dep = depSubId && depParent?.subtasks ? 
            depParent.subtasks.find(s => s.id === depId) :
            depParent;
            
          if (dep) {
            const status = dep.status === 'done' ? '✅' : '⏱️';
            console.log(chalk.gray(`${status} ${depId}: ${dep.title}`));
          } else {
            console.log(chalk.yellow(`⚠ ${depId}: Not found`));
          }
        });
      }
      
    } else {
      // Show parent task
      const task = parentTask; // for clarity
      
      // Print task header
      console.log(chalk.white.bold(`\nTask ${task.id}: ${task.title}`));
      
      // Print status with icon
      const statusIcon = task.status === 'done' ? '✅' : 
                        task.status === 'pending' ? '⏳' : 
                        task.status === 'deferred' ? '⏸️' : '❔';
      console.log(chalk.gray(`Status: ${statusIcon} ${task.status || 'pending'}`));
      
      // Print priority
      const priorityColor = task.priority?.toLowerCase() === 'high' ? chalk.red :
                           task.priority?.toLowerCase() === 'medium' ? chalk.yellow :
                           task.priority?.toLowerCase() === 'low' ? chalk.green :
                           chalk.gray;
      console.log(priorityColor(`Priority: ${task.priority || 'unknown'}`));
      
      // Print description
      if (task.description) {
        console.log(chalk.white('\nDescription:'));
        console.log(chalk.gray(task.description));
      }
      
      // Print dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        console.log(chalk.white('\nDependencies:'));
        task.dependencies.forEach(depId => {
          const depTask = tasksData.tasks.find(t => t.id.toString() === depId.toString());
          if (depTask) {
            const status = depTask.status === 'done' ? '✅' : '⏱️';
            console.log(chalk.gray(`${status} ${depId}: ${depTask.title}`));
          } else {
            console.log(chalk.yellow(`⚠ ${depId}: Not found`));
          }
        });
      }
      
      // Print subtasks
      if (task.subtasks && task.subtasks.length > 0) {
        console.log(chalk.white('\nSubtasks:'));
        task.subtasks.forEach(subtask => {
          const subtaskStatus = subtask.status === 'done' ? '✅' : '⏳';
          console.log(chalk.gray(`${subtaskStatus} ${subtask.id}: ${subtask.title}`));
          if (subtask.description) {
            console.log(chalk.gray(`   ${subtask.description}`));
          }
        });
      }
      
      // Print test strategy if available
      if (task.testStrategy) {
        console.log(chalk.white('\nTest Strategy:'));
        console.log(chalk.gray(task.testStrategy));
      }
    }
    
    // Print next steps
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('1. Run `task-master expand --id=<id>` to break down this task'));
    console.log(chalk.gray('2. Run `task-master set-status --id=<id> --status=<status>` to update status'));
    console.log(chalk.gray('3. Run `task-master list` to see all tasks'));
    
  } catch (error) {
    console.error(chalk.red('\nError showing task:'), error.message);
    if (process.env.DEBUG?.toLowerCase() === 'true') {
      console.error(chalk.gray('\nDebug information:'));
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Handle next command
 */
async function handleNext(options) {
  try {
    console.log(chalk.blue('Finding next task...'));
    
    // Read tasks.json
    const tasksPath = options.file || path.join(process.cwd(), 'tasks', 'tasks.json');
    const tasksData = JSON.parse(await fs.readFile(tasksPath, 'utf-8'));
    
    if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
      throw new Error('Invalid tasks.json format: missing tasks array');
    }
    
    // Get all pending tasks (explicitly check for status not being 'done')
    const pendingTasks = tasksData.tasks.filter(task => task.status !== 'done' && task.status !== 'deferred');
    
    if (pendingTasks.length === 0) {
      console.log(chalk.green('\n✨ All tasks are complete! ✨'));
      return;
    }
    
    // Find tasks with all dependencies satisfied
    const availableTasks = pendingTasks.filter(task => {
      // If no dependencies, task is available
      if (!task.dependencies || task.dependencies.length === 0) {
        return true;
      }
      
      // Check each dependency
      return task.dependencies.every(depId => {
        const depTask = tasksData.tasks.find(t => t.id.toString() === depId.toString());
        // Task is blocked if dependency doesn't exist or isn't done
        if (!depTask) {
          console.log(chalk.yellow(`Warning: Task ${task.id} depends on non-existent task ${depId}`));
          return false;
        }
        return depTask.status === 'done';
      });
    });
    
    if (availableTasks.length === 0) {
      console.log(chalk.yellow('\nNo tasks are currently available.'));
      console.log(chalk.gray('All pending tasks are blocked by incomplete dependencies.'));
      
      // Show blocked tasks and their dependencies
      console.log(chalk.white('\nBlocked Tasks:'));
      pendingTasks.forEach(task => {
        console.log(chalk.gray(`\n[${task.id}] ${task.title}`));
        if (task.dependencies && task.dependencies.length > 0) {
          console.log(chalk.gray('  Waiting for:'));
          task.dependencies.forEach(depId => {
            const depTask = tasksData.tasks.find(t => t.id.toString() === depId.toString());
            if (depTask) {
              const status = depTask.status === 'done' ? '✅' : '⏱️';
              console.log(chalk.gray(`  ${status} ${depId}: ${depTask.title}`));
            } else {
              console.log(chalk.yellow(`  ⚠ ${depId}: Task not found`));
            }
          });
        }
      });
      return;
    }
    
    // Sort available tasks by priority and dependencies
    const priorityScore = (priority) => {
      switch(priority?.toLowerCase()) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
      }
    };
    
    const nextTask = availableTasks.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityScore(b.priority) - priorityScore(a.priority);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by number of tasks that depend on this one
      const aDeps = tasksData.tasks.filter(t => 
        t.dependencies?.includes(a.id) && t.status !== 'done'
      ).length;
      const bDeps = tasksData.tasks.filter(t => 
        t.dependencies?.includes(b.id) && t.status !== 'done'
      ).length;
      if (bDeps !== aDeps) return bDeps - aDeps;
      
      // Finally by ID (lower first)
      return parseInt(a.id) - parseInt(b.id);
    })[0];
    
    // Print next task details
    console.log(chalk.white.bold(`\nNext Task: [${nextTask.id}] ${nextTask.title}`));
    
    const priorityColor = nextTask.priority?.toLowerCase() === 'high' ? chalk.red :
                         nextTask.priority?.toLowerCase() === 'medium' ? chalk.yellow :
                         nextTask.priority?.toLowerCase() === 'low' ? chalk.green :
                         chalk.gray;
    console.log(priorityColor(`Priority: ${nextTask.priority || 'unknown'}`));
    
    if (nextTask.description) {
      console.log(chalk.white('\nDescription:'));
      console.log(chalk.gray(nextTask.description));
    }
    
    // Show what tasks are blocked by this one
    const blockingTasks = tasksData.tasks.filter(t => 
      t.dependencies?.includes(nextTask.id) && t.status !== 'done'
    );
    if (blockingTasks.length > 0) {
      console.log(chalk.white('\nCompleting this will unblock:'));
      blockingTasks.forEach(task => {
        console.log(chalk.gray(`- [${task.id}] ${task.title}`));
      });
    }
    
    // Print next steps
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('1. Run `task-master show ' + nextTask.id + '` to see full task details'));
    console.log(chalk.gray('2. Run `task-master expand --id=' + nextTask.id + '` to break down this task'));
    console.log(chalk.gray('3. Run `task-master set-status --id=' + nextTask.id + ' --status=done` when complete'));
    
  } catch (error) {
    console.error(chalk.red('\nError finding next task:'), error.message);
    if (process.env.DEBUG?.toLowerCase() === 'true') {
      console.error(chalk.gray('\nDebug information:'));
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Handle expand command with research flag support
 */
async function handleExpand(options) {
  // Store original setting at the top level
  let originalPerplexitySetting = null;
  
  try {
    console.log(chalk.blue('Expanding task...'));
    
    // If research flag is enabled, temporarily set USE_PERPLEXITY=true
    if (options.research) {
      console.log('Research-backed expansion enabled via OpenRouter...');
      if (process.env.USE_PERPLEXITY !== 'true') {
        originalPerplexitySetting = process.env.USE_PERPLEXITY;
        process.env.USE_PERPLEXITY = 'true';
        console.log('Temporarily switching to Perplexity via OpenRouter for research...');
      }
    }
    
    // Get LLM client (will be Perplexity if research flag is set)
    const llmClient = createLLMClient();
    console.log(`Using LLM provider: ${llmClient.name}`);
    
    // Validate options
    if (!options.id && !options.all) {
      throw new Error('Either --id or --all must be specified');
    }
    
    // Read tasks.json
    const tasksPath = path.join(process.cwd(), 'tasks', 'tasks.json');
    const tasksData = JSON.parse(await fs.readFile(tasksPath, 'utf-8'));
    
    if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
      throw new Error('Invalid tasks.json format: missing tasks array');
    }
    
    // Find the task to expand
    const task = tasksData.tasks.find(t => t.id.toString() === options.id.toString());
    if (!task) {
      throw new Error(`Task with ID ${options.id} not found`);
    }
    
    // Skip if task already has subtasks and --force not specified
    if (task.subtasks && task.subtasks.length > 0 && !options.force) {
      console.log(chalk.yellow(`Task ${task.id} already has subtasks. Use --force to regenerate.`));
      return;
    }
    
    // Get complexity analysis for better subtask generation
    console.log(chalk.gray('\nAnalyzing task complexity...'));
    let analysis;
    try {
      analysis = await llmClient.analyzeComplexity(task);
    } catch (error) {
      console.log(chalk.yellow('\nWarning: Could not analyze task complexity. Using default values.'));
      analysis = {
        score: 5,
        reasoning: 'Complexity analysis failed, using default values',
        recommendedSubtasks: options.num || 3,
        expansionPrompt: 'Break down the task into logical subtasks'
      };
    }
    
    // Generate subtasks using the analysis
    const numSubtasks = options.num || analysis.recommendedSubtasks || 3;
    console.log(chalk.gray(`\nGenerating ${numSubtasks} subtasks...`));
    
    const prompt = `Break down this development task into ${numSubtasks} detailed subtasks.
Task: ${JSON.stringify(task)}
Complexity Analysis: ${JSON.stringify(analysis)}
${options.prompt ? `Additional Context: ${options.prompt}` : ''}

Return ONLY a JSON array of subtasks. Each subtask should have:
- id: string (parent.number format, e.g. "4.1")
- title: string
- description: string
- status: "pending"
- dependencies: array of other subtask IDs`;

    const response = await llmClient.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 500 // Reduced from 2000 to stay within token limits
    });

    try {
      // Clean and parse the response
      const cleanedResponse = response
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim();
      const subtasks = JSON.parse(cleanedResponse);
      
      // Validate subtasks format
      if (!Array.isArray(subtasks)) {
        throw new Error('Response must be an array of subtasks');
      }
      
      // Ensure each subtask has required fields
      subtasks.forEach((subtask, index) => {
        if (!subtask.id) subtask.id = `${task.id}.${index + 1}`;
        if (!subtask.status) subtask.status = 'pending';
        if (!subtask.dependencies) subtask.dependencies = [];
        if (!subtask.title || !subtask.description) {
          throw new Error(`Subtask ${index + 1} missing required fields (title or description)`);
        }
      });
      
      // Update the task with new subtasks
      task.subtasks = subtasks;
      
      // Save updated tasks.json
      await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2));
      
      // Print success message
      console.log(chalk.green(`\n✓ Successfully generated ${subtasks.length} subtasks for task ${task.id}`));
      console.log(chalk.gray('Subtasks:'));
      subtasks.forEach(subtask => {
        console.log(chalk.gray(`- ${subtask.id}: ${chalk.white(subtask.title)}`));
      });
      
      // Print next steps
      console.log(chalk.blue('\nNext steps:'));
      console.log(chalk.gray('1. Review the generated subtasks in tasks.json'));
      console.log(chalk.gray('2. Run `task-master list --with-subtasks` to see all tasks'));
      
    } catch (error) {
      throw new Error(`Failed to parse or validate subtasks: ${error.message}`);
    }
    
  } catch (error) {
    console.error(chalk.red('\nError expanding task:'), error.message);
    if (process.env.DEBUG?.toLowerCase() === 'true') {
      console.error(chalk.gray('\nDebug information:'));
      console.error(error);
    }
    process.exit(1);
  } finally {
    // Always restore original setting if it was changed
    if (options.research && originalPerplexitySetting !== null) {
      process.env.USE_PERPLEXITY = originalPerplexitySetting;
      console.log('Restored original LLM provider setting');
    }
  }
}

/**
 * Handle analyze-complexity command
 */
async function handleAnalyzeComplexity(options) {
  try {
    console.log(chalk.blue('Analyzing task complexity...'));
    
    // Get LLM client
    const llmClient = createLLMClient();
    console.log(`Using LLM provider: ${llmClient.name}`);
    
    // Read tasks.json
    const tasksPath = path.join(process.cwd(), 'tasks', 'tasks.json');
    const tasksData = JSON.parse(await fs.readFile(tasksPath, 'utf-8'));
    
    if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
      throw new Error('Invalid tasks.json format: missing tasks array');
    }
    
    // Analyze each task
    const analysisResults = [];
    for (const task of tasksData.tasks) {
      console.log(chalk.gray(`\nAnalyzing task ${task.id}: ${task.title}`));
      
      try {
        const analysis = await llmClient.analyzeComplexity(task);
        analysisResults.push({
          taskId: task.id,
          title: task.title,
          ...analysis
        });
        
        // Print immediate feedback with more detail
        const scoreColor = analysis.score >= 8 ? 'red' : analysis.score >= 5 ? 'yellow' : 'green';
        console.log(`${chalk.white('Score:')} ${chalk[scoreColor](analysis.score)}/10`);
        console.log(`${chalk.white('Reasoning:')} ${chalk.gray(analysis.reasoning)}`);
        console.log(`${chalk.white('Recommended subtasks:')} ${chalk.cyan(analysis.recommendedSubtasks)}`);
      } catch (error) {
        console.error(chalk.red(`\nError analyzing task ${task.id}:`), error.message);
        if (process.env.DEBUG?.toLowerCase() === 'true') {
          console.error(chalk.gray('Debug information:'));
          console.error(error);
        }
        analysisResults.push({
          taskId: task.id,
          title: task.title,
          error: error.message
        });
        // Continue with next task instead of stopping
        continue;
      }
    }
    
    // Save analysis report
    const reportPath = options.output || path.join(process.cwd(), 'scripts', 'task-complexity-report.json');
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        provider: llmClient.name,
        model: llmClient.modelName,
        threshold: options.threshold || 5
      },
      results: analysisResults
    };
    
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    const complexTasks = analysisResults.filter(r => r.score && r.score >= (options.threshold || 5));
    const failedTasks = analysisResults.filter(r => r.error);
    
    console.log(chalk.green(`\n✓ Analysis complete for ${analysisResults.length} tasks`));
    if (failedTasks.length > 0) {
      console.log(chalk.yellow(`⚠ ${failedTasks.length} tasks had errors during analysis`));
    }
    console.log(chalk.gray(`Analysis report saved to: ${reportPath}\n`));
    
    if (complexTasks.length > 0) {
      console.log(chalk.yellow(`Found ${complexTasks.length} complex tasks that may need breaking down:`));
      complexTasks.forEach(result => {
        console.log(chalk.gray(`- Task ${result.taskId}: ${result.title} (Score: ${result.score}/10)`));
      });
      
      console.log(chalk.blue('\nNext steps:'));
      console.log(chalk.gray('1. Review the full analysis in task-complexity-report.json'));
      console.log(chalk.gray('2. Run `task-master expand --id=<id>` to break down complex tasks'));
    }
    
  } catch (error) {
    console.error(chalk.red('\nError analyzing task complexity:'), error.message);
    if (process.env.DEBUG?.toLowerCase() === 'true') {
      console.error(chalk.gray('\nDebug information:'));
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Handle parse-prd command
 */
async function handleParsePRD(file) {
  try {
    console.log(chalk.blue(`Parsing PRD from ${file}...`));
    
    // Read the PRD file
    const prdContent = await fs.readFile(file, 'utf-8');
    
    // Get LLM client
    const llmClient = createLLMClient();
    console.log(`Using LLM provider: ${llmClient.name}`);
    
    // Generate tasks from PRD
    const response = await llmClient.generateTasks(prdContent);
    
    // Validate response structure
    if (!response || !response.tasks || !Array.isArray(response.tasks)) {
      throw new Error('Invalid response format: missing tasks array');
    }
    
    // Add metadata
    const tasksWithMetadata = {
      metadata: {
        generatedAt: new Date().toISOString(),
        provider: llmClient.name,
        model: llmClient.modelName,
        projectName: process.env.PROJECT_NAME || 'Task Master Project',
        version: '1.0.0'
      },
      tasks: response.tasks
    };
    
    // Save tasks to tasks.json
    const tasksPath = path.join(process.cwd(), 'tasks', 'tasks.json');
    
    // Ensure tasks directory exists
    await fs.mkdir(path.join(process.cwd(), 'tasks'), { recursive: true });
    
    // Write tasks file
    await fs.writeFile(tasksPath, JSON.stringify(tasksWithMetadata, null, 2));
    
    // Print success message with task summary
    console.log(chalk.green(`\n✓ Successfully generated ${response.tasks.length} tasks from PRD`));
    console.log(chalk.gray(`Tasks saved to: ${tasksPath}\n`));
    
    // Print task summary
    console.log(chalk.white.bold('Task Summary:'));
    const priorities = { high: 0, medium: 0, low: 0 };
    response.tasks.forEach(task => {
      priorities[task.priority.toLowerCase()]++;
      console.log(chalk.gray(`${task.id}. ${chalk.white(task.title)} (${chalk.yellow(task.priority)})`));
    });
    
    console.log('\nPriority Distribution:');
    console.log(chalk.red(`High: ${priorities.high}`));
    console.log(chalk.yellow(`Medium: ${priorities.medium}`));
    console.log(chalk.green(`Low: ${priorities.low}`));
    
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('1. Review the generated tasks in tasks/tasks.json'));
    console.log(chalk.gray('2. Run `task-master list` to see all tasks'));
    console.log(chalk.gray('3. Run `task-master analyze-complexity` to analyze task complexity'));
    
  } catch (error) {
    console.error(chalk.red('\nError parsing PRD:'), error.message);
    if (process.env.DEBUG?.toLowerCase() === 'true') {
      console.error(chalk.gray('\nDebug information:'));
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Handle set-status command
 */
async function handleSetStatus(options) {
  try {
    if (!options.id) {
      throw new Error('Task ID must be specified (--id=<id>)');
    }
    if (!options.status) {
      throw new Error('Status must be specified (--status=<status>)');
    }
    
    // Normalize status
    const status = options.status.toLowerCase();
    const validStatuses = ['done', 'pending', 'deferred'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    console.log(chalk.blue(`Updating task ${options.id} status to ${status}...`));
    
    // Read tasks.json
    const tasksPath = options.file || path.join(process.cwd(), 'tasks', 'tasks.json');
    const tasksData = JSON.parse(await fs.readFile(tasksPath, 'utf-8'));
    
    if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
      throw new Error('Invalid tasks.json format: missing tasks array');
    }
    
    // Handle subtask notation (e.g., "1.2" for subtask 2 of task 1)
    const [parentId, subtaskId] = options.id.toString().split('.');
    const parentTask = tasksData.tasks.find(t => t.id.toString() === parentId);
    
    if (!parentTask) {
      throw new Error(`Task ${parentId} not found`);
    }
    
    if (subtaskId) {
      // Update subtask status
      if (!parentTask.subtasks || !Array.isArray(parentTask.subtasks)) {
        throw new Error(`Task ${parentId} has no subtasks`);
      }
      
      const subtask = parentTask.subtasks.find(s => s.id === options.id);
      if (!subtask) {
        throw new Error(`Subtask ${options.id} not found`);
      }
      
      subtask.status = status;
      
      // If marking as done, check if all subtasks are done and update parent
      if (status === 'done' && parentTask.subtasks.every(s => s.status === 'done')) {
        parentTask.status = 'done';
        console.log(chalk.gray(`All subtasks complete - marking parent task ${parentId} as done`));
      }
      
    } else {
      // Update parent task status
      parentTask.status = status;
      
      // If marking as done, mark all subtasks as done
      if (status === 'done' && parentTask.subtasks && parentTask.subtasks.length > 0) {
        parentTask.subtasks.forEach(s => s.status = 'done');
        console.log(chalk.gray('All subtasks have been marked as done'));
      }
      
      // If marking as not done, warn if has done subtasks
      if (status !== 'done' && parentTask.subtasks && 
          parentTask.subtasks.some(s => s.status === 'done')) {
        console.log(chalk.yellow('Warning: Task has completed subtasks but is being marked as not done'));
      }
    }
    
    // Save updated tasks.json
    await fs.writeFile(tasksPath, JSON.stringify(tasksData, null, 2));
    
    // Print success message
    const statusIcon = status === 'done' ? '✅' : 
                      status === 'pending' ? '⏳' : 
                      status === 'deferred' ? '⏸️' : '❔';
    console.log(chalk.green(`\n✓ Successfully updated task status`));
    console.log(chalk.gray(`${statusIcon} Task ${options.id} is now ${status}`));
    
    // Print next steps
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('1. Run `task-master list` to see all tasks'));
    console.log(chalk.gray('2. Run `task-master next` to see the next task to work on'));
    
  } catch (error) {
    console.error(chalk.red('\nError updating task status:'), error.message);
    if (process.env.DEBUG?.toLowerCase() === 'true') {
      console.error(chalk.gray('\nDebug information:'));
      console.error(error);
    }
    process.exit(1);
  }
}

// Export other functions as needed 
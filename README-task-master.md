# Task Master Command Reference

This document provides a comprehensive reference for all commands available in Free Task Master.

## Basic Commands

### List Tasks

```bash
# List all tasks
task-master list

# List tasks with a specific status
task-master list --status=<status>

# List tasks with subtasks
task-master list --with-subtasks

# List tasks with a specific status and include subtasks
task-master list --status=<status> --with-subtasks
```

### Show Next Task

```bash
# Show the next task to work on based on dependencies and status
task-master next
```

### Show Specific Task

```bash
# Show details of a specific task
task-master show <id>
# or
task-master show --id=<id>

# View a specific subtask (e.g., subtask 2 of task 1)
task-master show 1.2
```

### Update Tasks

```bash
# Update tasks from a specific ID and provide context
task-master update --from=<id> --prompt="<prompt>"
```

### Generate Task Files

```bash
# Generate individual task files from tasks.json
task-master generate
```

### Set Task Status

```bash
# Set status of a single task
task-master set-status --id=<id> --status=<status>

# Set status for multiple tasks
task-master set-status --id=1,2,3 --status=<status>

# Set status for subtasks
task-master set-status --id=1.1,1.2 --status=<status>
```

When marking a task as "done", all of its subtasks will automatically be marked as "done" as well.

### Expand Tasks

```bash
# Expand a specific task with subtasks
task-master expand --id=<id> --num=<number>

# Expand with additional context
task-master expand --id=<id> --prompt="<context>"

# Expand all pending tasks
task-master expand --all

# Force regeneration of subtasks for tasks that already have them
task-master expand --all --force

# Research-backed subtask generation for a specific task
task-master expand --id=<id> --research

# Research-backed generation for all tasks
task-master expand --all --research
```

### Clear Subtasks

```bash
# Clear subtasks from a specific task
task-master clear-subtasks --id=<id>

# Clear subtasks from multiple tasks
task-master clear-subtasks --id=1,2,3

# Clear subtasks from all tasks
task-master clear-subtasks --all
```

### Analyze Task Complexity

```bash
# Analyze complexity of all tasks
task-master analyze-complexity

# Save report to a custom location
task-master analyze-complexity --output=my-report.json

# Set a custom complexity threshold (1-10)
task-master analyze-complexity --threshold=6

# Use an alternative tasks file
task-master analyze-complexity --file=custom-tasks.json

# Use Perplexity AI for research-backed complexity analysis
task-master analyze-complexity --research
```

### View Complexity Report

```bash
# Display the task complexity analysis report
task-master complexity-report

# View a report at a custom location
task-master complexity-report --file=my-report.json
```

### Managing Task Dependencies

```bash
# Add a dependency to a task
task-master add-dependency --id=<id> --depends-on=<id>

# Remove a dependency from a task
task-master remove-dependency --id=<id> --depends-on=<id>

# Validate dependencies without fixing them
task-master validate-dependencies

# Find and fix invalid dependencies automatically
task-master fix-dependencies
```

### Add a New Task

```bash
# Add a new task using AI
task-master add-task --prompt="Description of the new task"

# Add a task with dependencies
task-master add-task --prompt="Description" --dependencies=1,2,3

# Add a task with priority
task-master add-task --prompt="Description" --priority=high
```

## Feature Details

### Analyzing Task Complexity

The `analyze-complexity` command:

* Analyzes each task using AI to assess its complexity on a scale of 1-10
* Recommends optimal number of subtasks based on configured DEFAULT_SUBTASKS
* Generates tailored prompts for expanding each task
* Creates a comprehensive JSON report with ready-to-use commands
* Saves the report to scripts/task-complexity-report.json by default

The generated report contains:

* Complexity analysis for each task (scored 1-10)
* Recommended number of subtasks based on complexity
* AI-generated expansion prompts customized for each task
* Ready-to-run expansion commands directly within each task analysis

### Viewing Complexity Report

The `complexity-report` command:

* Displays a formatted, easy-to-read version of the complexity analysis report
* Shows tasks organized by complexity score (highest to lowest)
* Provides complexity distribution statistics (low, medium, high)
* Highlights tasks recommended for expansion based on threshold score
* Includes ready-to-use expansion commands for each complex task
* If no report exists, offers to generate one on the spot

### Smart Task Expansion

The `expand` command automatically checks for and uses the complexity report:

When a complexity report exists:

* Tasks are automatically expanded using the recommended subtask count and prompts
* When expanding all tasks, they're processed in order of complexity (highest first)
* Research-backed generation is preserved from the complexity analysis
* You can still override recommendations with explicit command-line options

Example workflow:

```bash
# Generate the complexity analysis report with research capabilities
task-master analyze-complexity --research

# Review the report in a readable format
task-master complexity-report

# Expand tasks using the optimized recommendations
task-master expand --id=8
# or expand all tasks
task-master expand --all
```

### Finding the Next Task

The `next` command:

* Identifies tasks that are pending/in-progress and have all dependencies satisfied
* Prioritizes tasks by priority level, dependency count, and task ID
* Displays comprehensive information about the selected task:  
   * Basic task details (ID, title, priority, dependencies)  
   * Implementation details  
   * Subtasks (if they exist)
* Provides contextual suggested actions:  
   * Command to mark the task as in-progress  
   * Command to mark the task as done  
   * Commands for working with subtasks

### Viewing Specific Task Details

The `show` command:

* Displays comprehensive details about a specific task or subtask
* Shows task status, priority, dependencies, and detailed implementation notes
* For parent tasks, displays all subtasks and their status
* For subtasks, shows parent task relationship
* Provides contextual action suggestions based on the task's state
* Works with both regular tasks and subtasks (using the format taskId.subtaskId)

## Best Practices for AI-Driven Development

1. **Start with a detailed PRD**: The more detailed your PRD, the better the generated tasks will be.
2. **Review generated tasks**: After parsing the PRD, review the tasks to ensure they make sense and have appropriate dependencies.
3. **Analyze task complexity**: Use the complexity analysis feature to identify which tasks should be broken down further.
4. **Follow the dependency chain**: Always respect task dependencies - the Cursor agent will help with this.
5. **Update as you go**: If your implementation diverges from the plan, use the update command to keep future tasks aligned with your current approach.
6. **Break down complex tasks**: Use the expand command to break down complex tasks into manageable subtasks.
7. **Regenerate task files**: After any updates to tasks.json, regenerate the task files to keep them in sync.
8. **Communicate context to the agent**: When asking the Cursor agent to help with a task, provide context about what you're trying to achieve.
9. **Validate dependencies**: Periodically run the validate-dependencies command to check for invalid or circular dependencies.

## Example Cursor AI Interactions

### Starting a new project

```
I've just initialized a new project with Free Task Master. I have a PRD at scripts/prd.txt.
Can you help me parse it and set up the initial tasks?
```

### Working on tasks

```
What's the next task I should work on? Please consider dependencies and priorities.
```

### Implementing a specific task

```
I'd like to implement task 4. Can you help me understand what needs to be done and how to approach it?
```

### Managing subtasks

```
I need to regenerate the subtasks for task 3 with a different approach. Can you help me clear and regenerate them?
```

### Handling changes

```
We've decided to use MongoDB instead of PostgreSQL. Can you update all future tasks to reflect this change?
```

### Completing work

```
I've finished implementing the authentication system described in task 2. All tests are passing.
Please mark it as complete and tell me what I should work on next.
```

### Analyzing complexity

```
Can you analyze the complexity of our tasks to help me understand which ones need to be broken down further?
```

### Viewing complexity report

```
Can you show me the complexity report in a more readable format?
``` 
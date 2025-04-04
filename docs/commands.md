# Free Task Master Commands

This document outlines all available commands in the Free Task Master system.

## Basic Commands

### List Tasks

List all tasks with their status:

```bash
npm run list
# or with options
node scripts/dev.js list --with-subtasks
```

Options:
- `--status=<status>`: Filter by status (e.g., "pending", "done", "deferred")
- `--with-subtasks`: Show subtasks under each main task
- `--file=<path>`: Use an alternative tasks.json file

### Show Task Details

Display detailed information about a specific task:

```bash
npm run show -- --id=1
# or directly
node scripts/dev.js show 1
```

Options:
- `--id=<id>`: ID of the task to show (can also be specified as the first argument)
- `--file=<path>`: Use an alternative tasks.json file

Note: You can view subtasks using dot notation (e.g., `show 1.2` for subtask 2 of task 1)

### Find Next Task

Show the next task to work on based on dependencies and priority:

```bash
npm run next
# or
node scripts/dev.js next
```

Options:
- `--file=<path>`: Use an alternative tasks.json file

### Update Task Status

Change the status of a task:

```bash
npm run set-status -- --id=1 --status=done
# or
node scripts/dev.js set-status --id=1 --status=done
```

Options:
- `--id=<id>`: ID of the task to update (required)
- `--status=<status>`: New status value (required)
- `--file=<path>`: Use an alternative tasks.json file

Valid status values: "done", "pending", "deferred"

## Task Generation

### Parse PRD

Generate tasks from a Product Requirements Document:

```bash
npm run parse-prd -- path/to/requirements.txt
# or
node scripts/dev.js parse-prd path/to/requirements.txt
```

This will:
1. Read the specified PRD file
2. Process it using the configured LLM
3. Generate a structured set of tasks in `tasks/tasks.json`
4. Create individual task files in the `tasks/` directory

### Expand Task

Break down a task into subtasks:

```bash
npm run expand -- --id=3
# or with options
node scripts/dev.js expand --id=3 --research
```

Options:
- `--id=<id>`: ID of the task to expand (required unless using --all)
- `--all`: Expand all pending tasks without subtasks
- `--num=<number>`: Number of subtasks to generate
- `--research`: Use Perplexity for research-backed generation
- `--prompt=<text>`: Additional context for subtask generation
- `--force`: Regenerate subtasks even if they already exist

## Analysis & Research

### Analyze Complexity

Analyze task complexity and provide recommendations:

```bash
npm run analyze-complexity
# or with options
node scripts/dev.js analyze-complexity --research
```

Options:
- `--output=<file>`: Output file path
- `--threshold=<number>`: Minimum score for expansion recommendation
- `--research`: Use Perplexity for research-backed analysis
- `--file=<path>`: Use an alternative tasks.json file

### Test Model

Verify your model configuration is working:

```bash
npm run test-model
```

This sends a simple test prompt to your configured LLM provider and displays the response time and content.

## Best Practices

1. **Start with parsing a PRD**: Begin by creating a requirements document and parsing it to generate initial tasks
2. **Check the next task regularly**: Use `npm run next` to always know what to work on
3. **Break down complex tasks**: Use `npm run expand -- --id=<id>` to make tasks more manageable
4. **Use research mode for complex tasks**: Add `--research` to leverage Perplexity's capabilities
5. **Mark tasks as done progressively**: Keep your task list up to date as you complete work
6. **Keep token limits low**: Configure `MAX_TOKENS=500` to stay within free tier limits

## Example Workflow

```bash
# Generate tasks from requirements
npm run parse-prd -- scripts/example_prd.txt

# List all tasks
npm run list

# Find the next task to work on
npm run next

# Break down the task if needed
npm run expand -- --id=1 --research

# Show detailed information
npm run show -- --id=1

# Mark as done when complete
npm run set-status -- --id=1 --status=done

# Find the next task again
npm run next
``` 
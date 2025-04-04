# Free Task Master Scripts

This directory contains the main scripts and modules for the Free Task Master system, an AI-powered task management tool that uses 100% free AI models.

## Main Components

- `dev.js`: The main entry point for the CLI
- `modules/`: Directory containing the modular components (see [modules/README.md](modules/README.md))
- `example_prd.txt`: An example Product Requirements Document to demonstrate task generation
- `PRD.txt`: The current project's requirements (if created)

## Available Commands

Run commands through npm scripts for convenience:

```bash
# List all tasks
npm run list

# Find the next task to work on
npm run next

# Show details of a task
npm run show -- --id=1

# Mark a task as complete
npm run set-status -- --id=1 --status=done

# Expand a task into subtasks
npm run expand -- --id=2

# Use research mode for expansion (uses Perplexity temporarily)
npm run expand -- --id=2 --research

# Generate tasks from a PRD
npm run parse-prd -- ./scripts/example_prd.txt

# Analyze task complexity
npm run analyze-complexity
```

You can also run commands directly:

```bash
node scripts/dev.js list
node scripts/dev.js next
node scripts/dev.js show --id=1
# etc...
```

## Using Free AI Models

This system is designed to work with entirely free AI models:

1. **GitHub DeepSeek**: Uses your GitHub token to access DeepSeek models
2. **Perplexity via OpenRouter**: Uses the free tier of OpenRouter for Perplexity

See the [.env.example](../.env.example) file for configuration options.

## Testing Your Model Configuration

To verify your model setup is working correctly:

```bash
npm run test-model
```

This will send a simple test prompt to your configured LLM provider and display the response time and content.

## Creating Custom PRDs

Use the example_prd.txt as a template to create your own PRD files. The system works best with structured requirements that include:

- Project overview/description
- Core features and functionality
- Technical requirements
- Development phases

See the example PRD for the recommended format.
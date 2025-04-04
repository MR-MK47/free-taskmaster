# Task Master AI

A task management system powered by AI. This system helps developers break down complex projects into manageable tasks, track progress, and maintain documentation—all with the assistance of AI.

## Features

- **AI-Powered Task Generation**: Convert project requirements into structured tasks
- **Dependency Management**: Track relationships between tasks
- **Task Expansion**: Break down complex tasks into smaller subtasks
- **Progress Tracking**: Monitor project completion status
- **Multi-Model Support**: Uses GitHub DeepSeek or Perplexity via OpenRouter
- **Command-Line Interface**: Simple, intuitive commands for task management

## Requirements

- Node.js v14+
- GitHub API key for DeepSeek integration OR OpenRouter API key for Perplexity
- Free or paid API access options available

## Installation

```bash
git clone https://github.com/yourusername/task-master.git
cd task-master
npm install
cp .env.example .env
# Edit .env with your API keys
```

## Configuration

Required environment variables (in `.env`):
- For DeepSeek: `GITHUB_TOKEN`: Your GitHub personal access token
- For Perplexity: `OPENROUTER_API_KEY`: Your OpenRouter API key
- Model Selection: `USE_PERPLEXITY`: Set to "true" for Perplexity, "false" for DeepSeek

Optional environment variables:
- `DEEPSEEK_ENDPOINT`: Azure AI Inference endpoint (default: "https://models.inference.ai.azure.com")
- `DEEPSEEK_MODEL`: DeepSeek model name (default: "DeepSeek-V3")
- `PERPLEXITY_MODEL`: Perplexity model via OpenRouter (default: "perplexity/sonar")
- `MAX_TOKENS`: Maximum tokens for model responses (default: "2000")
- `TEMPERATURE`: Temperature for model responses (default: "0.7")
- `DEBUG`: Set to "true" to enable debug logging (default: "false")

## Usage

### Basic Commands

```bash
# Initialize and parse requirements
node scripts/dev.js parse-prd --input=requirements.txt

# List all tasks
node scripts/dev.js list

# View details of a specific task
node scripts/dev.js show --id=3

# Mark a task as complete
node scripts/dev.js set-status --id=3 --status=done

# Expand a task into subtasks
node scripts/dev.js expand --id=3 --subtasks=5
```

### Advanced Features

```bash
# Analyze task complexity
node scripts/dev.js analyze-complexity

# Add research capabilities to task generation
node scripts/dev.js expand --id=3 --research

# Generate documentation
node scripts/dev.js generate-docs

# Update task dependencies
node scripts/dev.js update --from=5 --prompt="Using MongoDB instead of PostgreSQL"
```

## Model Options

### DeepSeek (Default)
- Excellent for code generation and technical tasks
- Uses GitHub authentication and Azure AI Inference
- See [DeepSeek Integration Guide](docs/github-deepseek-setup.md)

### Perplexity via OpenRouter
- Strong research capabilities and factual accuracy
- Free tier available through OpenRouter
- Used for both standard task processing (when `USE_PERPLEXITY=true`) and the `--research` flag
- See [Perplexity Integration Guide](docs/perplexity-setup.md)

## Documentation

For more detailed information, see the following documentation:

- [DeepSeek Integration Guide](docs/github-deepseek-setup.md)
- [Perplexity Integration Guide](docs/perplexity-setup.md)
- [Task Management Commands](docs/commands.md)
- [Customizing Task Templates](docs/templates.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
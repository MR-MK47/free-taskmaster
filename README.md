# Free Task Master

A completely free AI-powered task management system for developers. Break down complex projects into manageable tasks, track progress, and maintain documentation—all without spending a dime on API costs.

## 🚀 Features

- **100% Free**: Uses free tier AI models with no credit card required
- **Multi-Model Support**: Choice of GitHub DeepSeek or Perplexity via OpenRouter
- **AI-Powered Task Generation**: Convert requirements into structured tasks
- **Dependency Management**: Track relationships between tasks
- **Task Expansion**: Break down complex tasks into manageable subtasks
- **Complexity Analysis**: Identify which tasks need further breakdown
- **Research-Backed Generation**: Use Perplexity's capabilities for research-intensive tasks

## 🔑 Requirements

- Node.js v14+
- One of the following free accounts:
  - GitHub account (for DeepSeek integration)
  - OpenRouter account (for Perplexity integration)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/MR-MK47/free-taskmaster.git
cd free-taskmaster

# Install dependencies
npm install

# Set up configuration
npm run setup
# Or manually configure your .env file
```

## ⚙️ Configuration

Configure your `.env` file with one of these free options:

### Option 1: GitHub DeepSeek (Default)
1. Create a GitHub Personal Access Token with `models:read` permission
2. Add to your `.env`:
   ```
   GITHUB_TOKEN=your_github_token
   USE_PERPLEXITY=false
   ```

### Option 2: Perplexity via OpenRouter
1. Sign up for free OpenRouter account
2. Get your API key from openrouter.ai
3. Add to your `.env`:
   ```
   OPENROUTER_API_KEY=your_openrouter_key
   USE_PERPLEXITY=true
   ```

## 🛠️ Usage

### Initializing a Project

```bash
# Parse a requirements document to generate tasks
npm run parse-prd -- scripts/example_prd.txt

# Or use your own PRD file
npm run parse-prd -- path/to/your/requirements.txt
```

### Managing Tasks

```bash
# List all tasks
npm run list

# See which task to work on next
npm run next

# Show details of a specific task
npm run show -- --id=3

# Mark a task as complete
npm run set-status -- --id=3 --status=done

# Expand a task into subtasks
npm run expand -- --id=3

# Use Perplexity for research-backed expansion (regardless of default model)
npm run expand -- --id=3 --research
```

### Advanced Features

```bash
# Analyze task complexity
npm run analyze-complexity

# Test your model configuration
npm run test-model
```

## 🔄 Switching Between Models

You can easily switch between free models:

1. **DeepSeek**: Set `USE_PERPLEXITY=false` in `.env` (default)
2. **Perplexity**: Set `USE_PERPLEXITY=true` in `.env`

Or use Perplexity temporarily with the `--research` flag for any command:
```bash
npm run expand -- --id=3 --research
```

## 📚 Documentation

- **Task Structure**: Tasks are saved in `tasks/tasks.json` and individual task files
- **Custom PRDs**: Write your requirements in plain text (see `scripts/example_prd.txt`)
- **Free Tier Limits**: Keep `MAX_TOKENS=500` in your `.env` to stay within free tier
- **Complete Command Reference**: See [README-task-master.md](README-task-master.md) for the full command reference

## 👥 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

This project is a free alternative version of the [claude-task-master](https://github.com/eyaltoledano/claude-task-master) project by Eyal Toledano. The original project uses Claude AI, whereas this version has been adapted to work with completely free AI models.

---

**Note**: This is a community-maintained free version of the original Task Master AI project, focused on making AI-powered development workflows accessible to everyone at no cost.
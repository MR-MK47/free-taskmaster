# Task Master Modules

This directory contains modular components for the free Task Master system that enable using entirely free AI models.

## Overview of Components

- `commands.js`: Main CLI command routing and coordination
- `llm-client.js`: LLM provider adapters for free model options
- `test-model.js`: Utility script to test your model configuration

## Free LLM Adapter System

The LLM adapter system provides a unified interface to work with multiple free language model providers:

1. **GitHub DeepSeek**: Uses the GitHub token authentication to access free DeepSeek AI models
2. **Perplexity via OpenRouter**: Uses the free tier of OpenRouter to access Perplexity models

### How to Use Different Free Providers

Configure your `.env` file to select which free provider to use:

```
# Use GitHub DeepSeek (default)
USE_PERPLEXITY=false
GITHUB_TOKEN=your-github-token-here

# Or use Perplexity via OpenRouter
USE_PERPLEXITY=true
OPENROUTER_API_KEY=your-openrouter-api-key-here
PERPLEXITY_MODEL=perplexity/sonar
```

The system will automatically switch between providers based on the `USE_PERPLEXITY` flag.

### Adapter Interface

Each adapter implements a consistent interface:

- `name`: Provider name identifier
- `modelName`: Currently selected model identifier
- `generateText(prompt, options)`: Generate text based on a prompt
- `generateTasks(prdContent)`: Generate tasks from PRD content
- `analyzeComplexity(task)`: Analyze task complexity and provide recommendations

### Adding New Free Providers

To add a new free provider:

1. Create a new adapter class in `llm-client.js`
2. Implement all required interface methods
3. Update the provider selection logic in `createLLMClient()`
4. Update the `.env.example` file with appropriate configuration settings

### Research Mode

For tasks requiring research capabilities, you can use the `--research` flag with commands:

```bash
npm run expand -- --id=3 --research
```

This temporarily uses Perplexity (which has strong research capabilities) even if your default is set to DeepSeek. 
# Task Master Modules

This directory contains modular components for the Task Master system. These components separate concerns and improve maintainability.

## Overview of Components

- `commands.js`: Main CLI command routing and coordination
- `llm-client.js`: LLM provider adapters for multi-model support

## LLM Adapter System

The LLM adapter system provides a unified interface to work with multiple language model providers:

1. **Anthropic Claude**: Default provider, provides powerful reasoning capabilities
2. **GitHub DeepSeek**: Alternative provider available through GitHub's Marketplace API

### How to Use Different Providers

Configure your `.env` file to select which provider to use:

```
# Use Claude (default)
USE_DEEPSEEK=false
ANTHROPIC_API_KEY=your-api-key-here

# Or use GitHub DeepSeek
USE_DEEPSEEK=true
GITHUB_API_KEY=your-github-api-key-here
DEEPSEEK_MODEL=azureml-deepseek/DeepSeek-V3
```

The system will automatically switch between providers based on the `USE_DEEPSEEK` flag.

### Adapter Interface

Each adapter must implement the following interface:

- `type`: Provider type identifier
- `model`: Currently selected model identifier
- `generateText(prompt, options)`: Method to generate text based on a prompt

### Adding New Providers

To add a new provider:

1. Create a new adapter function in `llm-client.js`
2. Add the provider type to `PROVIDER_TYPES`
3. Update the provider selection logic in `createLLMClient()`
4. Update the `.env` file with appropriate configuration settings 
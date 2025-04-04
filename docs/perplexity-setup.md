# Using Perplexity with Task Master

Task Master supports using Perplexity models via OpenRouter as an alternative to GitHub DeepSeek. This guide explains how to set up and use Perplexity models.

## Prerequisites

1. An OpenRouter account
2. An OpenRouter API key with access to Perplexity models
3. Basic understanding of API usage

## Setup Instructions

### 1. Get an OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai) and create an account
2. Navigate to your API Keys section
3. Create a new API key and save it securely

### 2. Configure Task Master

Update your `.env` file with OpenRouter and Perplexity specific settings:

```
# Authentication
OPENROUTER_API_KEY=your-openrouter-api-key-here

# LLM Provider Configuration
USE_PERPLEXITY=true  # Set to 'true' to use Perplexity instead of DeepSeek

# Perplexity Configuration
PERPLEXITY_MODEL=perplexity/sonar  # Model name for Perplexity
SITE_URL=https://your-site-url.com  # For OpenRouter attribution
SITE_NAME=Your Site Name  # For OpenRouter attribution

# Common Model Configuration
MAX_TOKENS=2000  # Maximum tokens for model responses (reduced for free tier)
TEMPERATURE=0.7  # Temperature for model responses (0.0-1.0)

# App Configuration
DEBUG=true  # Set to true for debugging, false for production
```

### 3. Install Required Dependencies

The Perplexity integration uses the OpenAI SDK to communicate with OpenRouter. Make sure you have the required dependencies installed:

```bash
npm install openai
```

### 4. Test the Configuration

Run the test script to verify the Perplexity model is working correctly:

```bash
npm run test-model
```

When running with debug mode enabled (`DEBUG=true`), you'll see confirmation that the Perplexity provider is being used:

```
DEBUG - USE_PERPLEXITY env var: "true"
DEBUG - usePerplexity evaluated to: true
DEBUG - Using LLM provider: perplexity
DEBUG - Using model: perplexity/sonar-pro
```

## Available Perplexity Models

Through OpenRouter, you can access different Perplexity models:

- `perplexity/sonar-pro` - Recommended for most use cases
- `perplexity/sonar` - More accessible but less powerful
- `perplexity/sonar-pro-online` - Online search capability (if available)
- `perplexity/sonar-online` - Basic model with online search capability

You can specify which model to use in your `.env` file with the `PERPLEXITY_MODEL` setting.

## Free Tier Considerations

If you're using the free tier of OpenRouter, keep these points in mind:

1. **Token Limits**: The system limits max_tokens to 2000 to avoid credit issues
2. **Automatic Fallback**: If Perplexity fails, the system will automatically fall back to DeepSeek
3. **Credit System**: Monitor your OpenRouter dashboard to check your remaining credits
4. **Model Selection**: Consider using `perplexity/sonar` instead of `sonar-pro` for more efficient credit usage

## Using the Research Flag

The `--research` flag in commands like `expand` and `analyze-complexity` now uses Perplexity via OpenRouter for enhanced research capabilities. To use this feature:

1. Make sure your OpenRouter API key is configured
2. Set `USE_PERPLEXITY` to `true` in your `.env` file (temporarily, if you normally prefer DeepSeek)
3. Use commands with the `--research` flag:

```bash
# Generate research-backed subtasks
task-master expand --id=3 --research

# Perform research-backed complexity analysis
task-master analyze-complexity --research
```

This provides improved contextual understanding and more informed results for your tasks without requiring a separate API key.

## Rate Limits and Pricing

OpenRouter operates on a credit system. Check your OpenRouter dashboard for current pricing and rate limits for Perplexity models.

The free tier typically includes some free credits to get started, which makes it an excellent choice for testing and small projects.

## Troubleshooting

If you encounter issues with Perplexity integration:

1. **Authentication errors**: Verify your OpenRouter API key is correct
2. **Model access errors**: Ensure you have access to the Perplexity models through OpenRouter
3. **Credit limit errors**: Check your OpenRouter dashboard for available credits
4. **OpenAI SDK errors**: Make sure you're using OpenAI SDK version 4.28.0 or newer

## Model Capabilities

Perplexity Sonar models excel at:

- Research-based responses
- Fact checking and verification
- Up-to-date information (when using online variants)
- Natural language understanding

The models are particularly useful for tasks requiring factual accuracy and current information.

## Switching Between Models

You can easily switch between DeepSeek and Perplexity by changing the `USE_PERPLEXITY` environment variable:

- Set `USE_PERPLEXITY=true` to use Perplexity via OpenRouter
- Set `USE_PERPLEXITY=false` to use GitHub DeepSeek

This flexibility allows you to choose the best model for your specific needs.

## Implementation Details

The Perplexity integration uses the official OpenAI SDK to communicate with OpenRouter, following the recommended approach from the OpenRouter documentation. This provides the most reliable and well-supported integration method.

## References

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Perplexity Models on OpenRouter](https://openrouter.ai/docs#models)
- [OpenRouter API Reference](https://openrouter.ai/docs/api-reference)
- [OpenAI SDK Documentation](https://github.com/openai/openai-node) 
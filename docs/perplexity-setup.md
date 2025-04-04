# Perplexity Setup Guide

This guide will help you set up Perplexity integration for Free Task Master using OpenRouter's free tier. Perplexity offers strong research capabilities and factual accuracy.

## Step 1: Create an OpenRouter Account

1. Go to https://openrouter.ai and sign up for a free account
2. After signing up, navigate to the API Keys section
3. Create a new API key with a name like "Task Master"
4. Copy your API key for the next step

## Step 2: Configure Your Environment

1. Open your `.env` file in the Task Master project
2. Add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
3. Enable Perplexity as the default provider:
   ```
   USE_PERPLEXITY=true
   ```
4. Configure the Perplexity model:
   ```
   PERPLEXITY_MODEL=perplexity/sonar
   ```
5. (Optional) Set OpenRouter attribution:
   ```
   SITE_URL=https://your-website.com
   SITE_NAME=Your Project Name
   ```

## Step 3: Verify Your Setup

Run the test-model script to verify your setup is working correctly:

```bash
npm run test-model
```

You should see output indicating that the Perplexity model is being used and a response to the test prompt.

## Free Tier Limitations

OpenRouter provides a free credit allowance for new accounts. To maximize your free usage:

1. Use the `perplexity/sonar` model (not sonar-pro) for better credit efficiency
2. Keep `MAX_TOKENS=500` in your configuration
3. For complex expansions, consider breaking them into multiple smaller requests

## Using Perplexity for Research

Even if you prefer using DeepSeek as your default, you can use Perplexity for specific tasks that benefit from its research capabilities:

```bash
# Use the --research flag with any command
npm run expand -- --id=3 --research
npm run analyze-complexity -- --research
```

This will temporarily switch to Perplexity for that specific command, then switch back to your default provider.

## Troubleshooting

If you encounter any issues:

1. **Credit Check**: Verify you have credits remaining on your OpenRouter account
2. **Token Validation**: Ensure your API key is correctly copied without extra spaces
3. **Debug Mode**: Set `DEBUG=true` in your `.env` file for more detailed logs
4. **Fallback**: If Perplexity fails, the system will automatically try to fall back to DeepSeek if configured

## Advanced Configuration

- `PERPLEXITY_MODEL`: Which model to use (`perplexity/sonar` is recommended for free tier)
- `MAX_TOKENS`: Token generation limit (keep at 500 or less for free tier)
- `TEMPERATURE`: Creativity setting (default: 0.7)

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
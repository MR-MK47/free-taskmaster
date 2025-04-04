# GitHub DeepSeek Setup Guide

This guide will help you set up GitHub DeepSeek integration for Free Task Master. The GitHub DeepSeek option uses the GitHub API to access DeepSeek models completely for free.

## Step 1: Create a GitHub Personal Access Token

1. Go to your GitHub account settings at https://github.com/settings/tokens
2. Click "Generate new token" > "Generate new token (classic)"
3. Give your token a name (e.g., "Task Master DeepSeek")
4. Select the `models:read` scope (under "AI features")
5. Click "Generate token"
6. **Important**: Copy your token immediately as you won't be able to see it again

## Step 2: Configure Your Environment

1. Open your `.env` file in the Task Master project
2. Add your GitHub token:
   ```
   GITHUB_TOKEN=your_github_token_here
   ```
3. Make sure DeepSeek is set as the default provider:
   ```
   USE_PERPLEXITY=false
   ```
4. Configure the DeepSeek model (the defaults should work):
   ```
   DEEPSEEK_ENDPOINT=https://models.inference.ai.azure.com
   DEEPSEEK_MODEL=DeepSeek-V3
   ```

## Step 3: Verify Your Setup

Run the test-model script to verify your setup is working correctly:

```bash
npm run test-model
```

You should see output indicating that the DeepSeek model is being used and a response to the test prompt.

## Troubleshooting

If you encounter any issues:

1. **Token Permissions**: Make sure your GitHub token has the `models:read` scope
2. **Token Validation**: Ensure your token is correctly copied without any extra spaces
3. **Debug Mode**: Set `DEBUG=true` in your `.env` file for more detailed logs
4. **Model Endpoint**: If you get endpoint errors, check if the default endpoint is still current

## Usage Notes

- The DeepSeek integration works well for code-focused tasks
- For research-intensive tasks, consider using the `--research` flag to temporarily use Perplexity
- Token limits are handled automatically to stay within free tier limits

## Advanced Configuration

If you need to customize the DeepSeek integration further, you can modify:

- `DEEPSEEK_MODEL`: DeepSeek model version to use (default: "DeepSeek-V3")
- `MAX_TOKENS`: Token generation limit (default: 500)
- `TEMPERATURE`: Creativity setting (default: 0.7)

## Prerequisites

1. A GitHub account
2. A GitHub Personal Access Token with `models:read` permission
3. Permission to use the DeepSeek V3 model through Azure AI Inference

## Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to your GitHub settings → Developer settings → Personal access tokens
2. Create a new token with the `models:read` permission
3. Save the token securely - you'll need it for configuration

### 2. Configure Task Master

Update your `.env` file with GitHub and DeepSeek specific settings:

```
# Authentication
GITHUB_TOKEN=your-github-token-here  # Your GitHub token with models:read permission

# DeepSeek Configuration  
DEEPSEEK_ENDPOINT=https://models.inference.ai.azure.com  # Azure AI Inference endpoint 
DEEPSEEK_MODEL=DeepSeek-V3  # Model name for DeepSeek
MAX_TOKENS=4000  # Maximum tokens for model responses
TEMPERATURE=0.7  # Temperature for model responses (0.0-1.0)

# App Configuration
DEBUG=true  # Set to true for debugging, false for production
```

### 3. Install Required Dependencies

Ensure you have the required dependencies installed:

```bash
npm install @azure-rest/ai-inference @azure/core-auth
```

### 4. Test the Configuration

Run the test script to verify the DeepSeek model is working correctly:

```bash
npm run test-model
```

When running with debug mode enabled (`DEBUG=true`), you'll see confirmation that the DeepSeek provider is being used:

```
DEBUG - Creating LLM client for DeepSeek
DEBUG - Using LLM provider: github_deepseek
```

## Rate Limits and Performance

The GitHub free tier has rate limits for AI model usage. For production applications or to go beyond these limits, you can provision resources from an Azure account and authenticate from there instead of using your GitHub personal access token. The code will work the same way.

## Troubleshooting

If you encounter issues with DeepSeek integration:

1. **Authentication errors**: Verify your GitHub token is correct and has the `models:read` permission
2. **Model access errors**: Ensure you have access to the DeepSeek V3 model 
3. **Dependency errors**: Make sure you've installed the `@azure-rest/ai-inference` and `@azure/core-auth` packages
4. **API format errors**: The Azure AI Inference SDK format may change; check the latest documentation for updates

## Model Capabilities

DeepSeek V3 is a powerful language model that excels at:

- Code generation and analysis
- Technical reasoning
- Task planning and organization
- Problem-solving

The performance is comparable to other modern large language models, making it an excellent choice for task management and project planning.

## References

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Azure AI Inference Documentation](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/inference-clients)
- [DeepSeek V3 Model](https://github.com/marketplace/models/azureml-deepseek/DeepSeek-V3) 
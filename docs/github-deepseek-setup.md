# Using DeepSeek V3 with Task Master

Task Master now uses the DeepSeek V3 model through Azure AI Inference as its primary LLM provider. This guide explains how to set up and use the model.

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
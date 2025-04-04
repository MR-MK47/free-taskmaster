# Model Adapter System for Task Master

This PR adds support for using the DeepSeek V3 model from GitHub Marketplace as an alternative to Claude.

## Changes

- Added a modular LLM client adapter system in `scripts/modules/`
- Implemented adapters for both Anthropic Claude and GitHub DeepSeek
- Added configuration options to switch between providers
- Updated documentation with setup and usage instructions

## Testing Checklist

- [ ] Test with Claude (default configuration)
- [ ] Test with DeepSeek (set `USE_DEEPSEEK=true` in `.env`)
- [ ] Verify proper error handling when API keys are missing
- [ ] Verify model configuration options work correctly

## Configuration

The system uses a new environment variable `USE_DEEPSEEK` to determine which provider to use:

```
# Use Claude (default)
USE_DEEPSEEK=false

# Use GitHub DeepSeek
USE_DEEPSEEK=true
GITHUB_API_KEY=your-github-api-key
```

## Documentation

- Added `docs/github-deepseek-setup.md` with detailed setup instructions
- Added `scripts/modules/README.md` explaining the adapter architecture

## Related Issues

Closes #<issue_number> 
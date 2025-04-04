# Free Task Master Installation Guide

This guide will help you correctly install and run the Free Task Master system.

## Prerequisites

- Node.js v14 or higher
- One of the following free accounts:
  - GitHub account (for DeepSeek integration)
  - OpenRouter account (for Perplexity integration)

## Installation Steps

1. **Clone the repository correctly**

   ```bash
   git clone https://github.com/MR-MK47/free-taskmaster.git
   cd free-taskmaster
   ```

   > **IMPORTANT**: Make sure you're in the correct directory. All commands should be run from the root of the project.

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up configuration**

   Run the setup script:
   ```bash
   npm run setup
   ```

   Or manually configure by:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your preferred settings.

4. **Verify the installation**

   Run a simple test to make sure your model is properly configured:
   ```bash
   npm run test-model
   ```

## Common Issues and Solutions

### File Not Found Error

If you get an error like:
```
Error: Cannot find module '<path>/scripts/dev.js'
```

This usually means:
1. You're not in the correct directory. Make sure you're in the root of the project.
2. The files are missing. Try reinstalling from the repository.

### Correct Directory Structure

Your directory structure should look like this:
```
free-taskmaster/
├── scripts/
│   ├── dev.js
│   ├── modules/
│   │   ├── commands.js
│   │   ├── llm-client.js
│   │   └── test-model.js
│   └── example_prd.txt
├── tasks/
├── bin/
├── package.json
└── .env
```

### Environment Variables

Make sure you have ONE of these configurations in your `.env` file:

**For GitHub DeepSeek (Default):**
```
GITHUB_TOKEN=your_github_token
USE_PERPLEXITY=false
```

**For Perplexity via OpenRouter:**
```
OPENROUTER_API_KEY=your_openrouter_key
USE_PERPLEXITY=true
```

## Basic Usage After Installation

To parse a PRD and generate tasks:
```bash
npm run parse-prd -- scripts/example_prd.txt
```

To list all tasks:
```bash
npm run list
```

## Contact & Support

If you're still having issues, please open an issue on the GitHub repository with:
1. Your operating system details
2. Node.js version (`node -v`)
3. The exact error message
4. Steps you've already tried 
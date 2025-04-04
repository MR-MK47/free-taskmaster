/**
 * llm-client.js - LLM client adapter module
 * Provides a unified interface for LLM providers (GitHub DeepSeek and Perplexity via OpenRouter)
 */

import dotenv from 'dotenv';
import axios from 'axios';
import ModelClient from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Model provider types
export const PROVIDER_TYPES = {
  GITHUB_DEEPSEEK: 'github_deepseek',
  PERPLEXITY: 'perplexity'
};

/**
 * Create an LLM client based on configuration
 * @returns {Object} An LLM client with a unified interface
 */
export function createLLMClient() {
  // Determine which provider to use
  const usePerplexity = process.env.USE_PERPLEXITY?.toLowerCase() === 'true';
  
  // Debug info if enabled
  if (process.env.DEBUG?.toLowerCase() === 'true') {
    console.log(`DEBUG - USE_PERPLEXITY env var: "${process.env.USE_PERPLEXITY}"`);
    console.log(`DEBUG - usePerplexity evaluated to: ${usePerplexity}`);
  }
  
  if (usePerplexity) {
    try {
      const openrouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openrouterApiKey) {
        throw new Error('OPENROUTER_API_KEY is required for Perplexity integration');
      }
      
      const model = process.env.PERPLEXITY_MODEL || 'perplexity/sonar';
      console.log('Using Perplexity via OpenRouter...');
      return createPerplexityAdapter(openrouterApiKey, model);
    } catch (error) {
      console.warn('Failed to initialize Perplexity client:', error.message);
      console.log('Falling back to DeepSeek...');
      
      // Fall back to DeepSeek
      const githubToken = process.env.GITHUB_TOKEN;
      if (!githubToken) {
        throw new Error('Neither Perplexity nor DeepSeek could be initialized. GITHUB_TOKEN is missing for fallback.');
      }
      
      const endpoint = process.env.DEEPSEEK_ENDPOINT || 'https://models.inference.ai.azure.com';
      const modelName = process.env.DEEPSEEK_MODEL || 'DeepSeek-V3';
      
      // Create Azure AI Inference client
      const client = ModelClient(endpoint, new AzureKeyCredential(githubToken));
      return createGitHubDeepSeekAdapter(client, modelName);
    }
  } else {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN is required for DeepSeek integration');
    }
    
    const endpoint = process.env.DEEPSEEK_ENDPOINT || 'https://models.inference.ai.azure.com';
    const modelName = process.env.DEEPSEEK_MODEL || 'DeepSeek-V3';
    
    // Create Azure AI Inference client
    const client = ModelClient(endpoint, new AzureKeyCredential(githubToken));
    
    return createGitHubDeepSeekAdapter(client, modelName);
  }
}

/**
 * Create an adapter for Perplexity via OpenRouter using OpenAI SDK
 * @param {string} apiKey - OpenRouter API key
 * @param {string} model - Perplexity model name
 * @returns {Object} Perplexity client with standardized interface
 */
function createPerplexityAdapter(apiKey, model) {
  // Initialize OpenAI client with OpenRouter base URL
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.SITE_URL || "https://task-master-ai.app",
      "X-Title": process.env.SITE_NAME || "Task Master AI",
    },
  });

  return {
    name: PROVIDER_TYPES.PERPLEXITY,
    modelName: model,
    
    /**
     * Generate text completion with Perplexity via OpenRouter
     * @param {string} prompt - The text prompt
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Generated text
     */
    async generateText(prompt, options = {}) {
      try {
        if (process.env.DEBUG?.toLowerCase() === 'true') {
          console.log(`DEBUG - Using LLM provider: ${PROVIDER_TYPES.PERPLEXITY}`);
          console.log(`DEBUG - Using model: ${model}`);
        }
        
        // Use a smaller max_tokens value to avoid credit issues
        const maxTokens = Math.min(options.maxTokens || 2000, 2000);
        
        // Call OpenRouter API using OpenAI client
        const completion = await openai.chat.completions.create({
          model: options.model || model,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: maxTokens
        });

        // Extract and return the response content
        if (completion.choices && completion.choices[0] && completion.choices[0].message) {
          return completion.choices[0].message.content;
        } else {
          console.error('Invalid response format from OpenRouter API:', JSON.stringify(completion));
          throw new Error('Invalid response format from OpenRouter API');
        }
      } catch (error) {
        console.error('Error generating text with Perplexity:', error.message);
        
        // More detailed error logging
        if (error.response) {
          console.error('OpenRouter API error details:', JSON.stringify(error.response || error));
        }
        
        // Fall back to DeepSeek if available
        if (process.env.GITHUB_TOKEN) {
          console.log('Error with Perplexity API. Falling back to DeepSeek...');
          
          try {
            // Create DeepSeek client
            const endpoint = process.env.DEEPSEEK_ENDPOINT || 'https://models.inference.ai.azure.com';
            const modelName = process.env.DEEPSEEK_MODEL || 'DeepSeek-V3';
            const client = ModelClient(endpoint, new AzureKeyCredential(process.env.GITHUB_TOKEN));
            const deepSeekAdapter = createGitHubDeepSeekAdapter(client, modelName);
            
            console.log('Successfully created DeepSeek adapter for fallback');
            return await deepSeekAdapter.generateText(prompt, options);
          } catch (deepSeekError) {
            console.error('Error in DeepSeek fallback:', deepSeekError.message);
            throw new Error('Both Perplexity and DeepSeek fallback failed');
          }
        }
        
        // Create an informative error message if fallback isn't available
        let errorMessage = 'Perplexity API error';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage += `: ${error.response.data.error.message || JSON.stringify(error.response.data.error)}`;
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        }
        
        throw new Error(errorMessage);
      }
    },

    /**
     * Generate tasks from PRD content
     * @param {string} prdContent - The PRD content to parse
     * @returns {Promise<Object>} Generated tasks
     */
    async generateTasks(prdContent) {
      const prompt = `Please analyze this PRD and break it down into a structured set of development tasks. 
Return ONLY a JSON object (no markdown, no code blocks) with an array of tasks. Each task should have:
- id: A unique numeric identifier
- title: A clear, concise title
- description: Detailed implementation notes
- priority: high/medium/low
- status: "pending"
- dependencies: Array of task IDs this task depends on (can be empty)
- subtasks: Empty array (will be populated later)

Here's the PRD:

${prdContent}`;

      const response = await this.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 2000
      });

      try {
        // Clean the response by removing markdown code block markers if present
        const cleanedResponse = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(cleanedResponse);
      } catch (error) {
        console.error('Raw response:', response);
        throw new Error('Failed to parse LLM response as JSON. Response: ' + response);
      }
    },

    /**
     * Analyze task complexity
     * @param {Object} task - The task to analyze
     * @returns {Promise<Object>} Complexity analysis
     */
    async analyzeComplexity(task) {
      const prompt = `Analyze the complexity of this development task and provide a structured assessment.
Task: ${JSON.stringify(task)}

Return ONLY a JSON object (no markdown formatting, no additional text) with the following structure:
{
  "score": number (1-10),
  "reasoning": string (brief explanation),
  "recommendedSubtasks": number (based on complexity),
  "expansionPrompt": string (tailored prompt for breaking down this task)
}`;

      const response = await this.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });

      try {
        // Extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        
        const cleanedResponse = jsonMatch[0]
          .replace(/^```json\s*/, '')  // Remove opening code block
          .replace(/\s*```$/, '')      // Remove closing code block
          .trim();
        
        const result = JSON.parse(cleanedResponse);
        
        // Validate the response structure
        if (!result.score || !result.reasoning || !result.recommendedSubtasks || !result.expansionPrompt) {
          throw new Error('Invalid response structure: missing required fields');
        }
        
        return result;
      } catch (error) {
        if (process.env.DEBUG?.toLowerCase() === 'true') {
          console.error('Raw response:', response);
        }
        throw new Error(`Failed to parse complexity analysis response: ${error.message}`);
      }
    }
  };
}

/**
 * Create an adapter for GitHub's DeepSeek model using Azure AI Inference SDK
 * @returns {Object} DeepSeek client with standardized interface
 */
function createGitHubDeepSeekAdapter(client, modelName) {
  return {
    name: PROVIDER_TYPES.GITHUB_DEEPSEEK,
    modelName: modelName,
    
    /**
     * Generate text completion with DeepSeek
     * @param {string} prompt - The text prompt
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Generated text
     */
    async generateText(prompt, options = {}) {
      try {
        if (process.env.DEBUG?.toLowerCase() === 'true') {
          console.log(`DEBUG - Using LLM provider: ${PROVIDER_TYPES.GITHUB_DEEPSEEK}`);
          console.log(`DEBUG - Using model: ${modelName}`);
        }
        
        // Use the Azure REST client to call DeepSeek
        const response = await client.path("/chat/completions").post({
          body: {
            messages: [{ role: "user", content: prompt }],
            model: options.model || modelName,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 4000
          }
        });
        
        // Check for errors
        if (response.status !== "200") {
          throw new Error(`DeepSeek API error: ${response.status}`);
        }
        
        return response.body.choices[0].message.content;
      } catch (error) {
        console.error('Error generating text with DeepSeek:', error.message);
        throw new Error(`DeepSeek API error: ${error.message}`);
      }
    },

    /**
     * Generate tasks from PRD content
     * @param {string} prdContent - The PRD content to parse
     * @returns {Promise<Object>} Generated tasks
     */
    async generateTasks(prdContent) {
      const prompt = `Please analyze this PRD and break it down into a structured set of development tasks. 
Return ONLY a JSON object (no markdown, no code blocks) with an array of tasks. Each task should have:
- id: A unique numeric identifier
- title: A clear, concise title
- description: Detailed implementation notes
- priority: high/medium/low
- status: "pending"
- dependencies: Array of task IDs this task depends on (can be empty)
- subtasks: Empty array (will be populated later)

Here's the PRD:

${prdContent}`;

      const response = await this.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 4000
      });

      try {
        // Clean the response by removing markdown code block markers if present
        const cleanedResponse = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(cleanedResponse);
      } catch (error) {
        console.error('Raw response:', response);
        throw new Error('Failed to parse LLM response as JSON. Response: ' + response);
      }
    },

    /**
     * Analyze task complexity
     * @param {Object} task - The task to analyze
     * @returns {Promise<Object>} Complexity analysis
     */
    async analyzeComplexity(task) {
      const prompt = `Analyze the complexity of this development task and provide a structured assessment.
Task: ${JSON.stringify(task)}

Return ONLY a JSON object (no markdown formatting, no additional text) with the following structure:
{
  "score": number (1-10),
  "reasoning": string (brief explanation),
  "recommendedSubtasks": number (based on complexity),
  "expansionPrompt": string (tailored prompt for breaking down this task)
}`;

      const response = await this.generateText(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });

      try {
        // Extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        
        const cleanedResponse = jsonMatch[0]
          .replace(/^```json\s*/, '')  // Remove opening code block
          .replace(/\s*```$/, '')      // Remove closing code block
          .trim();
        
        const result = JSON.parse(cleanedResponse);
        
        // Validate the response structure
        if (!result.score || !result.reasoning || !result.recommendedSubtasks || !result.expansionPrompt) {
          throw new Error('Invalid response structure: missing required fields');
        }
        
        return result;
      } catch (error) {
        if (process.env.DEBUG?.toLowerCase() === 'true') {
          console.error('Raw response:', response);
        }
        throw new Error(`Failed to parse complexity analysis response: ${error.message}`);
      }
    }
  };
} 
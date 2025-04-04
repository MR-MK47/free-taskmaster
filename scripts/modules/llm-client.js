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
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterApiKey) {
      throw new Error('OPENROUTER_API_KEY is required for Perplexity integration');
    }
    
    const model = process.env.PERPLEXITY_MODEL || 'perplexity/sonar-pro';
    return createPerplexityAdapter(openrouterApiKey, model);
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
    }
  };
} 
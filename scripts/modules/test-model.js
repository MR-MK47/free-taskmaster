/**
 * test-model.js
 * Simple test script to verify LLM provider integrations
 */

// Import required modules
import { createLLMClient } from './llm-client.js';
import 'dotenv/config';

// Simple test prompt
const TEST_PROMPT = 'Explain the concept of adapter patterns in software engineering in one sentence.';

/**
 * Main test function
 */
async function testModel() {
  console.log('🧪 Testing LLM model integration...\n');
  
  try {
    // Create LLM client based on environment configuration
    const llmClient = createLLMClient();
    console.log(`Using LLM provider: ${llmClient.name}`);
    console.log(`Using model: ${llmClient.modelName}`);
    
    console.log('Sending test prompt...');
    console.log(`Prompt: "${TEST_PROMPT}"\n`);
    
    // Generate text using the configured provider
    const startTime = Date.now();
    const result = await llmClient.generateText(TEST_PROMPT);
    const duration = Date.now() - startTime;
    
    console.log('Response:');
    console.log('--------------------------------------------------');
    console.log(result.trim());
    console.log('--------------------------------------------------');
    
    console.log(`\nTime taken: ${duration / 1000} seconds`);
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testModel(); 
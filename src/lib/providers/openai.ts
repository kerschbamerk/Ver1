import { createOpenAICompatibleAdapter } from './openaiCompatible'

export const openaiAdapter = createOpenAICompatibleAdapter({
  id: 'openai',
  label: 'OpenAI (ChatGPT)',
  helpUrl: 'https://platform.openai.com/api-keys',
  defaultBaseUrl: 'https://api.openai.com/v1',
  defaultModel: 'gpt-4o',
  modelSuggestions: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'o3-mini'],
})

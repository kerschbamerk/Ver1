import { createOpenAICompatibleAdapter } from './openaiCompatible'

export const kimiAdapter = createOpenAICompatibleAdapter({
  id: 'kimi',
  label: 'Kimi (Moonshot AI)',
  helpUrl: 'https://platform.moonshot.ai/console/api-keys',
  // Global/international endpoint. Accounts registered on platform.moonshot.cn
  // need the mainland-China endpoint instead — override it in Settings:
  // https://api.moonshot.cn/v1
  defaultBaseUrl: 'https://api.moonshot.ai/v1',
  defaultModel: 'moonshot-v1-8k',
  modelSuggestions: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k', 'kimi-k2-0905-preview'],
})

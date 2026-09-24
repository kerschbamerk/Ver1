import { createOpenAICompatibleAdapter } from './openaiCompatible'

export const qwenAdapter = createOpenAICompatibleAdapter({
  id: 'qwen',
  label: 'Qwen (Alibaba)',
  helpUrl: 'https://www.alibabacloud.com/help/en/model-studio/get-api-key',
  // International DashScope endpoint. Accounts on the mainland-China console
  // need the local endpoint instead — override it in Settings:
  // https://dashscope.aliyuncs.com/compatible-mode/v1
  defaultBaseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
  defaultModel: 'qwen-plus',
  modelSuggestions: ['qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen3-235b-a22b'],
})

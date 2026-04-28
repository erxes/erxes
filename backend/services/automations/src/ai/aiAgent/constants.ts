export const AI_AGENT_SUPPORTED_PROVIDERS = [
  'cloudflare-ai-gateway',
  'openai',
] as const;

export const AI_AGENT_DEFAULT_PROVIDER = 'cloudflare-ai-gateway';

export const AI_AGENT_PROVIDER_DEFAULT_MODELS = {
  'cloudflare-ai-gateway': 'openai/gpt-5-mini',
  openai: 'gpt-5-mini',
} as const;

export const AI_AGENT_SUPPORTED_CONTEXT_FILE_EXTENSIONS = [
  '.md',
  '.markdown',
  '.txt',
] as const;

export const AI_AGENT_SUPPORTED_CONTEXT_FILE_TYPES = [
  'text/markdown',
  'text/plain',
  'text/x-markdown',
  'application/octet-stream',
] as const;

export const AI_AGENT_DEFAULTS = {
  baseUrl: 'https://gateway.ai.cloudflare.com/v1',
  openAiBaseUrl: 'https://api.openai.com/v1',
  cloudflareAiGatewayBaseUrl: 'https://gateway.ai.cloudflare.com/v1',
  cloudflareAiGatewayMode: 'compat',
  temperature: 0.2,
  maxTokens: 500,
  timeoutMs: 15000,
} as const;

export const AI_AGENT_LIMITS = {
  maxNameChars: 80,
  maxDescriptionChars: 500,
  maxSystemPromptChars: 4000,
  maxFiles: 10,
  maxModelChars: 200,
  maxSecretChars: 2000,
  maxMaxTokens: 4000,
  minTimeoutMs: 1000,
  maxTimeoutMs: 30000,
  maxSingleFileBytes: 50_000,
  maxTotalContextBytes: 200_000,
} as const;

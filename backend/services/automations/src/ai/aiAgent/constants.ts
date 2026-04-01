export const AI_AGENT_SUPPORTED_PROVIDERS = ['openai-compatible'] as const;

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
  baseUrl: 'https://api.openai.com/v1',
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
  maxSingleFileBytes: 100_000,
  maxTotalContextBytes: 300_000,
} as const;

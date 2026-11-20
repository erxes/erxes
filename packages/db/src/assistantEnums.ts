/** The assistant's value lists, kept as `./enums` is: one `as const` array each, no imports. */

export const ASSISTANT_PROVIDERS = ['openai', 'grok', 'kimi', 'kimi-code'] as const;

export const ASSISTANT_THINKING_LEVELS = [
  'off',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
] as const;

export const ASSISTANT_THINKING_KINDS = ['effort', 'toggle', 'budget', 'fixed', 'none'] as const;

export const ASSISTANT_QUESTION_MODES = ['single_select', 'multi_select'] as const;

export const ASSISTANT_QUESTION_COMPONENTS = [
  'text',
  'long_text',
  'number',
  'date',
  'member',
] as const;

export const ASSISTANT_RECORD_TYPES = [
  'customer',
  'company',
  'member',
  'product',
  'automation',
] as const;

export const ASSISTANT_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

export const ASSISTANT_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const ASSISTANT_DOCUMENT_FORMATS = ['pdf', 'docx', 'xlsx'] as const;

export const ASSISTANT_TEXT_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
] as const;

export const ASSISTANT_ARTIFACT_FORMATS = ['html', 'csv', 'markdown'] as const;

export const ASSISTANT_PROGRAM_FAILURES = ['TIMEOUT', 'OUT_OF_MEMORY', 'PROGRAM_ERROR'] as const;

export const ASSISTANT_AVATAR_BODIES = [
  'circle',
  'pebble',
  'squircle',
  'capsule',
  'triangle',
  'hexagon',
  'cloud',
  'drop',
] as const;

export const ASSISTANT_AVATAR_COLORS = [
  'ink',
  'brown',
  'red',
  'orange',
  'amber',
  'green',
  'teal',
  'blue',
  'violet',
  'pink',
  'grey',
] as const;

export const ASSISTANT_AVATAR_EXPRESSIONS = [
  'neutral',
  'attentive',
  'surprised',
  'excited',
  'happy',
  'laughing',
  'angry',
  'sad',
  'scared',
  'wary',
  'confused',
  'curious',
  'proud',
  'shy',
  'bored',
  'sleepy',
] as const;

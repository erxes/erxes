import { anthropic } from './anthropic/server';
import { grok } from './grok/server';
import { kimiCode } from './kimi-code/server';
import { kimi } from './kimi/server';
import { openai } from './openai/server';
import { openrouter } from './openrouter/server';
import { qpay } from './qpay/server';
import { stripe } from './stripe/server';

export type { ModelClient } from './modelProvider';

export const MODEL_PROVIDERS = {
  openai,
  anthropic,
  openrouter,
  kimi,
  'kimi-code': kimiCode,
  grok,
};

export const INTEGRATIONS = [qpay, stripe, ...Object.values(MODEL_PROVIDERS)];

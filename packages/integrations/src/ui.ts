import { anthropicUi } from './anthropic/ui';
import { grokUi } from './grok/ui';
import { kimiCodeUi } from './kimi-code/ui';
import { kimiUi } from './kimi/ui';
import { openaiUi } from './openai/ui';
import { openrouterUi } from './openrouter/ui';
import { qpayUi } from './qpay/ui';
import { stripeUi } from './stripe/ui';

export const INTEGRATION_UIS = [
  qpayUi,
  stripeUi,
  openaiUi,
  anthropicUi,
  openrouterUi,
  kimiUi,
  kimiCodeUi,
  grokUi,
];

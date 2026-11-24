import { anthropic } from './anthropic/server';
import { appleSignIn } from './apple-sign-in/server';
import { callpro } from './callpro/server';
import { twilio } from './twilio/server';
import { facebookLogin } from './facebook-login/server';
import { googleSignIn } from './google-sign-in/server';
import { verifyMn } from './verify-mn/server';
import { grok } from './grok/server';
import { kimiCode } from './kimi-code/server';
import { kimi } from './kimi/server';
import { openai } from './openai/server';
import { openrouter } from './openrouter/server';
import { qpay } from './qpay/server';
import { stripe } from './stripe/server';
import { typesafe } from './typesafe/server';

export type { ModelClient } from './modelProvider';

export const MODEL_PROVIDERS = {
  openai,
  anthropic,
  openrouter,
  kimi,
  'kimi-code': kimiCode,
  grok,
};

export const DECISION_INTEGRATIONS = { typesafe, openai };

/** Ways portals' customers sign in, which portals pick a connection of (Settings › Portals). */
export const SIGN_IN_INTEGRATIONS = [googleSignIn, appleSignIn, facebookLogin, verifyMn];

/** Ways the organisation's texts go out; the oldest active connection of one sends them. */
export const SMS_INTEGRATIONS = [callpro, twilio];

export const INTEGRATIONS = [
  qpay,
  stripe,
  ...SMS_INTEGRATIONS,
  ...Object.values(MODEL_PROVIDERS),
  typesafe,
  ...SIGN_IN_INTEGRATIONS,
];

import { anthropicUi } from './anthropic/ui';
import { appleSignInUi } from './apple-sign-in/ui';
import { callproUi } from './callpro/ui';
import { facebookLoginUi } from './facebook-login/ui';
import { googleSignInUi } from './google-sign-in/ui';
import { grokUi } from './grok/ui';
import { kimiCodeUi } from './kimi-code/ui';
import { kimiUi } from './kimi/ui';
import { openaiUi } from './openai/ui';
import { openrouterUi } from './openrouter/ui';
import { qpayUi } from './qpay/ui';
import { stripeUi } from './stripe/ui';
import { twilioUi } from './twilio/ui';
import { verifyMnUi } from './verify-mn/ui';

export const INTEGRATION_UIS = [
  qpayUi,
  stripeUi,
  googleSignInUi,
  appleSignInUi,
  facebookLoginUi,
  verifyMnUi,
  callproUi,
  twilioUi,
  openaiUi,
  anthropicUi,
  openrouterUi,
  kimiUi,
  kimiCodeUi,
  grokUi,
];

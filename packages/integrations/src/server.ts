import { qpay } from './qpay/server';
import { stripe } from './stripe/server';

export const INTEGRATIONS = [qpay, stripe];

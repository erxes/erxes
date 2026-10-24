import type { PricingConfig } from '../types/pricing';

const isPricingConfig = (value: unknown): value is PricingConfig =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// pricingConfig is a JSON scalar. Keep the saved object as it is, including
// legacy string rates and extra keys; anything other than an object is missing.
export const toPricingConfig = (value: unknown): PricingConfig | null =>
  isPricingConfig(value) ? value : null;

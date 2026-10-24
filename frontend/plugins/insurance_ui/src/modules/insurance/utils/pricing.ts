import type { PricingConfig } from '../types/pricing';
import { isRecord } from './isRecord';

// pricingConfig is a JSON scalar. Keep the saved object as it is, including
// legacy string rates and extra keys; anything other than an object is missing.
export const toPricingConfig = (value: unknown): PricingConfig | null =>
  isRecord(value) ? value : null;

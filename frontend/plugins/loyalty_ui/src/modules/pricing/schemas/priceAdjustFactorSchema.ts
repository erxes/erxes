import { type TFunction } from 'i18next';
import { z } from 'zod';

export const priceAdjustFactorSchema = (t: TFunction) =>
  z.coerce
    .number({ invalid_type_error: t('price-adjust-factor-integer') })
    .int(t('price-adjust-factor-integer'))
    .min(-10, t('price-adjust-factor-limit'))
    .max(10, t('price-adjust-factor-limit'));

export const validatePriceAdjustFactor = (
  value: string | number,
  t: TFunction,
): true | string => {
  const result = priceAdjustFactorSchema(t).safeParse(value);
  return result.success ? true : result.error.issues[0].message;
};

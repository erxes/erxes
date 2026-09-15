import { z } from 'zod';
import { defaultViberTranslate, type ViberTranslate } from './translation';

export const createViberTokenSchema = (
  t: ViberTranslate = defaultViberTranslate,
) =>
  z
    .string()
    .min(1, t('viber-token-required', { defaultValue: 'Enter the bot token' }))
    .refine(
      (value) => value === value.trim(),
      t('viber-token-whitespace', {
        defaultValue:
          'Remove spaces or line breaks before and after the token.',
      }),
    );

export const viberTokenSchema = createViberTokenSchema();

export const viberIntegrationSchema = (
  editing: boolean,
  t: ViberTranslate = defaultViberTranslate,
) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(
        1,
        t('viber-name-required', { defaultValue: 'Enter an integration name' }),
      )
      .max(100),
    brandId: z
      .string()
      .min(1, t('viber-brand-required', { defaultValue: 'Choose a brand' })),
    token: editing
      ? z.union([z.literal(''), createViberTokenSchema(t)])
      : createViberTokenSchema(t),
  });

export type ViberIntegrationValues = z.infer<
  ReturnType<typeof viberIntegrationSchema>
>;

export const createViberSpecialSchema = (
  t: ViberTranslate = defaultViberTranslate,
) =>
  z
    .object({
      type: z.enum(['url', 'location', 'contact', 'sticker']),
      url: z.string(),
      lat: z.string(),
      lon: z.string(),
      name: z.string(),
      phone: z.string(),
      stickerId: z.string(),
    })
    .superRefine((value, ctx) => {
      const error = (path: string, message: string) =>
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
      if (value.type === 'url') {
        try {
          const url = new URL(value.url);
          if (
            url.protocol !== 'https:' ||
            url.username ||
            url.password ||
            value.url.length > 2000
          )
            throw new Error();
        } catch {
          error(
            'url',
            t('viber-link-invalid', {
              defaultValue:
                'Use an HTTPS link without login details (up to 2,000 characters).',
            }),
          );
        }
      }
      if (value.type === 'location') {
        for (const [field, max] of [
          ['lat', 90],
          ['lon', 180],
        ] as const) {
          if (
            !value[field].trim() ||
            !Number.isFinite(Number(value[field])) ||
            Math.abs(Number(value[field])) > max
          )
            error(
              field,
              t('viber-coordinate-invalid', {
                defaultValue: `Enter a number between -${max} and ${max}`,
                max,
              }),
            );
        }
      }
      if (value.type === 'contact') {
        if (!value.name.trim() || value.name.trim().length > 28)
          error(
            'name',
            t('viber-contact-invalid', {
              defaultValue: 'Enter a contact name (maximum 28 characters)',
            }),
          );
        if (!value.phone.trim() || value.phone.trim().length > 18)
          error(
            'phone',
            t('viber-phone-invalid', {
              defaultValue: 'Enter a phone number (maximum 18 characters)',
            }),
          );
      }
      if (value.type === 'sticker' && !/^\d{1,20}$/.test(value.stickerId))
        error(
          'stickerId',
          t('viber-sticker-invalid', {
            defaultValue: 'Enter a numeric Viber sticker ID',
          }),
        );
    });

export const viberSpecialSchema = createViberSpecialSchema();

export const buildViberSpecialMessage = (
  input: z.infer<typeof viberSpecialSchema>,
): Record<string, unknown> => {
  const value = viberSpecialSchema.parse(input);
  switch (value.type) {
    case 'url':
      return { type: 'url', media: value.url };
    case 'location':
      return {
        type: 'location',
        location: { lat: Number(value.lat), lon: Number(value.lon) },
      };
    case 'contact':
      return {
        type: 'contact',
        contact: { name: value.name.trim(), phone_number: value.phone.trim() },
      };
    case 'sticker':
      return { type: 'sticker', sticker_id: value.stickerId };
  }
};

export const viberDeliveryLabel = (
  delivery?: import('./types').ViberDelivery | null,
  t: ViberTranslate = defaultViberTranslate,
): string => {
  if (!delivery)
    return t('viber-delivery-unavailable', {
      defaultValue: 'Delivery status unavailable',
    });
  if (delivery.parts.some((part) => part.failedAt))
    return t('viber-delivery-failed', { defaultValue: 'Delivery failed' });
  if (delivery.parts.length && delivery.parts.every((part) => part.seenAt))
    return t('seen', { defaultValue: 'Seen' });
  if (
    delivery.parts.length &&
    delivery.parts.every((part) => part.deliveredAt || part.seenAt)
  )
    return t('delivered', { defaultValue: 'Delivered' });
  const labels: Record<string, string> = {
    pending: t('viber-not-sent', { defaultValue: 'Not sent' }),
    sending: t('sending', { defaultValue: 'Sending' }),
    sent: t('sent', { defaultValue: 'Sent' }),
    rejected: t('viber-send-failed-label', { defaultValue: 'Send failed' }),
    unknown: t('viber-delivery-unconfirmed', {
      defaultValue: 'Delivery unconfirmed',
    }),
  };
  return (
    labels[delivery.state] ||
    t('viber-delivery-unavailable', {
      defaultValue: 'Delivery status unavailable',
    })
  );
};

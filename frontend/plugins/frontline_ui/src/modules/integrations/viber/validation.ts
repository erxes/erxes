import { z } from 'zod';

export const viberTokenSchema = z
  .string()
  .min(1, 'Enter the bot token')
  .refine(
    (value) => value === value.trim(),
    'Remove leading or trailing whitespace. The token is never trimmed automatically.',
  );

export const viberIntegrationSchema = (editing: boolean) =>
  z.object({
    name: z.string().trim().min(1, 'Enter an integration name').max(100),
    brandId: z.string().min(1, 'Choose a brand'),
    token: editing
      ? z.union([z.literal(''), viberTokenSchema])
      : viberTokenSchema,
  });

export type ViberIntegrationValues = z.infer<
  ReturnType<typeof viberIntegrationSchema>
>;

export const viberSpecialSchema = z
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
          'Enter an HTTPS URL without credentials (maximum 2000 characters)',
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
          error(field, `Enter a number between -${max} and ${max}`);
      }
    }
    if (value.type === 'contact') {
      if (!value.name.trim() || value.name.trim().length > 128)
        error('name', 'Enter a contact name (maximum 128 characters)');
      if (!value.phone.trim() || value.phone.trim().length > 128)
        error('phone', 'Enter a phone number (maximum 128 characters)');
    }
    if (value.type === 'sticker' && !/^\d{1,20}$/.test(value.stickerId))
      error('stickerId', 'Enter a numeric Viber sticker ID');
  });

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
): string => {
  if (!delivery) return 'Delivery status unavailable';
  if (delivery.parts.some((part) => part.failedAt))
    return 'Delivery failed on the recipient’s device';
  if (delivery.parts.length && delivery.parts.every((part) => part.seenAt))
    return 'Seen';
  if (
    delivery.parts.length &&
    delivery.parts.every((part) => part.deliveredAt || part.seenAt)
  )
    return 'Delivered';
  const labels: Record<string, string> = {
    pending: 'Saved — not sent',
    sending: 'Sending',
    sent: 'Accepted by Viber',
    rejected: 'Not fully sent — retry available',
    unknown: 'Delivery unconfirmed — do not resend',
  };
  return labels[delivery.state] || 'Delivery status unavailable';
};

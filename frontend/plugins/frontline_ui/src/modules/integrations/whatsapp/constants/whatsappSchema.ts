import { z } from 'zod';

/**
 * `appSecret` is required even though the backend does not enforce it.
 *
 * Every inbound webhook is signature-checked against it, and
 * `verifyWebhookSignature` returns false when it is absent — so a number saved
 * without one still sends messages and still reports itself healthy, while
 * silently answering 403 to every message a customer sends. A half-working
 * integration that looks fine is worse than one that refuses to be created,
 * so this is enforced at the only point where the operator has the value to
 * hand.
 */
export const WHATSAPP_INTEGRATION_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
  phoneNumberId: z.string().min(1, 'Phone number ID is required'),
  accessToken: z.string().min(1, 'Access token is required'),
  whatsappBusinessAccountId: z.string().optional(),
  appSecret: z
    .string()
    .min(1, 'App secret is required — without it inbound messages are rejected'),
  verifyToken: z.string().optional(),
  defaultCountryCode: z
    .string()
    .regex(/^\+?\d{1,4}$/, 'Use a dialing code such as +91')
    .optional()
    .or(z.literal('')),
});

export const WHATSAPP_EDIT_SCHEMA = z.object({
  name: z.string().min(1, 'Name is required'),
  brandId: z.string().min(1, 'Brand is required'),
});

export const WHATSAPP_MESSAGE_WINDOW_HOURS = 24;

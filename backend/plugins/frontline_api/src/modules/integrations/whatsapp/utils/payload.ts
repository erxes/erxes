import { z } from 'zod';

const mediaSchema = z
  .object({
    id: z.string(),
    mime_type: z.string().optional(),
    caption: z.string().optional(),
    filename: z.string().optional(),
  })
  .passthrough();

export const whatsappMessageSchema = z
  .object({
    id: z.string().min(1),
    from: z.string().optional(),
    from_user_id: z.string().optional(),
    timestamp: z.string().optional(),
    type: z.string(),
    text: z.object({ body: z.string() }).passthrough().optional(),
    image: mediaSchema.optional(),
    video: mediaSchema.optional(),
    audio: mediaSchema.optional(),
    document: mediaSchema.optional(),
    sticker: mediaSchema.optional(),
    location: z
      .object({
        latitude: z.number(),
        longitude: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
      })
      .passthrough()
      .optional(),
    interactive: z
      .object({
        type: z.string(),
        button_reply: z.object({ title: z.string() }).passthrough().optional(),
        list_reply: z
          .object({
            title: z.string(),
            description: z.string().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    button: z.object({ text: z.string() }).passthrough().optional(),
    contacts: z
      .array(
        z
          .object({
            name: z
              .object({ formatted_name: z.string().optional() })
              .passthrough()
              .optional(),
            phones: z
              .array(z.object({ phone: z.string().optional() }).passthrough())
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export type WhatsappWebhookMessage = z.infer<typeof whatsappMessageSchema>;

export const whatsappStatusSchema = z
  .object({
    id: z.string().min(1),
    status: z.string(),
    recipient_id: z.string().optional(),
    recipient_user_id: z.string().optional(),
    errors: z
      .array(
        z
          .object({
            code: z.number().optional(),
            title: z.string().optional(),
            message: z.string().optional(),
            error_data: z
              .object({ details: z.string().optional() })
              .passthrough()
              .optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export type WhatsappWebhookStatus = z.infer<typeof whatsappStatusSchema>;

export const whatsappContactSchema = z
  .object({
    wa_id: z.string().optional(),
    user_id: z.string().optional(),
    profile: z.object({ name: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();

export type WhatsappWebhookContact = z.infer<typeof whatsappContactSchema>;

/** Only the parts erxes reads are validated; Meta may add fields at any time. */
export const whatsappWebhookSchema = z
  .object({
    object: z.string(),
    entry: z
      .array(
        z
          .object({
            id: z.string().optional(),
            changes: z
              .array(
                z
                  .object({
                    field: z.string(),
                    value: z
                      .object({
                        metadata: z
                          .object({ phone_number_id: z.string() })
                          .passthrough()
                          .optional(),
                        contacts: z.array(whatsappContactSchema).optional(),
                        messages: z.array(z.unknown()).optional(),
                        statuses: z.array(z.unknown()).optional(),
                      })
                      .passthrough(),
                  })
                  .passthrough(),
              )
              .default([]),
          })
          .passthrough(),
      )
      .default([]),
  })
  .passthrough();

export type WhatsappWebhookPayload = z.infer<typeof whatsappWebhookSchema>;

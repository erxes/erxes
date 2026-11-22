import { z } from 'zod';
import type { AppEvent } from '@erxes/plugin-sdk/integrations';
import { Text } from '@erxes/plugin-sdk/integrations';

const Referral = z.looseObject({
  ref: z.string().optional(),
  source: z.string().optional(),
  ad_id: Text.optional(),
  ads_context_data: z
    .looseObject({ ad_title: z.string().optional(), post_id: Text.optional() })
    .optional(),
});

const Attachment = z.looseObject({
  type: z.string(),
  payload: z
    .looseObject({
      url: z.string().optional(),
      sticker_id: Text.optional(),
      coordinates: z.object({ lat: z.number(), long: z.number() }).optional(),
    })
    .nullish(),
});

const Message = z.looseObject({
  mid: z.string(),
  text: z.string().optional(),
  is_echo: z.boolean().optional(),
  quick_reply: z.object({ payload: z.string() }).optional(),
  reply_to: z.object({ mid: z.string() }).optional(),
  attachments: z.array(Attachment).optional(),
  sticker_id: Text.optional(),
  commands: z.array(z.object({ name: z.string() })).optional(),
  referral: z.looseObject({ product: z.object({ id: Text }).optional() }).optional(),
});

const Postback = z.looseObject({
  mid: z.string().optional(),
  title: z.string().optional(),
  payload: z.string().optional(),
  referral: Referral.optional(),
});

const Messaging = z.looseObject({
  sender: z.object({ id: Text }),
  recipient: z.object({ id: Text }),
  timestamp: z.number(),
  message: Message.optional(),
  postback: Postback.optional(),
  referral: Referral.optional(),
});

type Item = z.output<typeof Messaging>;

const referralFields = (referral: z.output<typeof Referral> | undefined) => ({
  referralRef: referral?.ref,
  referralSource: referral?.source,
  adId: referral?.ad_id,
  adTitle: referral?.ads_context_data?.ad_title,
  adPostId: referral?.ads_context_data?.post_id,
});

const messageFields = (sent: z.output<typeof Message>) => {
  const attachments = sent.attachments ?? [];
  const [attachment] = attachments;
  const sticker = attachments.find((item) => item.payload?.sticker_id !== undefined);
  const place = attachments.find((item) => item.payload?.coordinates)?.payload?.coordinates;

  return {
    messageId: sent.mid,
    text: sent.text,
    quickReplyPayload: sent.quick_reply?.payload,
    replyToMessageId: sent.reply_to?.mid,
    command: sent.commands?.[0]?.name,
    attachmentCount: attachments.length || undefined,
    attachmentType: attachment?.type,
    attachmentUrl: attachment?.payload?.url,
    stickerId: sent.sticker_id ?? sticker?.payload?.sticker_id,
    latitude: place?.lat,
    longitude: place?.long,
    productId: sent.referral?.product?.id,
  };
};

const shared = (pageId: string, item: Item) => ({
  pageId,
  senderId: item.sender.id,
  recipientId: item.recipient.id,
  sentAt: new Date(item.timestamp).toISOString(),
});

const eventOf = (pageId: string, item: Item, raw: unknown): AppEvent | null => {
  if (item.message)
    return item.message.is_echo
      ? null
      : {
          id: item.message.mid,
          type: 'messages',
          payload: {
            ...shared(pageId, item),
            ...referralFields(item.referral),
            ...messageFields(item.message),
            raw,
          },
        };

  if (item.postback)
    return {
      id: item.postback.mid ?? `${item.sender.id}:${item.timestamp}`,
      type: 'messaging_postbacks',
      payload: {
        ...shared(pageId, item),
        ...referralFields(item.postback.referral),
        messageId: item.postback.mid,
        postbackTitle: item.postback.title,
        postbackPayload: item.postback.payload,
        raw,
      },
    };

  if (item.referral)
    return {
      id: `${item.sender.id}:${item.timestamp}`,
      type: 'messaging_referrals',
      payload: { ...shared(pageId, item), ...referralFields(item.referral), raw },
    };

  return null;
};

export const messagingEvent = (pageId: string, value: unknown) => {
  const parsed = Messaging.safeParse(value);

  return parsed.success ? eventOf(pageId, parsed.data, value) : null;
};

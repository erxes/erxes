import { z } from 'zod';
import type { IMessage } from '@/inbox/types/Conversation';

// `botData`, `source` and `relatedMessage` are JSON on Facebook messages. Bot
// blocks keep their type even when a field is malformed, so a bot message is
// never mistaken for a customer one.

const text = z.string().catch('');
const optionalString = z.string().optional().catch(undefined);

const BOT_BUTTON_SCHEMA = z
  .object({
    title: text,
    url: optionalString,
    type: z.string().nullable().optional().catch(undefined),
  })
  .passthrough();

const BOT_BUTTONS_SCHEMA = z.array(BOT_BUTTON_SCHEMA).catch([]);

const BOT_DATA_SCHEMA = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('carousel'),
      elements: z
        .array(
          z
            .object({
              picture: optionalString,
              title: text,
              subtitle: optionalString,
              buttons: BOT_BUTTONS_SCHEMA,
            })
            .passthrough(),
        )
        .catch([]),
    })
    .passthrough(),
  z.object({ type: z.literal('file'), url: text }).passthrough(),
  z
    .object({
      type: z.literal('button_template'),
      text,
      buttons: BOT_BUTTONS_SCHEMA,
    })
    .passthrough(),
  z.object({ type: z.literal('text'), text }).passthrough(),
  z
    .object({
      type: z.literal('quick_replies'),
      text,
      quick_replies: z.array(z.object({ title: text }).passthrough()).catch([]),
    })
    .passthrough(),
]);

const MESSAGE_RELATION_SCHEMA = z
  .object({
    conversationId: optionalString,
    messageId: optionalString,
    content: optionalString,
  })
  .passthrough()
  .optional()
  .catch(undefined);

const MESSAGE_RELATION_SOURCE_SCHEMA = z
  .object({
    type: optionalString,
    conversationId: optionalString,
    messageId: optionalString,
    commentId: optionalString,
    content: optionalString,
  })
  .passthrough()
  .optional()
  .catch(undefined);

export type TBotData = z.output<typeof BOT_DATA_SCHEMA>;
export type IFacebookBotButton = z.output<typeof BOT_BUTTON_SCHEMA>;
export type IFacebookMessageRelationSource = NonNullable<
  z.output<typeof MESSAGE_RELATION_SOURCE_SCHEMA>
>;
export type IFacebookMessageRelation = NonNullable<
  z.output<typeof MESSAGE_RELATION_SCHEMA>
>;

export type IFacebookConversationMessage = Omit<IMessage, 'botData'> & {
  botData?: TBotData[];
  source?: IFacebookMessageRelationSource;
  relatedMessage?: IFacebookMessageRelation;
};

/** Parses the Facebook-only JSON fields; the shared ones come from `toMessage`. */
export const toFacebookMessageExtras = (message: {
  botData?: unknown;
  source?: unknown;
  relatedMessage?: unknown;
}) => ({
  botData: Array.isArray(message.botData)
    ? message.botData.flatMap((item): TBotData[] => {
        const parsed = BOT_DATA_SCHEMA.safeParse(item);

        return parsed.success ? [parsed.data] : [];
      })
    : undefined,
  source: MESSAGE_RELATION_SOURCE_SCHEMA.parse(message.source ?? undefined),
  relatedMessage: MESSAGE_RELATION_SCHEMA.parse(
    message.relatedMessage ?? undefined,
  ),
});

// Meta retired CONFIRMED_EVENT_UPDATE / POST_PURCHASE_UPDATE / ACCOUNT_UPDATE
// on 2026-04-27; sends using them fail with "Invalid parameter". HUMAN_AGENT
// is the only tag valid for inbox replies outside the 24-hour window.
export enum EnumFacebookTag {
  HUMAN_AGENT = 'HUMAN_AGENT',
}

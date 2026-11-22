import { z } from 'zod';
import type { AppEvent } from '../appDefinition';
import { Text } from '../gateways/http';

const fromSeconds = (seconds: number | undefined) =>
  seconds === undefined ? undefined : new Date(seconds * 1000).toISOString();

const Author = z.object({ id: Text, name: z.string().optional() });

const Leadgen = z.looseObject({
  leadgen_id: Text,
  form_id: Text.optional(),
  ad_id: Text.optional(),
  created_time: z.number().optional(),
});

const Feed = z.looseObject({
  item: z.string(),
  verb: z.string(),
  post_id: Text.optional(),
  comment_id: Text.optional(),
  parent_id: Text.optional(),
  message: z.string().optional(),
  link: z.string().optional(),
  photo: z.string().optional(),
  video: z.string().optional(),
  from: Author.optional(),
  created_time: z.number().optional(),
});

const Mention = z.looseObject({
  item: z.string(),
  verb: z.string(),
  post_id: Text.optional(),
  comment_id: Text.optional(),
  sender_id: Text.optional(),
  sender_name: z.string().optional(),
  message: z.string().optional(),
});

const Rating = z.looseObject({
  verb: z.string(),
  reviewer_id: Text.optional(),
  reviewer_name: z.string().optional(),
  rating: z.number().optional(),
  recommendation_type: z.string().optional(),
  review_text: z.string().optional(),
  open_graph_story_id: Text.optional(),
  created_time: z.number().optional(),
});

const Messaging = z.looseObject({
  sender: z.object({ id: Text }),
  recipient: z.object({ id: Text }),
  timestamp: z.number(),
  message: z
    .looseObject({
      mid: z.string(),
      text: z.string().optional(),
      is_echo: z.boolean().optional(),
      attachments: z
        .array(
          z.object({
            type: z.string(),
            payload: z.looseObject({ url: z.string().optional() }).nullish(),
          }),
        )
        .optional(),
    })
    .optional(),
});

const Body = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: Text,
      changes: z.array(z.object({ field: z.string(), value: z.unknown() })).optional(),
      messaging: z.array(z.unknown()).optional(),
    }),
  ),
});

type Parsed = (pageId: string, value: unknown) => AppEvent | null;

const event =
  <S extends z.ZodType>(
    type: string,
    schema: S,
    make: (value: z.output<S>) => { id: string; payload: Record<string, unknown> },
  ): Parsed =>
  (pageId, value) => {
    const parsed = schema.safeParse(value);

    if (!parsed.success) return null;

    const { id, payload } = make(parsed.data);

    return { id, type, payload: { pageId, ...payload, raw: value } };
  };

const CHANGES: Record<string, Parsed> = {
  leadgen: event('leadgen', Leadgen, (lead) => ({
    id: lead.leadgen_id,
    payload: {
      leadId: lead.leadgen_id,
      formId: lead.form_id,
      adId: lead.ad_id,
      createdTime: fromSeconds(lead.created_time),
    },
  })),
  feed: event('feed', Feed, (feed) => ({
    id: `${feed.item}:${feed.verb}:${feed.comment_id ?? feed.post_id ?? feed.created_time ?? ''}`,
    payload: {
      item: feed.item,
      verb: feed.verb,
      postId: feed.post_id,
      commentId: feed.comment_id,
      parentId: feed.parent_id,
      message: feed.message,
      link: feed.link,
      photo: feed.photo,
      video: feed.video,
      fromId: feed.from?.id,
      fromName: feed.from?.name,
      createdTime: fromSeconds(feed.created_time),
    },
  })),
  mention: event('mention', Mention, (mention) => ({
    id: `${mention.item}:${mention.verb}:${mention.comment_id ?? mention.post_id ?? ''}`,
    payload: {
      item: mention.item,
      verb: mention.verb,
      postId: mention.post_id,
      commentId: mention.comment_id,
      senderId: mention.sender_id,
      senderName: mention.sender_name,
      message: mention.message,
    },
  })),
  ratings: event('ratings', Rating, (rating) => ({
    id: `${rating.verb}:${rating.open_graph_story_id ?? `${rating.reviewer_id}:${rating.created_time}`}`,
    payload: {
      verb: rating.verb,
      reviewerId: rating.reviewer_id,
      reviewerName: rating.reviewer_name,
      rating: rating.rating,
      recommendation: rating.recommendation_type,
      reviewText: rating.review_text,
      storyId: rating.open_graph_story_id,
      createdTime: fromSeconds(rating.created_time),
    },
  })),
};

const message = (pageId: string, value: unknown): AppEvent | null => {
  const parsed = Messaging.safeParse(value);
  const sent = parsed.data?.message;

  if (!parsed.success || !sent || sent.is_echo) return null;

  const [attachment] = sent.attachments ?? [];

  return {
    id: sent.mid,
    type: 'messages',
    payload: {
      pageId,
      senderId: parsed.data.sender.id,
      recipientId: parsed.data.recipient.id,
      messageId: sent.mid,
      text: sent.text,
      attachmentType: attachment?.type,
      attachmentUrl: attachment?.payload?.url,
      sentAt: new Date(parsed.data.timestamp).toISOString(),
      raw: value,
    },
  };
};

export const pageEvents = (body: unknown) => {
  const parsed = Body.safeParse(body);

  if (!parsed.success || parsed.data.object !== 'page') return [];

  return parsed.data.entry.map((entry) => ({
    route: entry.id,
    events: [
      ...(entry.changes ?? []).flatMap(
        (change) => CHANGES[change.field]?.(entry.id, change.value) ?? [],
      ),
      ...(entry.messaging ?? []).flatMap((item) => message(entry.id, item) ?? []),
    ],
  }));
};

export const Lead = z.object({
  created_time: z.string().optional(),
  ad_id: Text.optional(),
  adset_id: Text.optional(),
  campaign_id: Text.optional(),
  form_id: Text.optional(),
  platform: z.string().optional(),
  is_organic: z.boolean().optional(),
  field_data: z.array(z.object({ name: z.string(), values: z.array(Text).optional() })).default([]),
});

export const LEAD_FIELDS =
  'created_time,ad_id,adset_id,campaign_id,form_id,platform,is_organic,field_data';

export const leadPayload = (lead: z.output<typeof Lead>, payload: Record<string, unknown>) => ({
  ...Object.fromEntries(
    lead.field_data.map((answer) => [answer.name, (answer.values ?? []).join(', ')]),
  ),
  ...payload,
  formId: lead.form_id ?? payload.formId,
  adId: lead.ad_id ?? payload.adId,
  adsetId: lead.adset_id,
  campaignId: lead.campaign_id,
  platform: lead.platform,
  organic: lead.is_organic,
  createdTime: lead.created_time ?? payload.createdTime,
});

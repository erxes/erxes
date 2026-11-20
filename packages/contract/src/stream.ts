import { STREAM_TOPICS } from '@erxes/core-db/enums';
import { z } from 'zod';

export const StreamTopic = z.union([
  z.enum(STREAM_TOPICS),
  z.templateLiteral(['timeline:', z.string(), ':', z.string()]),
  z.templateLiteral(['automations.runs:', z.string()]),
  z.templateLiteral(['webhooks.deliveries:', z.string()]),
  z.templateLiteral(['broadcasts:', z.string()]),
  z.templateLiteral(['plugin:', z.string(), ':', z.string()]),
]);

export type StreamTopic = z.infer<typeof StreamTopic>;

export const StreamChanged = z.object({ topics: z.array(StreamTopic) });

export type StreamChanged = z.infer<typeof StreamChanged>;

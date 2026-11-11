import { z } from 'zod';

/**
 * Messages on `GET /core/v1/stream` (Server-Sent Events, outside the oRPC
 * router). They are signals, never record data: `inbox`, `resync` and `bye`
 * carry nothing the client reads.
 */
export const LiveHello = z.object({ mode: z.enum(['live', 'polling']) });

export const LiveTimeline = z.object({
  targets: z.array(z.object({ targetType: z.enum(['customer', 'company']), targetId: z.string() })),
});

export type LiveTimeline = z.infer<typeof LiveTimeline>;

/** A plugin's topics changed (`core_live_signal`): its UI refetches them. */
export const LivePlugin = z.object({ plugin: z.string(), topics: z.array(z.string()) });

export type LivePlugin = z.infer<typeof LivePlugin>;

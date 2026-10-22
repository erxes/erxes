import { defineIndexes, defineSchema, defineUses } from 'erxes-sdk/server';
import * as z from 'zod';

// One follow-up per deal: when to get back to it and why. Nothing from the
// deal is shown without reading it from sales as the viewer, so only the
// pipeline is kept, for the link back to the deal.
export const FollowUp = z.object({
  dealId: z.string(),
  pipelineId: z.string().nullable(),
  dueDate: z.iso.date(),
  note: z.string().max(500),
  setBy: z.string(),
});

export const schema = defineSchema({ followUps: FollowUp });

export const uses = defineUses({ sales: 1 });

declare module 'erxes-sdk/server' {
  interface Register {
    schema: typeof schema;
    uses: typeof uses;
  }
}

// The storage half of "one follow-up per deal": a second one for the same
// deal fails with CONFLICT instead of being stored.
export const indexes = defineIndexes({
  followUps: [{ keys: { dealId: 1 }, unique: true }],
});

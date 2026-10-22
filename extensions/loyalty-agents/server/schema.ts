import { defineSchema } from 'erxes-sdk/server';
import * as z from 'zod';

export const AgentStatus = z.enum(['active', 'draft', 'archived']);

const percent = z.number().min(0).max(100);

// A customer or company that sells on the tenant's behalf and earns a
// return, or buys at a prepaid or discount rate.
export const Agent = z.object({
  number: z.string().min(1, 'Agent number is missing'),
  status: AgentStatus,
  customerIds: z.array(z.string()).default([]),
  companyIds: z.array(z.string()).default([]),
  startDate: z.iso.datetime().nullable().default(null),
  endDate: z.iso.datetime().nullable().default(null),
  hasReturn: z.boolean(),
  returnAmount: z.number().min(0).nullable().default(null),
  returnPercent: percent.nullable().default(null),
  prepaidPercent: percent.nullable().default(null),
  discountPercent: percent.nullable().default(null),
});

export const schema = defineSchema({ agents: Agent });

declare module 'erxes-sdk/server' {
  interface Register {
    schema: typeof schema;
  }
}

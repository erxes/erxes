import { automations } from '@erxes/core-db/schema';
import { AutomationDefinition } from '@erxes/core-db/automationDefinition';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { isoDate } from './common';
import { AutomationId } from './records';

export const HookSample = z.object({
  body: z.json().nullable(),
  query: z.record(z.string(), z.json()),
  at: z.iso.datetime(),
});

export type HookSample = z.infer<typeof HookSample>;

export const Automation = createSelectSchema(automations, {
  id: AutomationId,
  definition: AutomationDefinition,
  activeVersion: () => z.int(),
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    name: true,
    description: true,
    status: true,
    definition: true,
    /** The version runs start with (null until first activated). */
    activeVersion: true,
    activatedBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    stats: z.object({
      running: z.int(),
      succeeded: z.int(),
      failed: z.int(),
    }),
    hookUrl: z.string(),
    hookSample: HookSample.nullable(),
  });

export type Automation = z.infer<typeof Automation>;

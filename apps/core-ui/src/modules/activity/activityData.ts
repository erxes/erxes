import type { Activity } from '@erxes/core-contract';
import { z } from 'zod';

/*
 * `Activity.data` is JSON whose shape depends on the type. Core's own types
 * have known shapes (see CORE_ACTIVITY_TYPES in the contract); each is read
 * through its schema, and an entry that doesn't match shows without details.
 */

/** Reads an entry's data with `schema`: the data, or null when it has another shape. */
const reader =
  <T>(schema: z.ZodType<T>) =>
  (activity: Pick<Activity, 'data'>) => {
    const parsed = schema.safeParse(activity.data);

    return parsed.success ? parsed.data : null;
  };

/** Absent means none, as core's note schema defaults them; a list of anything else is another shape. */
const ids = z.array(z.string()).default([]);

/** `field → [before, after]`; the values are whatever the field holds. */
const changes = z.record(z.string(), z.tuple([z.unknown(), z.unknown()]));

const note = z.object({
  body: z.string(),
  mentions: ids,
  fileIds: ids,
  history: z.array(z.object({ body: z.string(), editedAt: z.string() })).default([]),
});

export type NoteData = z.infer<typeof note>;

export const readChanges = reader(z.object({ changes }).transform((data) => data.changes));
export const readNote = reader(note);
export const readTagged = reader(z.object({ added: ids, removed: ids }));
export const readMerged = reader(z.object({ mergedNames: z.array(z.string()) }));

export const readCompanyLink = reader(
  z.object({ companyId: z.string(), companyName: z.string().optional() }),
);

export const readCustomerLink = reader(
  z.object({ customerId: z.string(), customerName: z.string().optional() }),
);

export const readLead = reader(
  z.object({
    event: z.string().optional(),
    to: z.object({ name: z.string().optional(), color: z.string().optional() }).nullable(),
    // Core writes null when the move gave no reason.
    reason: z.string().nullish(),
  }),
);

export const isNoteType = (type: string) => type.endsWith('.note');

/** `customer.tagged` → `tagged`. */
export const verbOf = (activity: Activity) => activity.type.slice(activity.type.indexOf('.') + 1);

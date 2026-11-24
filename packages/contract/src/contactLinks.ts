import { customerCompanies } from '@erxes/core-db/schema';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { isoDate } from './common';

/** What links a person and a company: their role there, main contact, left. */
export const ContactLink = createSelectSchema(customerCompanies, {
  endedAt: isoDate,
  createdAt: isoDate,
}).pick({
  role: true,
  /** The company's main contact (one per company). */
  isPrimaryContact: true,
  /** No longer there; the link stays as history. */
  endedAt: true,
  createdAt: true,
});

export type ContactLink = z.infer<typeof ContactLink>;

/** Setting a link: any of its attributes (others stay; a new link starts with none). */
export const ContactLinkInput = createUpdateSchema(customerCompanies, {
  role: (role) => role.trim().max(100),
})
  .pick({ role: true, isPrimaryContact: true })
  .extend({
    /** `true`: left now; `false`: back (current again). */
    ended: z.boolean().optional(),
  });

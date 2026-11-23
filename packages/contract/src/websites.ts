import { customerAccounts, websites } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

/**
 * Where a website's pages run, as browsers send it in `Origin`: `https://host[:port]`, or
 * `http://localhost[:port]` while developing.
 */
export const WebOrigin = z
  .string()
  .trim()
  .toLowerCase()
  .max(200)
  .regex(
    /^(https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)+|http:\/\/(localhost|127\.0\.0\.1))(:\d{1,5})?$/,
    'a web address: https://shop.example.com or http://localhost:3000',
  );

/** A website or app customers sign in to: a plugin's store, hotel or tour site (decision 42). */
export const Website = createSelectSchema(websites, {
  id: Id,
  origins: () => z.array(z.string()),
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  /** The plugin whose record it is. */
  plugin: true,
  /** That record's id in the plugin, such as a store's. */
  recordId: true,
  name: true,
  origins: true,
  createdAt: true,
  updatedAt: true,
});

export type Website = z.infer<typeof Website>;

/** A website with how many customers have an account on it. */
export const WebsiteListItem = Website.extend({ accounts: z.int() });

export type WebsiteListItem = z.infer<typeof WebsiteListItem>;

/** A customer's sign-up on one website, as staff see it. */
export const CustomerAccount = createSelectSchema(customerAccounts, {
  id: Id,
  createdAt: isoDate,
  lastSignedInAt: isoDate,
})
  .pick({
    id: true,
    websiteId: true,
    customerId: true,
    createdAt: true,
    lastSignedInAt: true,
  })
  .extend({
    websiteName: z.string(),
    /** The plugin whose website it is. */
    plugin: z.string(),
    /** The emails and phones it signs in with. */
    logins: z.array(z.string()),
    /** Devices and browsers signed in now. */
    sessions: z.int(),
  });

export type CustomerAccount = z.infer<typeof CustomerAccount>;

const { UNKNOWN_WEBSITE } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, UNKNOWN_WEBSITE });

/** Plugins keep their websites here; members see them in Settings › Websites. */
export const websitesContract = {
  list: base
    .route({
      method: 'GET',
      path: '/websites',
      summary: 'List websites',
      description:
        'Websites customers sign in to, by name, with their accounts. A plugin gets its own',
    })
    .output(listOf(WebsiteListItem)),
  save: base
    .route({
      method: 'PUT',
      path: '/websites/{recordId}',
      summary: 'Add or change a website',
      description:
        "Add or change the website of one of the plugin's records (plugins only). Its id goes in sign-in calls",
    })
    .input(
      z.object({
        recordId: Id,
        name: z.string().trim().min(1).max(200),
        origins: z
          .array(WebOrigin)
          .max(20)
          .refine((list) => new Set(list).size === list.length, 'each web address once'),
      }),
    )
    .output(Website),
  remove: base
    .route({
      method: 'DELETE',
      path: '/websites/{recordId}',
      summary: 'Remove a website',
      description:
        "Remove the website of one of the plugin's records (plugins only), with its accounts. 400 UNKNOWN_WEBSITE",
    })
    .input(z.object({ recordId: Id }))
    .output(z.object({ ok: z.literal(true) })),
};

/**
 * Staff see a customer's accounts on the organisation's websites. Only the customer signs
 * their account out (`/customer/me/*`); staff don't act on it.
 */
export const customerAccountsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/customers/{customerId}/accounts',
      summary: 'List a customer’s accounts',
      description: "A customer's accounts, one per website they signed up on",
    })
    .input(z.object({ customerId: Id }))
    .output(listOf(CustomerAccount)),
};

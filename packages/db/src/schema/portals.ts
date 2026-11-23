import { sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { orgIdColumn, pgTable } from '../table';
import { createdAt, updatedAt } from './common';
import { integrationConnections } from './integrations';
import { organizations } from './organizations';

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

const addresses = () =>
  text()
    .array()
    .default(sql`'{}'::text[]`)
    .notNull();

/**
 * A portal customers sign in to (decision 42): a shop, hotel or tour site and its mobile apps.
 * The organisation owns it; plugins attach to it (`portalPlugins`). Each portal has its own
 * accounts, so the same person on two portals is one customer with two accounts.
 */
export const portals = pgTable(
  'portals',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    name: text().notNull(),
    /** Its emails come from this name ("Acme Shop"); null: the portal's name. */
    senderName: text(),
    /** Web: where browsers call from, `https://shop.example.mn`, `http://localhost:3000`. */
    origins: addresses(),
    /** iOS: its apps' bundle ids (`mn.acme.shop`), which Apple sign-in tokens name. */
    iosBundleIds: addresses(),
    /** Android: its apps' package names (`mn.acme.shop`). */
    androidPackages: addresses(),
    /** Customers sign in with a code emailed to them. */
    emailSignIn: boolean().default(true).notNull(),
    /** Customers sign in with their phone: a texted code, or by texting one (`phoneConnectionId`). */
    phoneSignIn: boolean().default(true).notNull(),
    /** A verify.mn connection: customers text the code to prove their phone. Null: core texts it. */
    phoneConnectionId: text(),
    /** The Google sign-in connection whose client ids its tokens are for; null: off. */
    googleConnectionId: text(),
    /** The Apple sign-in connection; null: off. */
    appleConnectionId: text(),
    /** The Facebook Login connection; null: off. */
    facebookConnectionId: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('core_portals_org_name_idx').on(table.orgId, table.name),
    // CORS asks across organisations whether any portal runs at an origin.
    index('core_portals_origins_idx').using('gin', table.origins),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_portals_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.phoneConnectionId],
      foreignColumns: [integrationConnections.id],
      name: 'core_portals_phone_connection_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.googleConnectionId],
      foreignColumns: [integrationConnections.id],
      name: 'core_portals_google_connection_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.appleConnectionId],
      foreignColumns: [integrationConnections.id],
      name: 'core_portals_apple_connection_id_fkey',
    }).onDelete('set null'),
    foreignKey({
      columns: [table.facebookConnectionId],
      foreignColumns: [integrationConnections.id],
      name: 'core_portals_facebook_connection_id_fkey',
    }).onDelete('set null'),
  ],
);

/**
 * A plugin's record on a portal: an ecommerce store, a content site, a tour channel. Each
 * attached plugin serves the portal's customers under its own `/customer/*` routes; a portal
 * signs customers in while one of its plugins is installed.
 */
export const portalPlugins = pgTable(
  'portal_plugins',
  {
    orgId: orgIdColumn(),
    portalId: text().notNull(),
    plugin: text().notNull(),
    /** The plugin's record on the portal, such as a store's id. */
    recordId: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.portalId, table.plugin], name: 'core_portal_plugins_pkey' }),
    uniqueIndex('core_portal_plugins_org_plugin_record_key').on(
      table.orgId,
      table.plugin,
      table.recordId,
    ),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_portal_plugins_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.portalId],
      foreignColumns: [portals.id],
      name: 'core_portal_plugins_portal_id_fkey',
    }).onDelete('cascade'),
  ],
);

/**
 * A portal's customer key: its own server trades it for 15-minute portal tokens that every
 * attached plugin checks. Kept as a hash; the secret shows once.
 */
export const portalKeys = pgTable(
  'portal_keys',
  {
    id: text().primaryKey(),
    orgId: orgIdColumn(),
    portalId: text().notNull(),
    name: text().notNull(),
    secretHash: text().notNull(),
    /** The secret's last 4 characters, to tell keys apart. */
    hint: text().notNull(),
    createdBy: text(),
    createdAt: createdAt(),
    lastUsedAt: timestamptz(),
  },
  (table) => [
    index('core_portal_keys_org_portal_idx').on(table.orgId, table.portalId),
    foreignKey({
      columns: [table.orgId],
      foreignColumns: [organizations.id],
      name: 'core_portal_keys_org_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.portalId],
      foreignColumns: [portals.id],
      name: 'core_portal_keys_portal_id_fkey',
    }).onDelete('cascade'),
  ],
);

import { integrationConnections } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { IntegrationKey } from './values';

// Plugins use the organisation's connections of core's integrations (decision 52).

/** A core integration whose connections a plugin uses (`facebook`), and why, for the owner. */
export const PluginConnectionUse = z.object({
  integration: IntegrationKey,
  reason: z.string().trim().min(1).max(300),
});

/** A connection as a plugin that uses it sees it: never its secrets. */
const UsableConnection = createSelectSchema(integrationConnections, {
  id: Id,
  createdAt: isoDate,
  settings: z.record(z.string(), z.unknown()),
}).pick({ id: true, key: true, name: true, settings: true, status: true, createdAt: true });

/**
 * A connection's sign-in for a plugin that uses it: the token to call the service with, and the
 * app it signed in through (its secret checks the service's webhook signatures).
 */
export const ConnectionCredentials = z.object({
  connectionId: z.string(),
  key: z.string(),
  accessToken: z.string(),
  /** Unix seconds; null when the service gave none. Ask again after it. */
  expiresAt: z.int().nullable(),
  /** The account it signed in as, as the service names it. */
  account: z.string().nullable(),
  appId: z.string().nullable(),
  appSecret: z.string().nullable(),
});

export type ConnectionCredentials = z.infer<typeof ConnectionCredentials>;

const base = oc.errors({ ...COMMON_ERRORS, NOT_CONNECTED: ERRORS.NOT_CONNECTED });

/** In `integrationsContract`. */
export const connectionUseContract = {
  usable: base
    .route({
      method: 'GET',
      path: '/integrations/{key}/usable',
      summary: 'List connections a plugin uses',
      description:
        "Plugins only: the organisation's active connections of an integration the plugin's manifest `connections` names and the owner approved (`uses:<key>`), never their secrets. 403 SCOPE_REQUIRED otherwise",
    })
    .input(z.object({ key: IntegrationKey }))
    .output(listOf(UsableConnection)),
  credentials: base
    .route({
      method: 'POST',
      path: '/integrations/connections/{id}/credentials',
      summary: 'Get a connection’s token',
      description:
        'Plugins only: a fresh token of a connection the plugin may use (`usable`), renewed first when it is about to expire, and the app it signed in through. Audited. 403 SCOPE_REQUIRED, 404 NOT_FOUND, 409 NOT_CONNECTED when it signs in without OAuth',
    })
    .input(z.object({ id: Id }))
    .output(ConnectionCredentials),
};

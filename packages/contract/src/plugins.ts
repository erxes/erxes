import { oc } from '@orpc/contract';
import { z } from 'zod';
import { Id } from './common';
import { EventType } from './platform';

/** A plugin's name: its namespace everywhere (`hr` → `hr.leave.requested`, `/hr/*`). */
export const PluginName = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{0,39}$/, 'lower case letters, digits and _ (starting with a letter)')
  .refine((name) => name !== 'core', 'reserved');

/**
 * What a plugin may do in core, granted per organisation when it is
 * installed. A plugin only ever gets the scopes it asked for in its manifest.
 */
export const PLUGIN_SCOPES = [
  'activities:write',
  'audit:write',
  'events:write',
  'files:read',
  'files:write',
  'live:write',
  'notifications:write',
] as const;
export const PluginScope = z.enum(PLUGIN_SCOPES);
export type PluginScope = z.infer<typeof PluginScope>;

/** Live update topic: `leave-requests`, `leave:abc123`. */
export const LiveTopic = z
  .string()
  .trim()
  .regex(/^[a-z0-9][a-z0-9._:-]{0,99}$/, 'lower case letters, digits and . _ : -');

const HttpsUrl = z
  .string()
  .trim()
  .url()
  .max(500)
  .refine((value) => /^https?:\/\//.test(value), 'an http(s) address');

export const PluginManifest = z.object({
  title: z.string().trim().min(1).max(80),
  version: z.string().trim().min(1).max(40),
  description: z.string().trim().max(500).optional(),
  /** Module Federation remote: container name and `remoteEntry.js` address. */
  ui: z
    .object({
      remote: z
        .string()
        .trim()
        .regex(/^[a-z][a-z0-9_]{0,59}$/),
      entry: HttpsUrl,
    })
    .optional(),
  /** The plugin API's public address: plugin UIs call it with a session token. */
  api: z.object({ url: HttpsUrl }).optional(),
  scopes: z.array(PluginScope).max(PLUGIN_SCOPES.length).default([]),
  /** Actions members can be granted (`hr.leave.approve`), shown in roles. */
  permissions: z
    .array(
      z.object({
        action: z
          .string()
          .trim()
          .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/),
        label: z.string().trim().min(1).max(100),
        description: z.string().trim().max(300).optional(),
        group: z.string().trim().max(60).optional(),
      }),
    )
    .max(500)
    .optional(),
  notificationKinds: z
    .array(
      z.object({
        kind: EventType,
        label: z.string().trim().min(1).max(100),
        description: z.string().trim().max(300).optional(),
      }),
    )
    .max(200)
    .optional(),
  /** Events it publishes: triggers for automations. */
  events: z
    .array(
      z.object({
        type: EventType,
        label: z.string().trim().min(1).max(100),
        description: z.string().trim().max(300).optional(),
      }),
    )
    .max(500)
    .optional(),
});
export type PluginManifest = z.infer<typeof PluginManifest>;

export const Plugin = z.object({
  name: z.string(),
  title: z.string(),
  version: z.string().nullable(),
  description: z.string().nullable(),
  ui: z.object({ remote: z.string(), entry: z.string() }).nullable(),
  api: z.object({ url: z.string() }).nullable(),
  /** In this organisation: installed and active. */
  installed: z.boolean(),
  requestedScopes: z.array(z.string()),
  grantedScopes: z.array(z.string()),
  /** Asks for scopes the owner hasn't granted yet (a newer version). */
  needsApproval: z.boolean(),
  installedAt: z.string().datetime().nullable(),
});
export type Plugin = z.infer<typeof Plugin>;

export const TokenResponse = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int(),
  scope: z.string(),
});

/**
 * Plugins: the registry (manifests), per-organisation installations with
 * granted scopes, tokens for plugin servers (client credentials) and for
 * plugin UIs (a member's short-lived session for one plugin's API), and live
 * signals to plugin UIs.
 */
export const pluginsContract = {
  token: oc
    .route({
      method: 'POST',
      path: '/plugins/token',
      summary:
        'Client credentials → a 15-minute token (ES256). With `org`: to act in an organisation that installed the plugin; without: to update the manifest',
    })
    .input(
      z.object({
        grant_type: z.literal('client_credentials'),
        client_id: PluginName,
        client_secret: z.string().min(32).max(200),
        org: Id.optional(),
      }),
    )
    .output(TokenResponse),
  registerManifest: oc
    .route({
      method: 'PUT',
      path: '/plugins/manifest',
      summary: 'The calling plugin declares its UI, API, scopes, permissions and events',
    })
    .input(PluginManifest)
    .output(z.object({ ok: z.literal(true) })),
  list: oc
    .route({
      method: 'GET',
      path: '/plugins',
      summary: 'Plugins of this deployment, and which are installed here',
    })
    .output(z.object({ data: z.array(Plugin) })),
  install: oc
    .route({
      method: 'POST',
      path: '/plugins/{name}/install',
      summary: 'Install (or approve the new scopes of) a plugin (owners)',
    })
    .input(z.object({ name: PluginName }))
    .output(Plugin),
  uninstall: oc
    .route({
      method: 'POST',
      path: '/plugins/{name}/uninstall',
      summary: 'Uninstall a plugin: its tokens stop working at once (owners)',
    })
    .input(z.object({ name: PluginName }))
    .output(Plugin),
  session: oc
    .route({
      method: 'POST',
      path: '/plugins/{name}/session',
      summary:
        "A 5-minute token for one plugin's API, for the signed-in member (plugin UIs send it as Bearer)",
    })
    .input(z.object({ name: PluginName }))
    .output(
      z.object({
        token: z.string(),
        expiresAt: z.string().datetime(),
        apiUrl: z.string().nullable(),
      }),
    ),
  signal: oc
    .route({
      method: 'POST',
      path: '/plugins/live',
      summary:
        "Tell the plugin's open UIs something changed (plugins with live:write); no data, UIs refetch",
    })
    .input(
      z.object({
        topics: z.array(LiveTopic).min(1).max(50),
        userIds: z.array(Id).max(1000).optional(),
      }),
    )
    .output(z.object({ ok: z.literal(true) })),
};

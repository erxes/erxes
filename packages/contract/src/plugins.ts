import { AUTOMATION_SUBJECTS, CONTENT_TYPES } from '@erxes/core-db/enums';
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { EventPattern } from './webhooks';
import { Id, listOf } from './common';
import { ActionField } from './automationRuns';
import { Country } from './money';
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
  'customers:read',
  'customers:write',
  'audit:write',
  'events:read',
  'events:write',
  'files:read',
  'files:write',
  'live:write',
  'notifications:write',
  'payments:read',
  'payments:write',
  'products:read',
  'products:write',
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
  .check(z.url())
  .max(500)
  .refine((value) => /^https?:\/\//.test(value), 'an http(s) address');

/**
 * A web origin a customer app runs at: `https://host[:port]`, where
 * `{subdomain}` may stand for a whole label (the organisation's), or
 * `http://localhost[:port]` while developing.
 */
const AppOrigin = z
  .string()
  .trim()
  .max(200)
  .regex(
    /^(https:\/\/(\{subdomain\}|[a-z0-9-]+)(\.(\{subdomain\}|[a-z0-9-]+))+|http:\/\/(localhost|127\.0\.0\.1))(:\d{1,5})?$/,
    'an origin: https://shop.example.com, https://{subdomain}.shop.example.com or http://localhost:3000',
  );

export const PluginManifest = z.object({
  title: z.string().trim().min(1).max(80),
  version: z.string().trim().min(1).max(40),
  description: z.string().trim().max(500).optional(),
  /**
   * The countries it is made for (ISO 3166: `['MN']` for eBarimt receipts);
   * none: everywhere. Plugin lists offer it first to organisations there;
   * anyone may still install it.
   */
  countries: z.array(Country).max(250).optional(),
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
  /**
   * "Sign in with erxes" for the plugin's own app (OAuth 2.1 + PKCE): the
   * exact addresses codes may be sent to; `{subdomain}` stands for the
   * organisation's (`https://{subdomain}.hr.erxes.io/auth/callback`).
   */
  oauth: z
    .object({
      redirectUris: z
        .array(
          z
            .string()
            .trim()
            .max(500)
            .regex(/^https?:\/\/[^\s#]+$/, 'an http(s) address without a fragment'),
        )
        .min(1)
        .max(20),
    })
    .optional(),
  /**
   * The plugin's app for customers (a shop, tracking, booking). It signs
   * customers in by calling `/customer-auth/*` itself (decision 42); browsers
   * may call `/customer-auth/*` and `/customer/*` only from these origins.
   * Apps without an origin (mobile) are limited by rate instead.
   */
  customerApp: z.object({ origins: z.array(AppOrigin).min(1).max(20) }).optional(),
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
  /**
   * Actions automations can run (`hr.leave.create`): core POSTs
   * `{ input, context }` to `<api.url>/automations/actions/<type>` with a
   * core token and an `Idempotency-Key`; the JSON answer is the step's output.
   */
  actions: z
    .array(
      z.object({
        type: EventType,
        label: z.string().trim().min(1).max(100),
        description: z.string().trim().max(300).optional(),
        subject: z.enum(AUTOMATION_SUBJECTS).optional(),
        fields: z.array(ActionField).max(50).default([]),
      }),
    )
    .max(200)
    .optional(),
  /** Its own record types that get a timeline in erxes (notes, mentions, entries), and who may see it. */
  timelines: z
    .array(
      z.object({
        type: z.string().regex(/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/),
        label: z.string().trim().min(1).max(100),
        /** A permission action of the plugin (`hr.employee.view`); none: every member. */
        permission: z.string().optional(),
      }),
    )
    .max(50)
    .optional(),
  /**
   * How its timeline entries look: a label, a colour and an icon per type —
   * one of IconBeach, IconBriefcase, IconCalendarEvent, IconCash,
   * IconChecklist, IconCreditCard, IconFileText, IconGift, IconHeartHandshake,
   * IconMail, IconMessage, IconPackage, IconPhoneCall, IconReceipt,
   * IconShoppingCart, IconStar, IconTicket, IconTruck, IconUserCheck, IconUsers.
   */
  activityTypes: z
    .array(
      z.object({
        type: EventType,
        label: z.string().trim().min(1).max(100),
        icon: z.string().trim().max(60).optional(),
        color: z
          .string()
          .trim()
          .regex(/^#[0-9a-fA-F]{6}$/)
          .optional(),
      }),
    )
    .max(500)
    .optional(),
  /**
   * Events it wants at its API (`core.payment.*`, `core.customer.created`,
   * `hr.*`): core POSTs each to `<api.url>/events` with a core token, retrying
   * until it answers 2xx. Payment events: its own invoices only (scope
   * `payments:read`); customer and company events need `customers:read`;
   * other plugins' events need `events:read`. Its own events are not sent back.
   */
  subscriptions: z.array(EventPattern).max(100).optional(),
  /**
   * Events it publishes: triggers for automations. `subject`: what its events
   * are about (published with `subject`), so automations started by it can
   * use that record's fields and run customer or company actions.
   */
  events: z
    .array(
      z.object({
        type: EventType,
        label: z.string().trim().min(1).max(100),
        description: z.string().trim().max(300).optional(),
        subject: z.enum(CONTENT_TYPES).optional(),
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
  /** Made for these countries (empty: everywhere). */
  countries: z.array(z.string()),
  ui: z.object({ remote: z.string(), entry: z.string() }).nullable(),
  api: z.object({ url: z.string() }).nullable(),
  /** In this organisation: installed and active. */
  installed: z.boolean(),
  /** Why it is off here (`Suspended: 600 deletions in a few minutes`). */
  statusReason: z.string().nullable(),
  requestedScopes: z.array(z.string()),
  grantedScopes: z.array(z.string()),
  /** Asks for scopes the owner hasn't granted yet (a newer version). */
  needsApproval: z.boolean(),
  installedAt: z.iso.datetime().nullable(),
});

export type Plugin = z.infer<typeof Plugin>;

export const TokenResponse = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.int(),
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
    .output(listOf(Plugin)),
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
        expiresAt: z.iso.datetime(),
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

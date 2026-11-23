import { CONTENT_TYPES, PLUGIN_SCOPES, TAX_RECEIPT_ISSUERS } from '@erxes/core-db/enums';
import { pluginInstallations, plugins } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { COMMON_ERRORS, ERRORS } from './errors';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { EventPattern } from './webhooks';
import { httpUrl, Id, isoDate, listOf } from './common';
import { DataField, PluginAction } from './automationRuns';
import { Country } from './money';
import { EventType } from './platform';
import { PluginName } from './values';
import { PluginAssistant } from './pluginAssistant';
import { PluginFields } from './pluginFields';
import { PluginConnectionUse } from './connectionUse';
import { PluginIntegrations } from './integrations';
import { PluginRelations } from './pluginRelations';
import { PluginJobs } from './pluginJobs';
import { PluginTransfers } from './pluginTransfer';
import { ManifestPermissionSet } from './roles';
import { PluginTimeline } from './timelines';
import { PluginTranslations } from './pluginTranslations';
import { PluginApiDocs } from './pluginApiDocs';
import { PluginSearchSource } from './search';
import { PluginRead, pluginReadsContract } from './pluginReads';

export { PLUGIN_SCOPES };

export const PluginScope = z.enum(PLUGIN_SCOPES);

export type PluginScope = z.infer<typeof PluginScope>;

/** Live update topic: `leave-requests`, `leave:wKbpQmWs3Aj7WXjc2` (record ids are mixed case). */
export const LiveTopic = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/, 'letters, digits and . _ : -');

const HttpsUrl = httpUrl(500);

export const PluginManifest = z.object({
  title: z.string().trim().min(1).max(80),
  translations: PluginTranslations.optional(),
  version: z.string().trim().min(1).max(40),
  description: z.string().trim().max(500).optional(),
  /**
   * The countries it is made for (ISO 3166: `['MN']` for eBarimt receipts);
   * none: everywhere. Plugin lists offer it first to organisations there;
   * anyone may still install it.
   */
  countries: z.array(Country).max(250).optional(),
  /**
   * Who issues tax receipts for its invoices: core's integration (eBarimt,
   * the default), or `own` when the plugin sends them itself. Core issues
   * none for an `own` plugin's invoices, so no invoice gets two.
   */
  taxReceipts: z.enum(TAX_RECEIPT_ISSUERS).optional(),
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
  /** The plugin API's public address (plugin UIs call it with a session token), and its documents. */
  api: z.object({ url: HttpsUrl, docs: PluginApiDocs.optional() }).optional(),
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
   * Routes for callers outside erxes that can't sign in (a GitHub webhook, an app install's
   * redirect). Core serves `/core/v1/plugins/<name>/public/<orgId>/<path>` and forwards a call
   * whose path is one of these, or under one, to `<api.url>/public/<path>`, with a token naming
   * the organisation (`verifyPublicCall`). `/github/webhook`.
   */
  publicPaths: z
    .array(z.string().regex(/^(\/[a-z0-9][a-z0-9_.-]*)+$/, 'a path like /github/webhook'))
    .max(20)
    .optional(),
  /**
   * Its groups in erxes' global search (Deals, Tickets): web asks each
   * `<api.url><path>?q=&limit=` with the member's session token and shows
   * the answer (`PluginSearchResults`) under the label.
   */
  search: z.array(PluginSearchSource).max(5).optional(),
  scopes: z.array(PluginScope).max(PLUGIN_SCOPES.length).default([]),
  /**
   * Other plugins' APIs it reads on an organisation's behalf (`PluginRead`). Like a new scope,
   * each waits for the owner's approval, and works only where the other plugin is installed
   * too: `plugins.callToken` issues a token for that plugin's API with the approved
   * permissions its manifest declares.
   */
  pluginReads: z.array(PluginRead).max(20).optional(),
  /**
   * The organisation's connections of core's integrations it uses (`facebook`), and why. Like a
   * new scope, each waits for the owner's approval; then `integrations.usable` lists them and
   * `integrations.credentials` gives one's token, so the organisation connects an account once
   * for core and every plugin.
   */
  connections: z.array(PluginConnectionUse).max(10).optional(),
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
  /**
   * Ready-made bundles of its own permissions (`agent`: reply, assign, view),
   * which an owner adds to any role in one click. Members keep one role, so a
   * plugin offers sets instead of roles of its own.
   */
  permissionSets: z.array(ManifestPermissionSet).max(20).optional(),
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
  /** Actions automations can run (`PluginAction`). */
  actions: z.array(PluginAction).max(200).optional(),
  /** Its own record types that get a timeline in erxes (notes, mentions, entries), and who may see it. */
  timelines: z.array(PluginTimeline).max(50).optional(),
  /**
   * Its integrations in Settings › Integrations (`PluginIntegration`), listed next to core's
   * with the state it reports (`integrations.report`).
   */
  integrations: PluginIntegrations.optional(),
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
  /** Background work at its API (`PluginJobs`): core POSTs each job to `<api.url>/jobs/<name>`. */
  jobs: PluginJobs.optional(),
  /** Fields it keeps on customers and companies (`PluginFields`): read-only custom fields to members. */
  fields: PluginFields.optional(),
  /** Its records members import and export through core (`PluginTransfers`): core asks `<api.url>/transfer/*` for the rows. */
  transfer: PluginTransfers.optional(),
  /**
   * Its records that belong to customers or companies (`PluginRelations`): their lists filter
   * by them ("has more than 3 won deals"), through a view the plugin keeps.
   */
  relations: PluginRelations.optional(),
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
        /** The record it is about, singular (`Order`): the builder lists `fields` as "The order". */
        record: z.string().trim().min(1).max(60).optional(),
        /** Its payload's values later steps can insert (`dealId` as "Deal"). */
        fields: z.array(DataField).max(50).optional(),
      }),
    )
    .max(500)
    .optional(),
  assistant: PluginAssistant.optional(),
});

export type PluginManifest = z.infer<typeof PluginManifest>;

/** The plugin in this organisation; `status` `active` is installed. */
export const PluginInstallation = createSelectSchema(pluginInstallations, {
  installedAt: isoDate,
}).pick({
  status: true,
  /** Why it is off here (`Suspended: 600 deletions in a few minutes`). */
  statusReason: true,
  grantedScopes: true,
  installedAt: true,
});

export const Plugin = createSelectSchema(plugins, {
  /** What members see of the manifest (the column is nullable); the rest is for core. */
  manifest: () =>
    PluginManifest.pick({
      title: true,
      translations: true,
      version: true,
      description: true,
      countries: true,
      ui: true,
      api: true,
      search: true,
      pluginReads: true,
      connections: true,
    }),
})
  .pick({ name: true, manifest: true })
  .extend({
    /** Never installed here: null. */
    installation: PluginInstallation.nullable(),
    /** The manifest's scopes, or (before it sent one) what plugins could always do. */
    requestedScopes: z.array(z.string()),
    /** Installed, and asks for scopes the owner hasn't granted yet (a newer version). */
    needsApproval: z.boolean(),
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
 * plugin UIs (a member's short-lived session for one plugin's API), for one
 * plugin reading another's (`pluginReadsContract`), and live signals to plugin UIs.
 */
const {
  CROSS_SITE,
  DUPLICATE_PERMISSION_SET,
  INVALID_CLIENT,
  INVALID_SCHEDULE,
  LIMIT_EXCEEDED,
  NAMESPACE_REQUIRED,
  NOT_INSTALLED,
  PLUGIN_NOT_FOUND,
  UNKNOWN_INTEGRATION,
  UNKNOWN_PERMISSION,
} = ERRORS;

/** What these procedures answer with besides the common errors. */
const base = oc.errors({
  ...COMMON_ERRORS,
  CROSS_SITE,
  DUPLICATE_PERMISSION_SET,
  INVALID_CLIENT,
  INVALID_SCHEDULE,
  LIMIT_EXCEEDED,
  NAMESPACE_REQUIRED,
  NOT_INSTALLED,
  PLUGIN_NOT_FOUND,
  UNKNOWN_INTEGRATION,
  UNKNOWN_PERMISSION,
});

export const pluginsContract = {
  token: base
    .route({
      method: 'POST',
      path: '/plugins/token',
      summary: 'Get a plugin token',
      description:
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
  registerManifest: base
    .route({
      method: 'PUT',
      path: '/plugins/manifest',
      summary: 'Register a plugin manifest',
      description:
        "The calling plugin declares its UI, API, scopes, permissions, events, jobs and assistant skills. 400 INVALID_SCHEDULE when a job's cron doesn't parse",
    })
    .input(PluginManifest)
    .output(
      z.object({
        ok: z.literal(true),
        /**
         * What the manifest leaves out that members will miss, one line each ("Event
         * shop.order.created declares no fields: …"). The SDK logs them at start.
         */
        warnings: z.array(z.string()),
      }),
    ),
  list: base
    .route({
      method: 'GET',
      path: '/plugins',
      summary: 'List plugins',
      description: 'Plugins of this deployment, and which are installed here',
    })
    .output(listOf(Plugin)),
  install: base
    .route({
      method: 'POST',
      path: '/plugins/{name}/install',
      summary: 'Install a plugin',
      description: 'Install (or approve the new scopes of) a plugin (owners)',
    })
    .input(z.object({ name: PluginName }))
    .output(Plugin),
  uninstall: base
    .route({
      method: 'POST',
      path: '/plugins/{name}/uninstall',
      summary: 'Uninstall a plugin',
      description: 'Uninstall a plugin: its tokens stop working at once (owners)',
    })
    .input(z.object({ name: PluginName }))
    .output(Plugin),
  session: base
    .route({
      method: 'POST',
      path: '/plugins/{name}/session',
      summary: 'Get a plugin session token',
      description:
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
  ...pluginReadsContract,
  signal: base
    .route({
      method: 'POST',
      path: '/plugins/live',
      summary: 'Tell a plugin’s screens to refresh',
      description:
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

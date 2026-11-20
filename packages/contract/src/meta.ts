import {
  META_APP_SOURCES,
  META_CONNECTION_STATUSES,
  META_GRAPH_METHODS,
  META_KINDS,
} from '@erxes/core-db/integrationEnums';
import { metaConnections } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

export const MetaKind = z.enum(META_KINDS);

export type MetaKind = z.infer<typeof MetaKind>;

export const MetaConnection = createSelectSchema(metaConnections, {
  id: Id,
  connectedAt: isoDate,
  checkedAt: isoDate,
  createdAt: isoDate,
}).pick({
  id: true,
  kind: true,
  externalId: true,
  pageId: true,
  name: true,
  username: true,
  app: true,
  status: true,
  statusReason: true,
  connectedAt: true,
  checkedAt: true,
  createdAt: true,
});

export type MetaConnection = z.infer<typeof MetaConnection>;

export const MetaAppSettings = z.object({
  appId: z.string().nullable(),
  verifyToken: z.string().nullable(),
  own: z.boolean(),
  installApp: z.boolean(),
  webhookUrl: z.string().nullable(),
  callbackUrl: z.string(),
});

export type MetaAppSettings = z.infer<typeof MetaAppSettings>;

const MetaAppInput = z.object({
  appId: z
    .string()
    .trim()
    .regex(/^\d{5,20}$/, 'a Meta app id is digits'),
  appSecret: z.string().trim().min(16).max(100).optional(),
  verifyToken: z.string().trim().min(8).max(200),
});

const ExternalId = z
  .string()
  .trim()
  .regex(/^[\w.:-]{1,100}$/, 'a Meta id');

const IdempotencyKey = z.string().trim().min(1).max(200);

const Text = z.string().trim().min(1).max(2000);

const SendBase = { connectionId: Id, idempotencyKey: IdempotencyKey };

export const MetaSendInput = z.discriminatedUnion('kind', [
  z
    .object({
      ...SendBase,
      kind: z.literal('message'),
      recipientId: ExternalId,
      text: Text.optional(),
      fileIds: z.array(Id).max(10).default([]),
      replyToMessageId: z.string().max(300).optional(),
      humanAgent: z.boolean().default(false),
    })
    .refine((input) => input.text || input.fileIds.length, 'a message needs text or a file'),
  z.object({
    ...SendBase,
    kind: z.literal('comment_reply'),
    commentId: ExternalId,
    text: Text,
    fileId: Id.optional(),
  }),
  z.object({
    ...SendBase,
    kind: z.literal('reaction'),
    recipientId: ExternalId,
    messageId: z.string().min(1).max(300),
    on: z.boolean(),
  }),
  z.object({ ...SendBase, kind: z.literal('comment_like'), commentId: ExternalId }),
]);

export type MetaSendInput = z.infer<typeof MetaSendInput>;

export const MetaSent = z.object({ id: z.string().nullable() });

export const MetaGraphInput = z.object({
  connectionId: Id,
  method: z.enum(META_GRAPH_METHODS).default('GET'),
  path: z.string().trim().min(1).max(300),
  query: z.record(z.string(), z.string().max(2000)).default({}),
  body: z.record(z.string(), z.unknown()).optional(),
});

const MetaImportConnection = z.object({
  kind: MetaKind,
  externalId: ExternalId,
  pageId: ExternalId,
  name: z.string().trim().min(1).max(200),
  username: z.string().trim().max(200).nullish(),
  pageToken: z.string().min(10).max(2000),
  app: z.enum(META_APP_SOURCES),
  status: z.enum(META_CONNECTION_STATUSES).default('healthy'),
  statusReason: z.string().max(1000).nullish(),
  connectedBy: Id.nullish(),
});

const MetaImportPerson = z.object({
  kind: MetaKind,
  externalId: ExternalId,
  customerId: Id,
});

export const MetaImportInput = z.object({
  app: MetaAppInput.required({ appSecret: true }).optional(),
  connections: z.array(MetaImportConnection).max(200).default([]),
  people: z.array(MetaImportPerson).max(1000).default([]),
});

const { META_NOT_SET_UP, META_REFUSED, SEND_IN_PROGRESS, GRAPH_PATH_NOT_ALLOWED } = ERRORS;

const base = oc.errors({
  ...COMMON_ERRORS,
  META_NOT_SET_UP,
  META_REFUSED,
  SEND_IN_PROGRESS,
  GRAPH_PATH_NOT_ALLOWED,
});

const ok = z.object({ ok: z.literal(true) });

export const metaContract = {
  app: base
    .route({
      method: 'GET',
      path: '/meta/app',
      summary:
        "The organisation's own Meta app (never its secret), whether the install has one, and the addresses to give Meta",
    })
    .output(MetaAppSettings),
  saveApp: base
    .route({
      method: 'PUT',
      path: '/meta/app',
      summary:
        "Set the organisation's own Meta app; the secret is kept when left out. Pages connect through it from then on",
    })
    .input(MetaAppInput)
    .output(MetaAppSettings),
  removeApp: base
    .route({
      method: 'DELETE',
      path: '/meta/app',
      summary: "Forget the organisation's own Meta app; new connections go through the install's",
    })
    .output(MetaAppSettings),
  loginUrl: base
    .route({
      method: 'POST',
      path: '/meta/login',
      summary:
        "Meta's login address, where the member picks the pages and Instagram accounts to connect. 409 META_NOT_SET_UP without an app",
    })
    .output(z.object({ url: z.string() })),
  connections: base
    .route({
      method: 'GET',
      path: '/meta/connections',
      summary: 'The connected Facebook pages and Instagram accounts, by kind then name',
    })
    .input(z.object({ kind: MetaKind.optional() }))
    .output(listOf(MetaConnection)),
  repair: base
    .route({
      method: 'POST',
      path: '/meta/connections/{id}/repair',
      summary:
        "Subscribe the app to the page's events again, route it through the relay, and check its token",
    })
    .input(z.object({ id: Id }))
    .output(MetaConnection),
  disconnect: base
    .route({
      method: 'DELETE',
      path: '/meta/connections/{id}',
      summary: 'Disconnect a page or Instagram account; automations that use it fail',
    })
    .input(z.object({ id: Id }))
    .output(ok),
  send: base
    .route({
      method: 'POST',
      path: '/meta/send',
      summary:
        'Send through a connection: a message (one per file after the text), a comment reply, a ❤ on a message, or a like on a comment. Once per idempotencyKey: a repeat answers the first result, 409 SEND_IN_PROGRESS while it is going; 400 META_REFUSED with Meta’s reason',
    })
    .input(MetaSendInput)
    .output(MetaSent),
  graph: base
    .route({
      method: 'POST',
      path: '/meta/graph',
      summary:
        "A Graph API call with a connection's token, on its own node only: me, the page or account id, and the page's posts, with their edges. 403 GRAPH_PATH_NOT_ALLOWED otherwise",
    })
    .input(MetaGraphInput)
    .output(z.object({ status: z.int(), body: z.unknown() })),
  import: base
    .route({
      method: 'POST',
      path: '/meta/import',
      summary:
        "Bring in an app, connections and people's customers from another erxes Meta integration: tokens are sealed here, a connection already here is updated. In the same transaction the calling plugin's saved automations move to core: its <plugin>.facebook|instagram.message_received|comment_received triggers become core's Meta events, its <plugin>.facebook|instagram.reply steps send_message or reply_to_comment by the trigger, input message becomes text and {{event.payload.content}} {{event.payload.text}}; an active one publishes the result as a new version. placeholdersLeft counts conversationId and integrationId placeholders core has no value for, stepsLeft reply steps under another trigger",
    })
    .input(MetaImportInput)
    .output(
      z.object({
        connections: z.int(),
        people: z.int(),
        automations: z.int(),
        placeholdersLeft: z.int(),
        stepsLeft: z.int(),
      }),
    ),
};

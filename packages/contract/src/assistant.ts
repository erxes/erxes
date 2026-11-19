import type { Op } from '@earendil-works/chord/delta';
import type { ConversationView } from '@earendil-works/pi-durable';
import { ASSISTANT_THINKING_KINDS } from '@erxes/core-db/assistantEnums';
import {
  assistantAppearances,
  assistantConnections,
  assistantSettings,
  assistantThreads,
} from '@erxes/core-db/schema';
import { eventIterator, oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf, QueryBoolean } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { AssistantRecordType, ReferenceHandle } from './records';
import { AssistantProvider, AssistantThinkingLevel } from './values';

const AssistantModelId = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9][A-Za-z0-9._:/@-]{0,127}$/, 'a model id such as gpt-6-luna');

export const AssistantConnection = createSelectSchema(assistantConnections, {
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({ provider: true, isDefault: true, createdAt: true, updatedAt: true })
  .extend({ hasKey: z.boolean() });

export type AssistantConnection = z.infer<typeof AssistantConnection>;

export const AssistantModel = z.object({
  id: z.string(),
  family: z.string(),
  recommended: z.boolean(),
  name: z.string().nullable(),
  thinking: z
    .object({
      kind: z.enum(ASSISTANT_THINKING_KINDS),
      levels: z.array(AssistantThinkingLevel),
    })
    .nullable(),
});

export const AssistantProviderModels = z.object({
  provider: AssistantProvider,
  models: z.array(AssistantModel),
  error: z.string().nullable(),
});

export type AssistantProviderModels = z.infer<typeof AssistantProviderModels>;

export const AssistantThread = createSelectSchema(assistantThreads, {
  id: Id,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({ id: true, title: true, pinned: true, createdAt: true, updatedAt: true });

export type AssistantThread = z.infer<typeof AssistantThread>;

export const AssistantMessagePart = z.looseObject({ type: z.string() });

export type AssistantMessagePart = z.infer<typeof AssistantMessagePart>;

export const AssistantSettings = createSelectSchema(assistantSettings).pick({ codeMode: true });

export const AssistantAppearance = createSelectSchema(assistantAppearances).pick({
  body: true,
  color: true,
  expression: true,
});

export type AssistantAppearance = z.infer<typeof AssistantAppearance>;

export const AssistantSendRequest = z.object({
  threadId: Id.optional(),
  message: z.object({ parts: z.array(AssistantMessagePart).min(1).max(200) }),
  provider: AssistantProvider.optional(),
  model: AssistantModelId.optional(),
  thinkingLevel: AssistantThinkingLevel.optional(),
});

export type AssistantSendRequest = z.infer<typeof AssistantSendRequest>;

/** A conversation as the panel follows it: the whole view, then the changes of each commit. */
export type AssistantWatchEvent = { value: ConversationView } | { ops: readonly Op[] };

export const AssistantWatchEvent = z.custom<AssistantWatchEvent>(
  (event) => typeof event === 'object' && event !== null && ('value' in event || 'ops' in event),
);

const ProviderInput = z.object({ provider: AssistantProvider });

export const AssistantRecord = z.discriminatedUnion('available', [
  z.object({
    available: z.literal(true),
    type: AssistantRecordType,
    id: Id,
    label: z.string(),
  }),
  z.object({ available: z.literal(false) }),
]);

export type AssistantRecord = z.infer<typeof AssistantRecord>;

const base = oc.errors(COMMON_ERRORS);

const {
  ASSISTANT_BUSY,
  ASSISTANT_FILE_BUSY,
  ASSISTANT_FILE_TOO_LARGE,
  ASSISTANT_FILE_TYPE_NOT_SUPPORTED,
  ASSISTANT_FILE_UNAVAILABLE,
  ASSISTANT_FILE_UNREADABLE,
  ASSISTANT_INVALID_MESSAGE,
  ASSISTANT_KEY_UNREADABLE,
  ASSISTANT_MENTION_UNAVAILABLE,
  ASSISTANT_NO_CONNECTION,
} = ERRORS;

/** What sending a message answers with besides the common errors. */
const sending = base.errors({
  ASSISTANT_BUSY,
  ASSISTANT_FILE_BUSY,
  ASSISTANT_FILE_TOO_LARGE,
  ASSISTANT_FILE_TYPE_NOT_SUPPORTED,
  ASSISTANT_FILE_UNAVAILABLE,
  ASSISTANT_FILE_UNREADABLE,
  ASSISTANT_INVALID_MESSAGE,
  ASSISTANT_KEY_UNREADABLE,
  ASSISTANT_MENTION_UNAVAILABLE,
  ASSISTANT_NO_CONNECTION,
});

export const assistantContract = {
  connections: base
    .route({
      method: 'GET',
      path: '/assistant/connections',
      summary:
        "The organisation's model provider keys, which every agent uses; keys are never returned",
    })
    .output(listOf(AssistantConnection)),
  saveConnection: base
    .route({
      method: 'PUT',
      path: '/assistant/connections/{provider}',
      summary:
        "Save or replace the organisation's key for a provider; the first saved provider becomes the default",
    })
    .input(ProviderInput.extend({ apiKey: z.string().trim().min(8).max(500) }))
    .output(AssistantConnection),
  removeConnection: base
    .route({
      method: 'DELETE',
      path: '/assistant/connections/{provider}',
      summary: 'Forget the key for a provider. 404 NOT_FOUND when none is saved',
    })
    .input(ProviderInput)
    .output(z.object({ ok: z.literal(true) })),
  setDefaultProvider: base
    .route({
      method: 'PUT',
      path: '/assistant/default-provider',
      summary:
        'The provider a turn uses when it names none; null clears it. 404 NOT_FOUND when no key is saved for it',
    })
    .input(z.object({ provider: AssistantProvider.nullable() }))
    .output(listOf(AssistantConnection)),
  models: base
    .route({
      method: 'GET',
      path: '/assistant/models',
      summary:
        'Chat models each saved provider offers, best first; `error` says why a list is empty without revealing the key',
    })
    .output(
      z.object({ data: z.array(AssistantProviderModels).max(AssistantProvider.options.length) }),
    ),
  verifyModel: base
    .route({
      method: 'POST',
      path: '/assistant/models/verify',
      summary: 'Send one tiny request to check a model works with the saved key',
    })
    .input(ProviderInput.extend({ model: AssistantModelId }))
    .output(
      z.object({
        provider: AssistantProvider,
        model: z.string(),
        ok: z.boolean(),
        error: z.string().nullable(),
      }),
    ),
  threads: base
    .route({
      method: 'GET',
      path: '/assistant/threads',
      summary: "The signed-in member's conversations, most recently active first",
    })
    .input(CursorQuery.extend({ pinned: QueryBoolean.optional() }))
    .output(cursorPageOf(AssistantThread)),
  thread: base
    .route({ method: 'GET', path: '/assistant/threads/{id}', summary: 'A conversation' })
    .input(z.object({ id: Id }))
    .output(AssistantThread),
  send: sending
    .route({
      method: 'POST',
      path: '/assistant/send',
      summary:
        'Send the member a message in a conversation, starting one without a threadId. The reply runs on the server; follow it with watch',
    })
    .input(AssistantSendRequest)
    .output(z.object({ threadId: Id })),
  watch: base
    .route({
      method: 'GET',
      path: '/assistant/threads/{id}/watch',
      summary:
        "The conversation's view, then the changes of each commit, while this server runs it. A server that does not run it sends the view and ends; watch again a moment later",
    })
    .input(z.object({ id: Id }))
    .output(eventIterator(AssistantWatchEvent)),
  updateThread: base
    .route({
      method: 'PATCH',
      path: '/assistant/threads/{id}',
      summary: 'Rename or pin a conversation',
    })
    .input(
      z
        .object({
          id: Id,
          title: z.string().trim().min(1).max(120).optional(),
          pinned: z.boolean().optional(),
        })
        .refine(
          (value) => value.title !== undefined || value.pinned !== undefined,
          'nothing to update',
        ),
    )
    .output(AssistantThread),
  stopThread: base
    .route({
      method: 'POST',
      path: '/assistant/threads/{id}/stop',
      summary: 'Stop the reply being written in a conversation; what it wrote so far stays',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  removeThread: base
    .route({ method: 'DELETE', path: '/assistant/threads/{id}', summary: 'Delete a conversation' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  reference: base
    .route({
      method: 'GET',
      path: '/assistant/references/{handle}',
      summary:
        'The record a reply refers to, read now with your permissions; `available: false` when the handle was not issued to you or you cannot read the record',
    })
    .input(z.object({ handle: ReferenceHandle }))
    .output(AssistantRecord),
  record: base
    .route({
      method: 'GET',
      path: '/assistant/records/{type}/{id}',
      summary:
        'A record to mention or show as page context, read now with your permissions; `available: false` when you cannot read it',
    })
    .input(z.object({ type: AssistantRecordType, id: Id }))
    .output(AssistantRecord),
  settings: base
    .route({
      method: 'GET',
      path: '/assistant/settings',
      summary: "The organisation's assistant settings",
    })
    .output(AssistantSettings),
  updateSettings: base
    .route({
      method: 'PATCH',
      path: '/assistant/settings',
      summary: 'Whether the assistant may run code in a sandbox to compute over API results',
    })
    .input(z.object({ codeMode: z.boolean() }))
    .output(AssistantSettings),
  appearance: base
    .route({
      method: 'GET',
      path: '/assistant/appearance',
      summary: "How the assistant's avatar looks to the signed-in member",
    })
    .output(AssistantAppearance),
  updateAppearance: base
    .route({
      method: 'PUT',
      path: '/assistant/appearance',
      summary: "Set the avatar's body, colour and resting expression for the signed-in member",
    })
    .input(AssistantAppearance)
    .output(AssistantAppearance),
};

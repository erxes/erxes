import { ASSISTANT_MESSAGE_ROLES, ASSISTANT_THINKING_KINDS } from '@erxes/core-db/enums';
import {
  assistantConnections,
  assistantMessages,
  assistantSettings,
  assistantThreads,
} from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { CursorQuery, cursorPageOf, Id, isoDate, listOf, QueryBoolean } from './common';
import { AssistantRecordType, ReferenceHandle } from './records';
import { AssistantApprovalMode, AssistantProvider, AssistantThinkingLevel } from './values';

export const AssistantModelId = z
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
})
  .pick({ id: true, title: true, pinned: true, createdAt: true, updatedAt: true })
  .extend({ running: z.boolean() });

export type AssistantThread = z.infer<typeof AssistantThread>;

export const AssistantMessagePart = z.looseObject({ type: z.string() });

export const AssistantMessage = createSelectSchema(assistantMessages, {
  parts: () => z.array(AssistantMessagePart),
  createdAt: isoDate,
}).pick({ id: true, role: true, parts: true, createdAt: true });

export const AssistantSettings = createSelectSchema(assistantSettings).pick({
  approvalMode: true,
});

export const AssistantChatRequest = z
  .object({
    threadId: Id.optional(),
    message: z.object({
      id: z.string().regex(/^[\w-]{1,64}$/),
      role: z.enum(ASSISTANT_MESSAGE_ROLES),
      parts: z.array(AssistantMessagePart).min(1).max(200),
    }),
    edit: z.boolean().optional(),
    provider: AssistantProvider.optional(),
    model: AssistantModelId.optional(),
    thinkingLevel: AssistantThinkingLevel.optional(),
  })
  .refine(
    (request) =>
      !request.edit || (request.threadId !== undefined && request.message.role === 'user'),
    { message: 'an edit replaces a user message in an existing thread', path: ['edit'] },
  );

export type AssistantChatRequest = z.infer<typeof AssistantChatRequest>;

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

export const assistantContract = {
  connections: oc
    .route({
      method: 'GET',
      path: '/assistant/connections',
      summary: "The signed-in member's model provider keys; keys are never returned",
    })
    .output(listOf(AssistantConnection)),
  saveConnection: oc
    .route({
      method: 'PUT',
      path: '/assistant/connections/{provider}',
      summary:
        'Save or replace the key for a provider; the first saved provider becomes the default',
    })
    .input(ProviderInput.extend({ apiKey: z.string().trim().min(8).max(500) }))
    .output(AssistantConnection),
  removeConnection: oc
    .route({
      method: 'DELETE',
      path: '/assistant/connections/{provider}',
      summary: 'Forget the key for a provider. 404 NOT_FOUND when none is saved',
    })
    .input(ProviderInput)
    .output(z.object({ ok: z.literal(true) })),
  setDefaultProvider: oc
    .route({
      method: 'PUT',
      path: '/assistant/default-provider',
      summary:
        'The provider a turn uses when it names none; null clears it. 404 NOT_FOUND when no key is saved for it',
    })
    .input(z.object({ provider: AssistantProvider.nullable() }))
    .output(listOf(AssistantConnection)),
  models: oc
    .route({
      method: 'GET',
      path: '/assistant/models',
      summary:
        'Chat models each saved provider offers, best first; `error` says why a list is empty without revealing the key',
    })
    .output(
      z.object({ data: z.array(AssistantProviderModels).max(AssistantProvider.options.length) }),
    ),
  verifyModel: oc
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
  threads: oc
    .route({
      method: 'GET',
      path: '/assistant/threads',
      summary: "The signed-in member's conversations, most recently active first",
    })
    .input(CursorQuery.extend({ pinned: QueryBoolean.optional() }))
    .output(cursorPageOf(AssistantThread)),
  thread: oc
    .route({
      method: 'GET',
      path: '/assistant/threads/{id}',
      summary: 'A conversation with its messages',
    })
    .input(z.object({ id: Id }))
    .output(AssistantThread.extend({ messages: z.array(AssistantMessage) })),
  updateThread: oc
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
  removeThread: oc
    .route({ method: 'DELETE', path: '/assistant/threads/{id}', summary: 'Delete a conversation' })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  reference: oc
    .route({
      method: 'GET',
      path: '/assistant/references/{handle}',
      summary:
        'The record a reply refers to, read now with your permissions; `available: false` when the handle was not issued to you or you cannot read the record',
    })
    .input(z.object({ handle: ReferenceHandle }))
    .output(AssistantRecord),
  record: oc
    .route({
      method: 'GET',
      path: '/assistant/records/{type}/{id}',
      summary:
        'A record to mention or show as page context, read now with your permissions; `available: false` when you cannot read it',
    })
    .input(z.object({ type: AssistantRecordType, id: Id }))
    .output(AssistantRecord),
  settings: oc
    .route({
      method: 'GET',
      path: '/assistant/settings',
      summary: "The organisation's assistant settings",
    })
    .output(AssistantSettings),
  updateSettings: oc
    .route({
      method: 'PATCH',
      path: '/assistant/settings',
      summary:
        'When the assistant asks before acting: `writes` before every change, `destructive` before deletes, merges, archives, publishes and sends',
    })
    .input(z.object({ approvalMode: AssistantApprovalMode }))
    .output(AssistantSettings),
};

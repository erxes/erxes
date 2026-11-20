import {
  INTEGRATION_FIELD_TYPES,
  INTEGRATION_PROGRAM_KINDS,
} from '@erxes/core-db/integrationEnums';
import {
  integrationPrograms,
  integrationProgramVersions,
  integrations,
} from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { DataField } from './automationRuns';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import {
  INTEGRATION_FIELD_MAX,
  IntegrationDataKey,
  IntegrationHosts,
  IntegrationKey,
} from './integrationValues';

export const INTEGRATION_PROGRAM_MAX = 50;

export const INTEGRATION_VERSION_WINDOW = 50;

export const INTEGRATION_CODE_MAX = 20_000;

const INCOMING_BODY_MAX = 256 * 1024;

const Label = DataField.shape.label;

const IntegrationField = z.object({
  key: IntegrationDataKey,
  label: Label,
  type: z.enum(INTEGRATION_FIELD_TYPES),
  required: z.boolean().default(false),
  options: z
    .array(z.object({ value: z.string().max(200), label: Label }))
    .max(100)
    .optional(),
  description: z.string().trim().max(300).optional(),
});

export const IntegrationDataField = DataField.omit({ recordType: true });

const IntegrationEvent = z.object({
  key: IntegrationKey,
  label: Label,
  fields: z.array(IntegrationDataField).max(INTEGRATION_FIELD_MAX),
});

const ProgramDefinition = z.object({
  label: Label,
  description: z.string().trim().max(300).nullable(),
  fields: z.array(IntegrationField).max(INTEGRATION_FIELD_MAX),
  outputs: z.array(IntegrationDataField).max(INTEGRATION_FIELD_MAX),
  events: z.array(IntegrationEvent).max(INTEGRATION_FIELD_MAX),
  code: z.string().min(1).max(INTEGRATION_CODE_MAX),
});

export const Integration = createSelectSchema(integrations, {
  id: Id,
  hosts: () => IntegrationHosts,
  sealedNames: () => z.array(z.string()),
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  key: true,
  name: true,
  hosts: true,
  sealedNames: true,
  createdAt: true,
  updatedAt: true,
});

export type Integration = z.infer<typeof Integration>;

export const IntegrationProgram = createSelectSchema(integrationPrograms, {
  id: Id,
  integrationId: Id,
  fields: () => z.array(IntegrationField),
  outputs: () => z.array(IntegrationDataField),
  events: () => z.array(IntegrationEvent),
  version: () => z.int(),
  createdAt: isoDate,
  updatedAt: isoDate,
})
  .pick({
    id: true,
    integrationId: true,
    kind: true,
    key: true,
    label: true,
    description: true,
    fields: true,
    outputs: true,
    events: true,
    code: true,
    version: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({ address: z.string().nullable() });

export type IntegrationProgram = z.infer<typeof IntegrationProgram>;

export const IntegrationDetail = Integration.extend({
  programs: z.array(IntegrationProgram).max(INTEGRATION_PROGRAM_MAX),
});

export type IntegrationDetail = z.infer<typeof IntegrationDetail>;

export const IntegrationProgramVersion = createSelectSchema(integrationProgramVersions, {
  version: () => z.int(),
  definition: () => ProgramDefinition,
  createdAt: isoDate,
}).pick({ version: true, definition: true, createdBy: true, createdAt: true });

export const IntegrationIncomingCall = z.object({
  method: z.string().max(10).default('POST'),
  headers: z.record(z.string(), z.string()).default({}),
  query: z.record(z.string(), z.string()).default({}),
  rawBody: z.string().max(INCOMING_BODY_MAX).default(''),
});

export type IntegrationIncomingCall = z.infer<typeof IntegrationIncomingCall>;

export const IntegrationProgramRun = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    result: z.unknown(),
    logs: z.array(z.string()),
  }),
  z.object({
    ok: z.literal(false),
    code: z.string(),
    message: z.string(),
  }),
]);

export type IntegrationProgramRun = z.infer<typeof IntegrationProgramRun>;

const { LIMIT_EXCEEDED } = ERRORS;

const base = oc.errors({ ...COMMON_ERRORS, LIMIT_EXCEEDED });

const ok = z.object({ ok: z.literal(true) });

export const integrationsContract = {
  list: base
    .route({
      method: 'GET',
      path: '/integrations',
      summary: 'The custom integrations: services connected by hand, by name',
    })
    .input(z.object({}))
    .output(listOf(Integration)),
  get: base
    .route({
      method: 'GET',
      path: '/integrations/{id}',
      summary: `A custom integration with its programs (at most ${INTEGRATION_PROGRAM_MAX})`,
    })
    .input(z.object({ id: Id }))
    .output(IntegrationDetail),
  create: base
    .route({
      method: 'POST',
      path: '/integrations',
      successStatus: 201,
      summary:
        'Add a custom integration: its key, name and the hosts its programs may call. 409 TAKEN when the key is taken',
    })
    .input(z.object({ key: IntegrationKey, name: Label, hosts: IntegrationHosts }))
    .output(Integration),
  update: base
    .route({
      method: 'PATCH',
      path: '/integrations/{id}',
      summary: 'Rename a custom integration or change the hosts its programs may call',
    })
    .input(
      z
        .object({ id: Id, name: Label.optional(), hosts: IntegrationHosts.optional() })
        .refine((value) => Object.keys(value).some((key) => key !== 'id'), 'nothing to update'),
    )
    .output(Integration),
  setSecrets: base
    .route({
      method: 'PUT',
      path: '/integrations/{id}/secrets',
      summary:
        'Set or remove (null) sealed values by name. Programs write {{secret.<name>}}; the API never returns a value',
    })
    .input(
      z.object({
        id: Id,
        secrets: z.record(IntegrationDataKey, z.string().min(1).max(4000).nullable()),
      }),
    )
    .output(Integration),
  remove: base
    .route({
      method: 'DELETE',
      path: '/integrations/{id}',
      summary: 'Delete a custom integration with its programs; automations that use them fail',
    })
    .input(z.object({ id: Id }))
    .output(ok),
  saveProgram: base
    .route({
      method: 'PUT',
      path: '/integrations/{integrationId}/programs',
      summary: `Add or replace a program by kind and key; it is live at once and the version before is kept. 400 LIMIT_EXCEEDED past ${INTEGRATION_PROGRAM_MAX} programs`,
    })
    .input(
      ProgramDefinition.extend({
        integrationId: Id,
        kind: z.enum(INTEGRATION_PROGRAM_KINDS),
        key: IntegrationKey,
        description: ProgramDefinition.shape.description.default(null),
        fields: ProgramDefinition.shape.fields.default([]),
        outputs: ProgramDefinition.shape.outputs.default([]),
        events: ProgramDefinition.shape.events.default([]),
      }),
    )
    .output(IntegrationProgram),
  removeProgram: base
    .route({
      method: 'DELETE',
      path: '/integrations/programs/{id}',
      summary: 'Delete a program with its versions',
    })
    .input(z.object({ id: Id }))
    .output(ok),
  programVersions: base
    .route({
      method: 'GET',
      path: '/integrations/programs/{id}/versions',
      summary: `A program's versions, newest first (the last ${INTEGRATION_VERSION_WINDOW})`,
    })
    .input(z.object({ id: Id }))
    .output(z.object({ data: z.array(IntegrationProgramVersion).max(INTEGRATION_VERSION_WINDOW) })),
  restoreProgram: base
    .route({
      method: 'POST',
      path: '/integrations/programs/{id}/restore',
      summary: 'Make an earlier version live again, as a new version',
    })
    .input(z.object({ id: Id, version: z.int().min(1) }))
    .output(IntegrationProgram),
  testProgram: base
    .route({
      method: 'POST',
      path: '/integrations/programs/{id}/test',
      summary:
        'Run a program once: an action with input, an incoming program with a sample call. It reaches the service; an incoming run publishes nothing',
    })
    .input(
      z.object({
        id: Id,
        input: z.record(z.string(), z.unknown()).default({}),
        incoming: IntegrationIncomingCall.prefault({}),
      }),
    )
    .output(IntegrationProgramRun),
};

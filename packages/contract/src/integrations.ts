import {
  AUTOMATION_FIELD_TYPES,
  INTEGRATION_FIELD_TYPES,
  INTEGRATION_PROGRAM_KINDS,
} from '@erxes/core-db/enums';
import {
  integrationPrograms,
  integrationProgramVersions,
  integrations,
} from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate, listOf } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';
import { IntegrationHost, IntegrationKey } from './integrationValues';

export const INTEGRATION_PROGRAM_MAX = 50;

export const INTEGRATION_VERSION_WINDOW = 50;

export const INTEGRATION_CODE_MAX = 20_000;

const Key = IntegrationKey;

const DataKey = z
  .string()
  .regex(/^[A-Za-z][A-Za-z0-9_]{0,59}$/, 'letters, digits and _, starting with a letter');

const Label = z.string().trim().min(1).max(100);

const Hosts = z.array(IntegrationHost).min(1).max(10);

export const IntegrationField = z.object({
  key: DataKey,
  label: Label,
  type: z.enum(INTEGRATION_FIELD_TYPES),
  required: z.boolean().default(false),
  options: z
    .array(z.object({ value: z.string().max(200), label: Label }))
    .max(100)
    .optional(),
  description: z.string().trim().max(300).optional(),
});

export type IntegrationField = z.infer<typeof IntegrationField>;

export const IntegrationDataField = z.object({
  key: DataKey,
  label: Label,
  type: z.enum(AUTOMATION_FIELD_TYPES),
});

export const IntegrationEvent = z.object({
  key: Key,
  label: Label,
  fields: z.array(IntegrationDataField).max(50),
});

const ProgramDefinition = z.object({
  label: Label,
  description: z.string().trim().max(300).nullable(),
  fields: z.array(IntegrationField).max(50),
  outputs: z.array(IntegrationDataField).max(50),
  events: z.array(IntegrationEvent).max(50),
  code: z.string().min(1).max(INTEGRATION_CODE_MAX),
});

export const Integration = createSelectSchema(integrations, {
  id: Id,
  hosts: () => Hosts,
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

export const IntegrationProgramVersion = createSelectSchema(integrationProgramVersions, {
  version: () => z.int(),
  definition: () => ProgramDefinition,
  createdAt: isoDate,
}).pick({ version: true, definition: true, createdBy: true, createdAt: true });

const Incoming = z.object({
  method: z.string().max(10).default('POST'),
  headers: z.record(z.string(), z.string()).default({}),
  query: z.record(z.string(), z.string()).default({}),
  rawBody: z.string().max(256_000).default(''),
});

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
    .input(z.object({ key: Key, name: Label, hosts: Hosts }))
    .output(Integration),
  update: base
    .route({
      method: 'PATCH',
      path: '/integrations/{id}',
      summary: 'Rename a custom integration or change the hosts its programs may call',
    })
    .input(
      z
        .object({ id: Id, name: Label.optional(), hosts: Hosts.optional() })
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
        secrets: z.record(DataKey, z.string().min(1).max(4000).nullable()),
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
      z.object({
        integrationId: Id,
        kind: z.enum(INTEGRATION_PROGRAM_KINDS),
        key: Key,
        label: Label,
        description: z.string().trim().max(300).nullable().default(null),
        fields: z.array(IntegrationField).max(50).default([]),
        outputs: z.array(IntegrationDataField).max(50).default([]),
        events: z.array(IntegrationEvent).max(50).default([]),
        code: z.string().min(1).max(INTEGRATION_CODE_MAX),
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
        incoming: Incoming.optional(),
      }),
    )
    .output(IntegrationProgramRun),
};

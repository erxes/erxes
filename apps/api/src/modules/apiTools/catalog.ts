import { coreContract, READS_EXTENSION } from '@erxes/core-contract';
import {
  type AnyContractProcedure,
  type AnySchema,
  getEventIteratorSchemaDetails,
  isContractProcedure,
} from '@orpc/contract';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { z } from 'zod';

export interface ApiProcedure {
  name: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  input: Record<string, unknown>;
  changes: boolean;
  denied: boolean;
}

/** Sign-in, of members and customers: kept from every agent with the credential guard below. */
const SIGN_IN_GROUPS = new Set(['auth', 'customerAuth', 'customerAccount', 'oauthConsent']);

/** Where people act themselves when nobody approves an agent's writes (`needsPerson`). */
const PEOPLE_GROUPS = new Set(['assistant', 'saas', 'plugins']);

const PEOPLE_PROCEDURES = new Set([
  'roles.create',
  'roles.update',
  'roles.remove',
  'users.invite',
  'users.inviteMany',
  'users.resendInvitation',
  'users.update',
  'users.setPassword',
  'users.disable',
  'users.enable',
  'automations.activate',
  'broadcasts.test',
  'broadcasts.send',
  'broadcasts.schedule',
  'broadcasts.resume',
  'broadcasts.cancel',
  'broadcastSchedules.start',
  'broadcastSchedules.resume',
  'audit.updateSettings',
  'audit.streams',
  'audit.createStream',
  'audit.updateStream',
  'audit.removeStream',
  'audit.testStream',
  'files.settings',
  'files.updateSettings',
  'files.saveBucket',
  'files.removeBucket',
  'integrations.connect',
  'integrations.update',
  'integrations.remove',
  'payments.saveSettings',
  'webhooks.create',
  'webhooks.update',
  'webhooks.rotateSecret',
]);

/** Sending, access and security settings: a person does them when nobody approves each write. */
export const needsPerson = (name: string) =>
  PEOPLE_GROUPS.has(name.split('.')[0] ?? '') || PEOPLE_PROCEDURES.has(name);

const MarkedRead = z.object({ [READS_EXTENSION]: z.literal(true) });

/** Does a call change data: anything but a GET, unless its OpenAPI operation is marked a read. */
export const changesData = (method: string, operation: unknown) =>
  method.toUpperCase() !== 'GET' && !MarkedRead.safeParse(operation).success;

type RouteSpec = AnyContractProcedure['~orpc']['route']['spec'];

const operationOf = (spec: RouteSpec) => (typeof spec === 'function' ? spec({}) : spec);

const words = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .toLowerCase();

export const isCredentialName = (name: string) => {
  const spaced = words(name);

  return (
    /\b(auth|authentication|authorization|passwords?|tokens?|credentials?|secrets?|oauth|sso|otp)\b/.test(
      spaced,
    ) || /\b(api|private|public|consumer|access|signing|encryption|client) key\b/.test(spaced)
  );
};

const namesIn = (schema: unknown, seen = new Set<unknown>()): string[] => {
  if (typeof schema !== 'object' || schema === null || seen.has(schema)) return [];

  seen.add(schema);

  const own =
    'properties' in schema && typeof schema.properties === 'object' && schema.properties !== null
      ? Object.keys(schema.properties)
      : [];

  return [...own, ...Object.values(schema).flatMap((value) => namesIn(value, seen))];
};

const converter = new ZodToJsonSchemaConverter({ maxLazyDepth: 2 });

const isSchema = (value: unknown): value is AnySchema =>
  typeof value === 'object' && value !== null && '~standard' in value;

/** An `eventIterator` output: for a page that stays open, not a one-shot call. */
const isStream = (procedure: AnyContractProcedure) => {
  const schema: unknown = procedure['~orpc'].outputSchema;

  return isSchema(schema) && getEventIteratorSchemaDetails(schema) !== undefined;
};

/** The JSON schema of what a zod schema takes. */
export const inputSchemaOf = (schema: AnySchema) =>
  converter.convert(schema, { strategy: 'input' })[1];

const jsonSchema = (procedure: AnyContractProcedure, strategy: 'input' | 'output') => {
  const schema: unknown =
    strategy === 'input' ? procedure['~orpc'].inputSchema : procedure['~orpc'].outputSchema;

  return isSchema(schema) ? converter.convert(schema, { strategy })[1] : {};
};

export const carriesCredentials = (schemas: unknown[]) =>
  schemas.flatMap((schema) => namesIn(schema)).some(isCredentialName);

const describe = (name: string, procedure: AnyContractProcedure): ApiProcedure => {
  const { route } = procedure['~orpc'];
  const method = route.method ?? 'POST';
  const input = jsonSchema(procedure, 'input');
  const [group = ''] = name.split('.');

  return {
    name,
    method,
    path: route.path ?? '',
    summary: route.summary ?? '',
    description: route.description ?? '',
    input,
    changes: changesData(method, operationOf(route.spec)),
    denied:
      SIGN_IN_GROUPS.has(group) || carriesCredentials([input, jsonSchema(procedure, 'output')]),
  };
};

let catalog: Map<string, ApiProcedure> | undefined;

export const apiCatalog = () => {
  catalog ??= new Map(
    Object.entries(coreContract).flatMap(([group, procedures]) =>
      Object.entries(procedures).flatMap(([key, procedure]) =>
        isContractProcedure(procedure) && !isStream(procedure)
          ? [[`${group}.${key}`, describe(`${group}.${key}`, procedure)] as const]
          : [],
      ),
    ),
  );

  return catalog;
};

import { coreContract } from '@erxes/core-contract';
import { type AnyContractProcedure, type AnySchema, isContractProcedure } from '@orpc/contract';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import type { ApprovalMode } from '../settings.service';

export interface ApiProcedure {
  name: string;
  method: string;
  path: string;
  summary: string;
  input: Record<string, unknown>;
  denied: boolean;
  risky: boolean;
}

const DENIED_GROUPS = new Set([
  'assistant',
  'auth',
  'customerAuth',
  'customerAccount',
  'saas',
  'plugins',
]);

const DENIED_PROCEDURES = new Set([
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
  'audit.updateSettings',
  'audit.streams',
  'audit.createStream',
  'audit.updateStream',
  'audit.removeStream',
  'audit.testStream',
  'files.settings',
  'files.updateSettings',
  'payments.addGateway',
  'payments.updateGateway',
  'payments.removeGateway',
  'payments.pluginSettings',
  'payments.updatePluginSettings',
  'webhooks.create',
  'webhooks.update',
  'webhooks.rotateSecret',
]);

const RISKY_ACTION =
  /(remove|delete|merge|destroy|archive|purge|send|reply|broadcast|publish|refund|cancel|undo)/i;

const words = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .toLowerCase();

const isCredentialName = (name: string) => {
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

const jsonSchema = (procedure: AnyContractProcedure, strategy: 'input' | 'output') => {
  const schema: unknown =
    strategy === 'input' ? procedure['~orpc'].inputSchema : procedure['~orpc'].outputSchema;

  return isSchema(schema) ? converter.convert(schema, { strategy })[1] : {};
};

const describe = (name: string, procedure: AnyContractProcedure): ApiProcedure => {
  const { route } = procedure['~orpc'];
  const method = route.method ?? 'POST';
  const input = jsonSchema(procedure, 'input');

  const carriesCredentials = [...namesIn(input), ...namesIn(jsonSchema(procedure, 'output'))].some(
    isCredentialName,
  );

  const [group = ''] = name.split('.');

  return {
    name,
    method,
    path: route.path ?? '',
    summary: route.summary ?? '',
    input,
    denied: DENIED_GROUPS.has(group) || DENIED_PROCEDURES.has(name) || carriesCredentials,
    risky: method === 'DELETE' || RISKY_ACTION.test(name.split('.').at(-1) ?? ''),
  };
};

let catalog: Map<string, ApiProcedure> | undefined;

export const apiCatalog = () => {
  catalog ??= new Map(
    Object.entries(coreContract).flatMap(([group, procedures]) =>
      Object.entries(procedures).flatMap(([key, procedure]) =>
        isContractProcedure(procedure)
          ? [[`${group}.${key}`, describe(`${group}.${key}`, procedure)] as const]
          : [],
      ),
    ),
  );

  return catalog;
};

export const needsApproval = (procedure: ApiProcedure, mode: ApprovalMode) =>
  procedure.method !== 'GET' && (mode === 'writes' || procedure.risky);

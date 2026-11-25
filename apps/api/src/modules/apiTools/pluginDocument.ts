import {
  CUSTOMER_TOKEN_SCHEME,
  PEOPLE_ONLY_EXTENSION,
  PERMISSIONS_EXTENSION,
  type PluginApiAudience,
  READS_EXTENSION,
} from '@erxes/core-contract';
import { z } from 'zod';
import { requestOutbound } from '~/lib/outbound';
import { logger } from '~/logger';
import type { InstalledPlugin } from './plugins';
import { type ApiProcedure, carriesCredentials, changesData, isCredentialName } from './catalog';

const DOCUMENT_TIMEOUT_MS = 10_000;

const DOCUMENT_MAX_BYTES = 4_000_000;

const FRESH_MS = 5 * 60_000;

const RETRY_MS = 30_000;

const REF_DEPTH = 3;

const REF_PREFIX = '#/components/schemas/';

const SUMMARY_MAX = 300;

const METHODS = ['get', 'put', 'post', 'delete', 'patch'] as const;

const log = logger.child({ component: 'assistant' });

const JsonSchema = z.record(z.string(), z.unknown());

type JsonSchema = z.infer<typeof JsonSchema>;

const Content = z.record(z.string(), z.object({ schema: JsonSchema.default({}) }));

const Operation = z.object({
  operationId: z.string().min(1).optional(),
  [READS_EXTENSION]: z.literal(true).optional(),
  [PEOPLE_ONLY_EXTENSION]: z.literal(true).optional(),
  [PERMISSIONS_EXTENSION]: z.array(z.string().min(1)).default([]),
  summary: z.string().optional(),
  description: z.string().optional(),
  parameters: z
    .array(
      z.object({
        name: z.string().min(1),
        in: z.string(),
        required: z.boolean().default(false),
        description: z.string().optional(),
        schema: JsonSchema.default({}),
      }),
    )
    .default([]),
  requestBody: z.object({ content: Content.default({}) }).optional(),
  responses: z.record(z.string(), z.object({ content: Content.optional() })).default({}),
  security: z.array(z.record(z.string(), z.array(z.string()))).optional(),
});

type Operation = z.infer<typeof Operation>;

const ApiDocument = z.object({
  servers: z.array(z.object({ url: z.string() })).default([]),
  paths: z.record(z.string(), z.record(z.string(), z.unknown())).default({}),
  components: z
    .object({ schemas: z.record(z.string(), JsonSchema).default({}) })
    .default({ schemas: {} }),
});

const ObjectSchema = z.looseObject({
  type: z.literal('object'),
  properties: z.record(z.string(), z.unknown()).default({}),
  required: z.array(z.string()).default([]),
});

/** Whose routes: the plugin's members', or a portal's and a signed-in customer's. */
export type PluginAudience = Exclude<PluginApiAudience, 'employee'>;

export interface PluginProcedure extends ApiProcedure {
  plugin: string;
  audience: PluginAudience;
  /** The permissions the route checks, any one of which lets a member call it; none: the plugin decides. */
  permissions: string[];
  /** It needs a signed-in customer's token: every customer route, and a portal route that says so. */
  signedIn: boolean;
  url: string;
  pathNames: string[];
  queryNames: string[];
  sendsBody: boolean;
}

type Schemas = Record<string, JsonSchema>;

const inlined = (schema: JsonSchema, schemas: Schemas, depth: number): JsonSchema => {
  const ref = schema['$ref'];

  if (typeof ref === 'string') {
    const target = schemas[ref.replace(REF_PREFIX, '')];

    return target && depth > 0 ? inlined(target, schemas, depth - 1) : {};
  }

  const within = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map((item: unknown) => within(item));

    const nested = JsonSchema.safeParse(value);

    return nested.success ? inlined(nested.data, schemas, depth) : value;
  };

  return Object.fromEntries(Object.entries(schema).map(([key, item]) => [key, within(item)]));
};

const schemaOf = (schema: JsonSchema | undefined, schemas: Schemas) =>
  inlined(schema ?? {}, schemas, REF_DEPTH);

const jsonOf = (content: z.infer<typeof Content> | undefined) => content?.['application/json'];

const answerOf = ({ responses }: Operation) => {
  const status = Object.keys(responses)
    .toSorted()
    .find((code) => code.startsWith('2'));

  return status ? jsonOf(responses[status]?.content)?.schema : undefined;
};

const inputOf = (operation: Operation, schemas: Schemas): JsonSchema => {
  const named = operation.parameters.filter(
    ({ in: place }) => place === 'path' || place === 'query',
  );

  const parameters = {
    type: 'object',
    properties: Object.fromEntries(
      named.map(({ name, description, schema }) => [
        name,
        { ...schemaOf(schema, schemas), ...(description ? { description } : {}) },
      ]),
    ),
    required: named.filter(({ required }) => required).map(({ name }) => name),
  };

  const sent = jsonOf(operation.requestBody?.content);

  if (!sent) return parameters;

  const body = schemaOf(sent.schema, schemas);

  if (named.length === 0) return body;

  const object = ObjectSchema.safeParse(body);

  return object.success
    ? {
        ...object.data,
        properties: { ...object.data.properties, ...parameters.properties },
        required: [...new Set([...object.data.required, ...parameters.required])],
      }
    : { allOf: [parameters, body] };
};

const pathNamesOf = (path: string) =>
  [...path.matchAll(/\{([^}]+)\}/g)].flatMap(([, name]) => (name ? [name] : []));

interface Route {
  plugin: string;
  audience: PluginAudience;
  url: string;
  method: (typeof METHODS)[number];
  path: string;
  schemas: Schemas;
}

const procedureOf = (
  { plugin, audience, url, method, path, schemas }: Route,
  operation: Operation,
): PluginProcedure => {
  const verb = method.toUpperCase();
  const id = operation.operationId ?? `${verb} ${path}`;
  const input = inputOf(operation, schemas);

  return {
    name: audience === 'member' ? `${plugin}:${id}` : `${plugin}:${audience}:${id}`,
    method: verb,
    path,
    summary: (operation.summary ?? '').slice(0, SUMMARY_MAX),
    description: (operation.description ?? '').slice(0, SUMMARY_MAX),
    input,
    changes: changesData(method, operation),
    denied:
      operation[PEOPLE_ONLY_EXTENSION] === true ||
      carriesCredentials([input, schemaOf(answerOf(operation), schemas)]) ||
      [...id.split('.'), ...path.split('/')].some(isCredentialName),
    plugin,
    audience,
    permissions: operation[PERMISSIONS_EXTENSION],
    signedIn:
      audience === 'customer' ||
      (audience === 'portal' &&
        Boolean(operation.security?.length) &&
        (operation.security ?? []).every((needs) => CUSTOMER_TOKEN_SCHEME in needs)),
    url,
    pathNames: pathNamesOf(path),
    queryNames: operation.parameters.filter((item) => item.in === 'query').map(({ name }) => name),
    sendsBody: jsonOf(operation.requestBody?.content) !== undefined,
  };
};

const trimmed = (url: string) => url.replace(/\/+$/, '');

const serverOf = (apiUrl: string, declared: string | undefined) => {
  if (!declared) return trimmed(apiUrl);

  const server = new URL(declared, `${trimmed(apiUrl)}/`);

  return server.origin === new URL(apiUrl).origin ? trimmed(server.href) : undefined;
};

interface Source {
  plugin: string;
  audience: PluginAudience;
  apiUrl: string;
  address: string;
}

const read = async ({ plugin, audience, apiUrl, address }: Source): Promise<PluginProcedure[]> => {
  const answer = await requestOutbound(address, {
    method: 'GET',
    body: '',
    headers: { accept: 'application/json' },
    timeoutMs: DOCUMENT_TIMEOUT_MS,
    maxBytes: DOCUMENT_MAX_BYTES,
    overflow: 'fail',
  });

  if (answer.status !== 200) throw new Error(`the document answered ${answer.status}`);

  const json: unknown = JSON.parse(answer.body.toString());
  const document = ApiDocument.parse(json);
  const url = serverOf(apiUrl, document.servers[0]?.url);

  if (!url) throw new Error("the document's server is not the plugin's API address");

  return Object.entries(document.paths).flatMap(([path, item]) =>
    METHODS.flatMap((method) => {
      const operation = Operation.safeParse(item[method]);

      return operation.success
        ? [
            procedureOf(
              { plugin, audience, url, method, path, schemas: document.components.schemas },
              operation.data,
            ),
          ]
        : [];
    }),
  );
};

const documents = new Map<string, { until: number; procedures: Promise<PluginProcedure[]> }>();

const proceduresOf = (
  { name: plugin, apiUrl, docs }: InstalledPlugin,
  audience: PluginAudience,
) => {
  const doc = docs[audience];

  if (!apiUrl || !doc) return Promise.resolve([]);

  const address = `${trimmed(apiUrl)}${doc}`;
  const known = documents.get(address);

  if (known && known.until > Date.now()) return known.procedures;

  const procedures = read({ plugin, audience, apiUrl, address }).catch((error: unknown) => {
    log.warn({ err: error, plugin, address }, 'a plugin API document could not be read');
    documents.set(address, { until: Date.now() + RETRY_MS, procedures: Promise.resolve([]) });

    return [];
  });

  documents.set(address, { until: Date.now() + FRESH_MS, procedures });

  return procedures;
};

/** The routes of each plugin's API document for `audience`, read at most every 5 minutes. */
export const pluginProcedures = async (
  plugins: InstalledPlugin[],
  audience: PluginAudience = 'member',
) => (await Promise.all(plugins.map((plugin) => proceduresOf(plugin, audience)))).flat();

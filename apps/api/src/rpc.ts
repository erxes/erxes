import * as contract from '@erxes/core-contract';
import { coreContract, CORE_API_PREFIX } from '@erxes/core-contract';
import { type OpenAPI, OpenAPIGenerator } from '@orpc/openapi';
import { CONTEXT_LOGGER_SYMBOL, LoggingHandlerPlugin } from '@orpc/experimental-pino';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { onError, ORPCError, ValidationError } from '@orpc/server';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import type { RequestHandler } from 'express';
import { z } from 'zod';
import { coreRouter } from '~/router';
import { invalidInput } from '~/http/errors';
import { sha256 } from '~/lib/crypto';
import { logger } from '~/logger';

const handler = new OpenAPIHandler(coreRouter, {
  plugins: [
    // Procedures log through a child of `req.log` (see CoreContext), with the
    // request's id as `rpc.id`. The plugin logs what procedures throw; 4xx at
    // info (the hook in src/logger.ts).
    new LoggingHandlerPlugin({
      logger,
      generateId: ({ context }) => (typeof context.req.id === 'string' ? context.req.id : ''),
    }),
  ],
  clientInterceptors: [
    onError((error) => {
      // Input that fails the contract: one stable code, with zod's issues.
      if (error instanceof ORPCError && error.cause instanceof ValidationError) {
        throw invalidInput(error.cause);
      }
    }),
  ],
});

/** Serves `/core/v1/*` from the contract (oRPC's OpenAPI handler, plain REST + JSON). */
export const coreApi: RequestHandler = async (req, res, next) => {
  const { matched } = await handler.handle(req, res, {
    prefix: CORE_API_PREFIX,
    context: { req, res, [CONTEXT_LOGGER_SYMBOL]: req.log },
  });

  if (!matched) next();
};

/**
 * The contract's named object schemas (`Customer`, `Invoice`, …) become
 * `components.schemas` and are referenced by `$ref`, not repeated inline. The
 * recursive ones (`ConditionGroup`, `AutomationStep`) refer to themselves. A
 * schema whose request shape differs from its response (defaults, `isoDate`)
 * gets a second component, `<Name>.input`, for request bodies.
 */
const namedSchemas = Object.fromEntries(
  Object.entries<unknown>(contract).flatMap(([name, value]) =>
    /^[A-Z]/.test(name) &&
    value instanceof z.ZodType &&
    (value.def.type === 'object' || value.def.type === 'lazy')
      ? (['output', 'input'] as const).map((strategy) => [
          strategy === 'output' ? name : `${name}.input`,
          { schema: value, strategy },
        ])
      : [],
  ),
);

// Each error body once (`NOT_FOUNDError`, …); responses list the codes they can answer with by $ref.
const errorSchemas = Object.fromEntries(
  Object.entries(contract.ERRORS).map(([code, error]) => [
    `${code}Error`,
    {
      schema: z.object({
        defined: z.literal(true),
        code: z.literal(code),
        status: z.literal(error.status),
        message: z.string(),
        ...('data' in error ? { data: error.data } : {}),
      }),
      strategy: 'output' as const,
    },
  ]),
);

const commonSchemas = { ...namedSchemas, ...errorSchemas };

const methods = ['get', 'put', 'post', 'delete', 'patch'] as const;

/**
 * Modules share their error codes, so routes repeat the same error responses
 * (61 distinct among 1,533). Each goes once into `components.responses`, named
 * by its status and a hash of its body.
 */
const shareErrorResponses = (doc: OpenAPI.Document) => {
  const shared: Record<string, OpenAPI.ResponseObject> = {};

  for (const path of Object.values(doc.paths ?? {})) {
    for (const method of methods) {
      const responses = path?.[method]?.responses ?? {};

      for (const [status, response] of Object.entries(responses)) {
        if (Number(status) < 400 || '$ref' in response) continue;

        const name = `Error${status}_${sha256(JSON.stringify(response)).slice(0, 8)}`;

        shared[name] = response;
        responses[status] = { $ref: `#/components/responses/${name}` };
      }
    }
  }

  doc.components = { ...doc.components, responses: shared };
};

/** Drops the components no route reaches through `$ref`, such as an unused `<Name>.input`. */
const dropUnreferenced = (doc: OpenAPI.Document) => {
  const schemas = doc.components?.schemas ?? {};
  const reached = new Set<string>();

  const visit = (value: unknown) =>
    JSON.stringify(value, (key, ref: unknown) => {
      const name = key === '$ref' && typeof ref === 'string' ? ref.split('/').pop() : undefined;

      if (name !== undefined && !reached.has(name)) {
        reached.add(name);
        visit(schemas[name] ?? doc.components?.responses?.[name]);
      }

      return ref;
    });

  visit(doc.paths);
  doc.components = {
    ...doc.components,
    schemas: Object.fromEntries(Object.entries(schemas).filter(([name]) => reached.has(name))),
  };
};

const converter = new ZodToJsonSchemaConverter();

export const generateOpenApi = async () => {
  const doc = await new OpenAPIGenerator({ schemaConverters: [converter] }).generate(coreContract, {
    info: { title: 'erxes core', version: 'v1' },
    servers: [{ url: CORE_API_PREFIX }],
    commonSchemas,
    customErrorResponseBodySchema: (definedErrors) => ({
      oneOf: definedErrors.map(([code]) => ({ $ref: `#/components/schemas/${code}Error` })),
    }),
  });

  shareErrorResponses(doc);
  dropUnreferenced(doc);

  return doc;
};

let spec: ReturnType<typeof generateOpenApi> | undefined;

/** The OpenAPI document for plugins and tools (`GET /core/v1/openapi.json`). */
export const openApiDocument: RequestHandler = async (_req, res) => {
  spec ??= generateOpenApi();
  res.json(await spec);
};

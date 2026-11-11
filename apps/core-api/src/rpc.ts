import { coreContract, CORE_API_PREFIX } from '@erxes/core-contract';
import { OpenAPIGenerator } from '@orpc/openapi';
import { CONTEXT_LOGGER_SYMBOL, LoggingHandlerPlugin } from '@orpc/experimental-pino';
import { OpenAPIHandler } from '@orpc/openapi/node';
import { onError, ORPCError, ValidationError } from '@orpc/server';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import type { RequestHandler } from 'express';
import { logger } from '~/logger';
import { coreRouter } from '~/router';

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
      if (
        error instanceof ORPCError &&
        error.code === 'BAD_REQUEST' &&
        error.cause instanceof ValidationError
      ) {
        throw new ORPCError('INVALID_INPUT', {
          status: 400,
          message: 'The request is not valid',
          data: { issues: error.cause.issues },
          cause: error.cause,
        });
      }
    }),
  ],
});

/** Serves `/core/v1/*` from the contract (oRPC's OpenAPI handler, plain REST + JSON). */
export const coreApi: RequestHandler = (req, res, next) => {
  handler
    .handle(req, res, {
      prefix: CORE_API_PREFIX,
      context: { req, res, [CONTEXT_LOGGER_SYMBOL]: req.log },
    })
    .then(({ matched }) => {
      if (!matched) next();
    })
    .catch(next);
};

/**
 * The OpenAPI document of the contract. Served at `GET /core/v1/openapi.json`
 * and committed as packages/contract/openapi.json (`pnpm openapi`).
 */
export const generateOpenApi = () =>
  new OpenAPIGenerator({ schemaConverters: [new ZodToJsonSchemaConverter()] }).generate(
    coreContract,
    {
      info: { title: 'erxes core', version: 'v1' },
      servers: [{ url: CORE_API_PREFIX }],
    },
  );

let spec: ReturnType<typeof generateOpenApi> | undefined;

export const openApiDocument: RequestHandler = (_req, res, next) => {
  spec ??= generateOpenApi();

  spec.then((document) => res.json(document)).catch(next);
};

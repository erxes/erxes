import express, { NextFunction, Request, Response, Router } from 'express';
import {
  execute,
  GraphQLError,
  parse,
  specifiedRules,
  validate,
} from 'graphql';
import {
  DATA_EXTENSIONS_PROOF_HEADERS,
  gatewayProofPayload,
  verifyDataExtensionsProof,
} from 'erxes-api-shared/core-modules';
import { extractUserFromHeader, userHeaderName } from 'erxes-api-shared/utils';
import { createRequestContext } from '~/modules/data-extensions/runtime/context';
import {
  LIMITS,
  maxAliasesRule,
  maxDepthRule,
} from '~/modules/data-extensions/runtime/limits';
import { metricsSnapshot } from '~/modules/data-extensions/runtime/metrics';
import {
  getTenantSchema,
  schemaCache,
} from '~/modules/data-extensions/runtime/tenantSchema';

const requestStats = { total: 0, errors: 0, totalMs: 0 };

const sendErrors = (res: Response, status: number, errors: GraphQLError[]) => {
  requestStats.errors++;
  res.status(status).json({ errors: errors.map((error) => error.toJSON()) });
};

const singleHeader = (req: Request, name: string) => {
  const value = req.headers[name];

  return typeof value === 'string' ? value : undefined;
};

/**
 * Accepts identity only when the gateway's Data Extensions route signed it.
 * The gateway's generic proxy forwards client headers unchanged, so an
 * unsigned `user` header is never trusted here.
 */
const readVerifiedCaller = (req: Request) => {
  const userHeader = singleHeader(req, userHeaderName);
  const subdomain = singleHeader(req, DATA_EXTENSIONS_PROOF_HEADERS.subdomain);
  const proof = {
    issuedAt: Number(singleHeader(req, DATA_EXTENSIONS_PROOF_HEADERS.issuedAt)),
    signature: singleHeader(req, DATA_EXTENSIONS_PROOF_HEADERS.signature),
  };

  if (
    !userHeader ||
    !subdomain ||
    !verifyDataExtensionsProof(
      'gateway',
      gatewayProofPayload(subdomain, userHeader),
      proof,
    )
  ) {
    return null;
  }

  try {
    const user = extractUserFromHeader(req.headers);

    return user?._id ? { user, subdomain } : null;
  } catch {
    return null;
  }
};

const handleGraphql = async (req: Request, res: Response) => {
  const startedAt = Date.now();
  requestStats.total++;

  try {
    const caller = readVerifiedCaller(req);

    if (!caller) {
      return sendErrors(res, 401, [
        new GraphQLError('Login required', {
          extensions: { code: 'UNAUTHENTICATED' },
        }),
      ]);
    }

    const { query, variables, operationName } = req.body || {};

    if (typeof query !== 'string' || !query.trim()) {
      return sendErrors(res, 400, [new GraphQLError('Query is required')]);
    }

    if (query.length > LIMITS.queryLength) {
      return sendErrors(res, 400, [
        new GraphQLError(`Query exceeds ${LIMITS.queryLength} characters`),
      ]);
    }

    let document;

    try {
      document = parse(query);
    } catch (error) {
      return sendErrors(res, 400, [error as GraphQLError]);
    }

    const { user, subdomain } = caller;
    const schema = await getTenantSchema(subdomain);
    const validationErrors = validate(schema, document, [
      ...specifiedRules,
      maxDepthRule,
      maxAliasesRule,
    ]);

    if (validationErrors.length) {
      return sendErrors(res, 400, [...validationErrors]);
    }

    const result = await execute({
      schema,
      document,
      variableValues:
        variables && typeof variables === 'object' ? variables : undefined,
      operationName:
        typeof operationName === 'string' ? operationName : undefined,
      contextValue: createRequestContext(subdomain, user),
    });

    if (result.errors?.length) {
      requestStats.errors++;
    }

    return res.json(result);
  } catch (error) {
    const overloaded =
      error instanceof Error &&
      'code' in error &&
      error.code === 'SERVICE_UNAVAILABLE';

    if (!overloaded) {
      console.error('data-extensions request failed', error);
    }

    return sendErrors(res, overloaded ? 503 : 500, [
      new GraphQLError(
        overloaded && error instanceof Error
          ? error.message
          : 'Data Extensions request failed',
      ),
    ]);
  } finally {
    requestStats.totalMs += Date.now() - startedAt;
  }
};

/**
 * Body-parser failures (too large, malformed JSON) answer as GraphQL errors
 * instead of Express's HTML page.
 */
const handleBodyError = (
  error: Error & { status?: number; type?: string },
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!error) {
    return next();
  }

  const tooLarge = error.type === 'entity.too.large';

  return sendErrors(res, tooLarge ? 413 : 400, [
    new GraphQLError(
      tooLarge
        ? `Request body is larger than ${LIMITS.bodyBytes}`
        : 'Request body must be valid JSON',
      { extensions: { code: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'BAD_REQUEST' } },
    ),
  ]);
};

/**
 * Process-local counters for monitoring inside the cluster. The gateway does
 * not forward `/data-extensions/*` other than the GraphQL route, so this is
 * not reachable from outside.
 */
const handleMetrics = (_req: Request, res: Response) => {
  const memory = process.memoryUsage();

  res.json({
    uptimeSeconds: Math.round(process.uptime()),
    memory: {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
    },
    schemaCache: schemaCache.stats(),
    ...metricsSnapshot(),
    requests: {
      total: requestStats.total,
      errors: requestStats.errors,
      averageMs: requestStats.total
        ? Math.round(requestStats.totalMs / requestStats.total)
        : 0,
    },
  });
};

const sweepTimer = setInterval(() => schemaCache.sweep(), 60 * 1000);
sweepTimer.unref();

/**
 * The tenant-generated Data Extensions API, served by core. Mount it before
 * core's own body parsers so its smaller body limit applies.
 */
export const dataExtensionsRouter: Router = express.Router();

dataExtensionsRouter.post(
  '/data-extensions/graphql',
  express.json({ limit: LIMITS.bodyBytes }),
  handleBodyError,
  handleGraphql,
);

dataExtensionsRouter.get('/data-extensions/metrics', handleMetrics);

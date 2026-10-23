import express, { NextFunction, Request, Response } from 'express';
import {
  execute,
  GraphQLError,
  parse,
  specifiedRules,
  validate,
} from 'graphql';
import * as http from 'http';
import {
  DATA_EXTENSIONS_PROOF_HEADERS,
  gatewayProofPayload,
  verifyDataExtensionsProof,
} from 'erxes-api-shared/core-modules';
import {
  applyTrustProxy,
  closeMongooose,
  createHealthRoute,
  extractUserFromHeader,
  isDev,
  keyForConfig,
  redis,
  userHeaderName,
} from 'erxes-api-shared/utils';
import { createRequestContext } from '~/context';
import { LIMITS, maxAliasesRule, maxDepthRule } from '~/limits';
import { metricsSnapshot } from '~/metrics';
import { getTenantSchema, schemaCache } from '~/tenantSchema';

const { LOAD_BALANCER_ADDRESS, MONGO_URL } = process.env;

const port = process.env.PORT ? Number(process.env.PORT) : 3330;
const serviceName = 'data-extensions';

const requestStats = { total: 0, errors: 0, totalMs: 0 };

const app = express();
applyTrustProxy(app);
app.use(express.json({ limit: LIMITS.bodyBytes }));

// Body-parser failures (too large, malformed JSON) answer as GraphQL errors
// instead of Express's HTML page.
app.use(
  (
    error: Error & { status?: number; type?: string },
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!error) {
      return next();
    }

    const tooLarge = error.type === 'entity.too.large';

    requestStats.errors++;

    return res.status(tooLarge ? 413 : 400).json({
      errors: [
        {
          message: tooLarge
            ? `Request body is larger than ${LIMITS.bodyBytes}`
            : 'Request body must be valid JSON',
          extensions: { code: tooLarge ? 'PAYLOAD_TOO_LARGE' : 'BAD_REQUEST' },
        },
      ],
    });
  },
);

app.get('/health', createHealthRoute(serviceName));

app.get('/metrics', (_req, res) => {
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
});

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
 * The generic plugin proxy forwards client headers unchanged, so an unsigned
 * `user` header is never trusted here.
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

app.post('/graphql', async (req: Request, res: Response) => {
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
});

const sweepTimer = setInterval(() => schemaCache.sweep(), 60 * 1000);
sweepTimer.unref();

const httpServer = http.createServer(app);

httpServer.listen(port, async () => {
  await redis.set(
    keyForConfig(serviceName),
    JSON.stringify({ dbConnectionString: MONGO_URL }),
  );

  const address =
    LOAD_BALANCER_ADDRESS ||
    `http://${isDev ? 'localhost' : 'data-extensions-api'}:${port}`;

  await redis.set(`erxes-service-${serviceName}`, address);

  console.log(`erxes-service-${serviceName} joined with ${address}`);
});

(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach((signal) => {
  process.on(signal, async () => {
    clearInterval(sweepTimer);
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    await closeMongooose();
    process.exit(0);
  });
});

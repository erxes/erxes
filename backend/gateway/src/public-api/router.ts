import { Express, Response, json } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import fetch from 'node-fetch';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { getSubdomain } from 'erxes-api-shared/utils';
import { apolloRouterPort } from '~/apollo-router';
import type { GatewayRequest } from '~/middlewares/userMiddleware';
import { getPublicApiOperation } from './registry';

type PublicApiRequestBody = {
  operationId?: unknown;
  variables?: unknown;
  query?: unknown;
};

type InternalGraphQLError = {
  message?: unknown;
  extensions?: { code?: unknown };
};

type InternalGraphQLResponse = {
  data?: unknown;
  errors?: InternalGraphQLError[];
};

const publicApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: GatewayRequest) => {
    const clientKey = req.user?.oauthClientId || ipKeyGenerator(req.ip || '');
    return `${req.hostname}:${clientKey}`;
  },
});

const sendPublicGraphQLRequest = async (
  req: GatewayRequest,
  res: Response,
) => {
  const authorization = req.headers.authorization;

  if (
    typeof authorization !== 'string' ||
    !authorization.match(/^Bearer\s+\S+$/i) ||
    !req.user?._id ||
    !req.user.oauthClientId
  ) {
    return res.status(401).json({ error: 'OAuth bearer token required' });
  }

  const body = (req.body || {}) as PublicApiRequestBody;

  if (body.query !== undefined) {
    return res.status(400).json({ error: 'Raw GraphQL queries are not allowed' });
  }

  if (typeof body.operationId !== 'string' || !body.operationId.trim()) {
    return res.status(400).json({ error: 'operationId is required' });
  }

  const operation = getPublicApiOperation(body.operationId);

  if (!operation) {
    return res.status(404).json({ error: 'Public API operation not found' });
  }

  if (
    !req.user.oauthAllowedPublicOperationIds?.includes(operation.id)
  ) {
    return res.status(403).json({ error: 'Operation is not enabled for this client' });
  }

  if (
    body.variables !== undefined &&
    (typeof body.variables !== 'object' ||
      body.variables === null ||
      Array.isArray(body.variables))
  ) {
    return res.status(400).json({ error: 'variables must be an object' });
  }

  const variables = (body.variables || {}) as Record<string, unknown>;
  const requestedLimit = variables.limit;

  if (
    requestedLimit !== undefined &&
    (typeof requestedLimit !== 'number' ||
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > 100)
  ) {
    return res.status(400).json({ error: 'limit must be between 1 and 100' });
  }

  const subdomain = getSubdomain(req);
  const checkPermission = checkPermissionGroup(
    subdomain,
    req.user as unknown as IUserDocument,
  );

  for (const action of operation.requiredActions) {
    await checkPermission(action);
  }

  const userHeader = req.headers.user;

  if (typeof userHeader !== 'string') {
    return res.status(401).json({ error: 'Authenticated user context required' });
  }

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    hostname: req.hostname,
    user: userHeader,
    userid: req.user._id,
  };
  const processId = req.headers['x-erxes-process-id'];

  if (typeof processId === 'string') {
    headers['x-erxes-process-id'] = processId;
  }

  const internalResponse = await fetch(
    `http://127.0.0.1:${apolloRouterPort}/`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: operation.document,
        operationName: operation.operationName,
        variables,
      }),
    },
  );
  const responseBody = (await internalResponse.json()) as InternalGraphQLResponse;

  if (
    responseBody === null ||
    typeof responseBody !== 'object' ||
    (!('data' in responseBody) && !Array.isArray(responseBody.errors))
  ) {
    return res.status(502).json({ error: 'Invalid response from internal API' });
  }

  return res.status(internalResponse.status).json({
    ...(responseBody.data !== undefined ? { data: responseBody.data } : {}),
    ...(Array.isArray(responseBody.errors)
      ? {
          errors: responseBody.errors.map((error) => ({
            message:
              typeof error.message === 'string'
                ? error.message
                : 'Operation failed',
            extensions: {
              code:
                typeof error.extensions?.code === 'string'
                  ? error.extensions.code
                  : 'INTERNAL_SERVER_ERROR',
            },
          })),
        }
      : {}),
  });
};

export const applyPublicApi = (app: Express) => {
  app.post(
    '/public/graphql',
    json({ limit: '100kb' }),
    publicApiRateLimiter,
    async (req: GatewayRequest, res) => {
      try {
        return await sendPublicGraphQLRequest(req, res);
      } catch (error) {
        const statusCode =
          error instanceof Error &&
          (error.message === 'Login required' ||
            error.message === 'Permission required' ||
            error.message === 'OAuth scope required')
            ? 403
            : 500;

        return res.status(statusCode).json({
          error: statusCode === 403 ? error.message : 'Public API request failed',
        });
      }
    },
  );
};

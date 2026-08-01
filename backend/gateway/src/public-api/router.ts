import { Express, Response, json } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import fetch from 'node-fetch';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import type {
  IPublicApiOperation,
  IUserDocument,
} from 'erxes-api-shared/core-types';
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

type PublicApiHttpError = {
  statusCode: number;
  message: string;
};

type PublicApiOperationResult =
  | { operation: IPublicApiOperation; error?: never }
  | { operation?: never; error: PublicApiHttpError };

const AUTHORIZATION_PATTERN = /^Bearer\s+\S+$/i;
const INTERNAL_GRAPHQL_REQUEST_TIMEOUT_MS = 30_000;
const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';
const EXPOSED_GRAPHQL_ERROR_CODES = new Set([
  'BAD_USER_INPUT',
  'CONFLICT',
  'FORBIDDEN',
  'NOT_FOUND',
  'UNAUTHENTICATED',
]);

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

/** Check that the request carries an authenticated OAuth bearer principal. */
const isOAuthBearerRequest = (req: GatewayRequest) => {
  const authorization = req.headers.authorization;

  return (
    typeof authorization === 'string' &&
    AUTHORIZATION_PATTERN.test(authorization) &&
    Boolean(req.user?._id) &&
    Boolean(req.user?.oauthClientId)
  );
};

/** Resolve the requested operation while enforcing the client allowlist. */
const resolvePublicApiOperation = (
  body: PublicApiRequestBody,
  req: GatewayRequest,
): PublicApiOperationResult => {
  if (body.query !== undefined) {
    return {
      error: {
        statusCode: 400,
        message: 'Raw GraphQL queries are not allowed',
      },
    };
  }

  if (typeof body.operationId !== 'string' || !body.operationId.trim()) {
    return {
      error: { statusCode: 400, message: 'operationId is required' },
    };
  }

  const operation = getPublicApiOperation(body.operationId);

  if (!operation) {
    return {
      error: { statusCode: 404, message: 'Public API operation not found' },
    };
  }

  if (!req.user?.oauthAllowedPublicOperationIds?.includes(operation.id)) {
    return {
      error: {
        statusCode: 403,
        message: 'Operation is not enabled for this client',
      },
    };
  }

  return { operation };
};

/** Validate the public variables envelope and bounded list limit. */
const getVariablesValidationError = (
  variables: unknown,
): PublicApiHttpError | undefined => {
  if (
    variables !== undefined &&
    (typeof variables !== 'object' ||
      variables === null ||
      Array.isArray(variables))
  ) {
    return { statusCode: 400, message: 'variables must be an object' };
  }

  const requestedLimit = (variables as Record<string, unknown> | undefined)
    ?.limit;

  if (requestedLimit === undefined) {
    return;
  }

  if (
    typeof requestedLimit !== 'number' ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1 ||
    requestedLimit > 100
  ) {
    return { statusCode: 400, message: 'limit must be between 1 and 100' };
  }
};

/** Send a normalized validation or authorization response. */
const sendPublicApiError = (res: Response, error: PublicApiHttpError) =>
  res.status(error.statusCode).json({ error: error.message });

/** Build trusted headers for the gateway's internal GraphQL request. */
const getInternalHeaders = (
  req: GatewayRequest,
  userHeader: string,
): Record<string, string> => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    hostname: req.hostname,
    user: userHeader,
    userid: req.user?._id ?? '',
  };
  const processId = req.headers['x-erxes-process-id'];

  if (typeof processId === 'string') {
    headers['x-erxes-process-id'] = processId;
  }

  return headers;
};

/** Verify the minimum response envelope expected from Apollo Router. */
const isInternalGraphQLResponse = (
  responseBody: unknown,
): responseBody is InternalGraphQLResponse => {
  if (responseBody === null || typeof responseBody !== 'object') {
    return false;
  }

  const response = responseBody as InternalGraphQLResponse;
  return response.data !== undefined || Array.isArray(response.errors);
};

/** Normalize upstream error codes to the public API's stable error surface. */
const getPublicGraphQLErrorCode = (error: InternalGraphQLError) => {
  const code = error.extensions?.code;

  if (typeof code === 'string' && EXPOSED_GRAPHQL_ERROR_CODES.has(code)) {
    return code;
  }

  return INTERNAL_SERVER_ERROR;
};

/** Remove internal details from errors that are not explicitly public. */
const mapInternalGraphQLError = (error: InternalGraphQLError) => {
  const code = getPublicGraphQLErrorCode(error);
  const canExposeMessage =
    code !== INTERNAL_SERVER_ERROR && typeof error.message === 'string';

  return {
    message: canExposeMessage ? error.message : 'Operation failed',
    extensions: { code },
  };
};

/** Build the response without exposing unrecognized internal errors. */
const buildPublicGraphQLResponse = (
  responseBody: InternalGraphQLResponse,
): InternalGraphQLResponse => {
  const publicResponse: InternalGraphQLResponse = {};

  if (responseBody.data !== undefined) {
    publicResponse.data = responseBody.data;
  }

  if (Array.isArray(responseBody.errors)) {
    publicResponse.errors = responseBody.errors.map(mapInternalGraphQLError);
  }

  return publicResponse;
};
/** Execute a validated public operation through the internal Apollo Router. */
const sendPublicGraphQLRequest = async (req: GatewayRequest, res: Response) => {
  if (!isOAuthBearerRequest(req)) {
    return res.status(401).json({ error: 'OAuth bearer token required' });
  }

  const body = (req.body ?? {}) as PublicApiRequestBody;
  const operationResult = resolvePublicApiOperation(body, req);

  if (operationResult.error) {
    return sendPublicApiError(res, operationResult.error);
  }

  const variablesError = getVariablesValidationError(body.variables);

  if (variablesError) {
    return sendPublicApiError(res, variablesError);
  }

  const variables = (body.variables ?? {}) as Record<string, unknown>;
  const subdomain = getSubdomain(req);
  const checkPermission = checkPermissionGroup(
    subdomain,
    req.user as unknown as IUserDocument,
  );

  for (const action of operationResult.operation.requiredActions) {
    await checkPermission(action);
  }

  const userHeader = req.headers.user;

  if (typeof userHeader !== 'string') {
    return res
      .status(401)
      .json({ error: 'Authenticated user context required' });
  }

  const internalResponse = await fetch(
    `http://127.0.0.1:${apolloRouterPort}/`,
    {
      method: 'POST',
      headers: getInternalHeaders(req, userHeader),
      body: JSON.stringify({
        query: operationResult.operation.document,
        operationName: operationResult.operation.operationName,
        variables,
      }),
      timeout: INTERNAL_GRAPHQL_REQUEST_TIMEOUT_MS,
    },
  );
  const responseBody = (await internalResponse.json()) as unknown;

  if (!isInternalGraphQLResponse(responseBody)) {
    return res
      .status(502)
      .json({ error: 'Invalid response from internal API' });
  }

  return res
    .status(internalResponse.status)
    .json(buildPublicGraphQLResponse(responseBody));
};

/** Register the OAuth-protected public GraphQL endpoint. */
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
          error:
            statusCode === 403 ? error.message : 'Public API request failed',
        });
      }
    },
  );
};

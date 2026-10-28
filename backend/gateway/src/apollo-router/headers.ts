import {
  agentToolsAuthHeaderName,
  clientPortalHeaderName,
  cpUserHeaderName,
  erxesSubdomainHeaderName,
  identitySignatureHeaderName,
  trpcContextHeaderName,
  trpcContextSignatureHeaderName,
  userHeaderName,
  userIdHeaderName,
} from 'erxes-api-shared/utils';

/**
 * Request headers the router forwards to subgraphs. Anything else a client
 * sends stops at the router, so a header a subgraph starts trusting later is
 * not client-controllable by default.
 *
 * The router only hears from the gateway, which strips client-supplied
 * identity headers and mints (and signs) its own, so identity headers are
 * listed here as gateway output.
 */
export const ROUTER_PROPAGATED_HEADERS: readonly string[] = [
  // Identity minted by the gateway (userMiddleware / proxyReq)
  userHeaderName,
  userIdHeaderName,
  cpUserHeaderName,
  clientPortalHeaderName,
  identitySignatureHeaderName,
  // Tenant resolution (getSubdomain)
  'hostname',
  'nginx-hostname',
  // Session and client context read by resolvers
  'cookie',
  'authorization',
  'sessioncode',
  'x-app-token',
  'client-auth-token',
  'erxes-widget-token',
  'erxes-pos-token',
  'pos-token',
  // Request metadata
  'origin',
  'referer',
  'user-agent',
  'accept-language',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-proto',
  // Correlation and tracing
  'x-erxes-process-id',
  'sentry-trace',
  'baggage',
  'traceparent',
  'tracestate',
];

// Internal credentials no subgraph request may carry, even if configured.
const NEVER_PROPAGATED_HEADERS: readonly string[] = [
  agentToolsAuthHeaderName,
  erxesSubdomainHeaderName,
  trpcContextHeaderName,
  trpcContextSignatureHeaderName,
];

const HEADER_NAME_PATTERN = /^[a-z0-9!#$%&'*+.^_`|~-]+$/;

/**
 * Header names from APOLLO_ROUTER_PROPAGATE_HEADERS (comma separated), for
 * plugins that read a request header not in the default list.
 */
export const parseExtraPropagatedHeaders = (value = ''): string[] =>
  value
    .split(',')
    .map((name) => name.trim().toLowerCase())
    .filter((name) => {
      if (!name) {
        return false;
      }

      if (
        !HEADER_NAME_PATTERN.test(name) ||
        NEVER_PROPAGATED_HEADERS.includes(name)
      ) {
        console.warn(
          `APOLLO_ROUTER_PROPAGATE_HEADERS: ignoring header "${name}"`,
        );
        return false;
      }

      return true;
    });

export const getRouterHeadersConfig = (
  extraHeaders = process.env.APOLLO_ROUTER_PROPAGATE_HEADERS,
) => {
  const names = [
    ...new Set([
      ...ROUTER_PROPAGATED_HEADERS,
      ...parseExtraPropagatedHeaders(extraHeaders),
    ]),
  ];

  return {
    all: {
      request: names.map((named) => ({ propagate: { named } })),
    },
  };
};

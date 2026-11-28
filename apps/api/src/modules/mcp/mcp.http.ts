import { caller, enterScope, requestOrgId, withOrg } from '@erxes/core-db';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { ORPCError } from '@orpc/server';
import {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
  Router,
} from 'express';
import { mcpCallerOf } from '~/http/auth';
import { installedPlugins } from '~/modules/apiTools/plugins';
import { getSettings } from '~/modules/assistant/settings.service';
import { APP_SCOPES, apiBaseOf, mcpResourceOf, originOf } from '~/modules/oauth/oauthClients';
import { mcpServer } from './mcpServer';

/** Where an MCP client finds how to get a token for the server (RFC 9728). */
const METADATA_PATH = '/.well-known/oauth-protected-resource/core/v1/mcp';

const metadataUrlOf = (req: Request) => `${originOf(req)}${METADATA_PATH}`;

/** The protected resource metadata: the MCP server, and core's API as its authorization server. */
const protectedResource = (req: Request, res: Response) => {
  const base = apiBaseOf(req);

  res.set('Cache-Control', 'public, max-age=300').json({
    resource: mcpResourceOf(base),
    authorization_servers: [base],
    scopes_supported: APP_SCOPES,
    bearer_methods_supported: ['header'],
    resource_name: 'erxes',
  });
};

/** A JSON-RPC error with no request id, as the transport answers what it can't take. */
const rpcError = (res: Response, status: number, message: string) =>
  res.status(status).json({ jsonrpc: '2.0', error: { code: -32_000, message }, id: null });

/**
 * A page on another site must not reach the server through its visitor's browser (DNS
 * rebinding): a request that names an origin names this one. Apps call from their servers or
 * from the command line, without one.
 */
const sameOrigin = (req: Request, res: Response, next: NextFunction) => {
  const { origin } = req.headers;

  if (origin && origin !== originOf(req)) {
    return rpcError(res, 403, 'Calls from another site are refused');
  }

  return next();
};

/** 401 with where to sign in, so the client starts OAuth (MCP authorization, RFC 9728). */
const challenge = (req: Request, res: Response) => {
  res.set(
    'WWW-Authenticate',
    `Bearer resource_metadata="${metadataUrlOf(req)}", scope="${APP_SCOPES.join(' ')}"`,
  );

  return rpcError(res, 401, 'Connect erxes first: sign in as a member, or use an API key');
};

/** The caller of an app's token or an API key; a refusal past sign-in (a key's rules) as it is. */
const authenticateMcp = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7).trim() : '';

  if (!bearer) return challenge(req, res);

  const resolved = await mcpCallerOf(req, bearer, mcpResourceOf(apiBaseOf(req))).catch(
    (error: unknown) => {
      if (error instanceof ORPCError && error.status === 401) return null;

      throw error;
    },
  );

  if (!resolved?.orgId || resolved.caller.type !== 'user') return challenge(req, res);

  return enterScope(resolved.caller, resolved.orgId, next);
};

/**
 * One JSON-RPC request, on a server of its own: stateless, JSON answers, no sessions. Each
 * request signs in again, so the member's access is as it stands now.
 */
const serve = async (req: Request, res: Response) => {
  const member = caller('user');
  const orgId = requestOrgId();

  const { codeMode, plugins } = await withOrg(orgId, async (tx) => ({
    codeMode: (await getSettings(tx)).codeMode,
    plugins: await installedPlugins(tx),
  }));

  const server = mcpServer(
    { caller: () => Promise.resolve(member), orgId, unattended: false, plugins },
    codeMode,
  );

  const transport = new NodeStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on('close', () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
};

/**
 * The MCP server at `/core/v1/mcp` (Streamable HTTP, stateless): an app such as Claude or
 * ChatGPT, or a coding agent with an API key, acts as the member through it. It signs in on its
 * own, before core's API, so it answers MCP's way.
 */
export const mcpRoutes = (limits: { calls: RequestHandler }) => {
  const routes = Router();

  routes.get(METADATA_PATH, protectedResource);
  routes.post('/core/v1/mcp', sameOrigin, limits.calls, authenticateMcp, serve);
  // No server-sent stream without sessions: every answer comes back on its own POST.
  routes.all('/core/v1/mcp', (_req, res) => rpcError(res, 405, 'Send JSON-RPC as a POST'));

  return routes;
};

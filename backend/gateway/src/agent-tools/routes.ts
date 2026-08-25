import crypto from 'node:crypto';
import express, { Request, Response, Router } from 'express';
import fetch from 'node-fetch';

import {
  AgentToolDescriptor,
  AgentToolManifest,
  encodeAgentToolsAuthHeader,
  getSubdomain,
  redis,
} from 'erxes-api-shared/utils';
import { ErxesProxyTarget } from '~/proxy/targets';

type OAuthUser = {
  _id?: string;
  oauthClientId?: string;
  oauthScopes?: string[];
};

type AgentRequest = Request & { user?: OAuthUser };
type InternalResponse<T> = {
  status: 'success' | 'error';
  data?: T;
  error?: { code?: string; message?: string };
};

const router: Router = Router();
const targets = (): ErxesProxyTarget[] => global.currentTargets || [];

const requireOAuth = (req: AgentRequest, res: Response): OAuthUser | null => {
  if (!req.user?._id || !req.user.oauthClientId) {
    res.status(401).json({
      error: {
        code: 'OAUTH_REQUIRED',
        message: 'A valid erxes OAuth access token is required',
      },
    });
    return null;
  }

  return req.user;
};

const signedHeaders = (req: AgentRequest, user: OAuthUser) => ({
  'Content-Type': 'application/json',
  'x-erxes-agent-auth': encodeAgentToolsAuthHeader(
    getSubdomain(req),
    user._id,
    {
      clientId: user.oauthClientId,
      scopes: user.oauthScopes || [],
    },
  ),
});

const fetchInternal = async <T>({
  target,
  path,
  method = 'GET',
  headers,
  body,
}: {
  target: ErxesProxyTarget;
  path: string;
  method?: 'GET' | 'POST';
  headers: Record<string, string>;
  body?: unknown;
}): Promise<{ status: number; payload: InternalResponse<T> }> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(`${target.address}${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });

    return {
      status: response.status,
      payload: (await response.json()) as InternalResponse<T>,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const pluginFromToolId = (toolId: string) =>
  /^([a-zA-Z0-9_-]+)\.trpc\./.exec(toolId)?.[1] || null;

const confirmationKey = (id: string) => `agent_tool_confirmation:${id}`;
const inputDigest = (toolId: string, input: unknown) =>
  crypto
    .createHash('sha256')
    .update(JSON.stringify({ toolId, input: input || {} }))
    .digest('hex');

const createConfirmation = async (
  req: AgentRequest,
  user: OAuthUser,
  tool: AgentToolDescriptor,
  input: unknown,
) => {
  const id = crypto.randomUUID();

  await redis.set(
    confirmationKey(id),
    JSON.stringify({
      subdomain: getSubdomain(req),
      userId: user._id,
      clientId: user.oauthClientId,
      toolId: tool.id,
      digest: inputDigest(tool.id, input),
    }),
    'EX',
    300,
  );

  return { id, toolId: tool.id, summary: tool.description, expiresIn: 300 };
};

const consumeConfirmation = async (
  req: AgentRequest,
  user: OAuthUser,
  toolId: string,
  input: unknown,
  confirmationId: string,
) => {
  const raw = (await redis.eval(
    "local v=redis.call('GET',KEYS[1]); if v then redis.call('DEL',KEYS[1]) end; return v",
    1,
    confirmationKey(confirmationId),
  )) as string | null;

  if (!raw) return false;

  try {
    const saved = JSON.parse(raw);
    return (
      saved.subdomain === getSubdomain(req) &&
      saved.userId === user._id &&
      saved.clientId === user.oauthClientId &&
      saved.toolId === toolId &&
      saved.digest === inputDigest(toolId, input)
    );
  } catch {
    return false;
  }
};

router.get('/agent-tools/manifest', async (req: AgentRequest, res) => {
  const user = requireOAuth(req, res);
  if (!user) return;

  const headers = signedHeaders(req, user);
  const targetList = targets();
  const settled = await Promise.allSettled(
    targetList.map(async (target) => ({
      target,
      result: await fetchInternal<AgentToolManifest>({
        target,
        path: '/agent-tools/manifest',
        headers,
      }),
    })),
  );
  const tools: AgentToolDescriptor[] = [];
  const unavailablePlugins: string[] = [];

  settled.forEach((result, index) => {
    const plugin = targetList[index]?.name || 'unknown';
    const manifest =
      result.status === 'fulfilled' && result.value.result.status < 400
        ? result.value.result.payload.data
        : undefined;

    if (!manifest) {
      unavailablePlugins.push(plugin);
      return;
    }

    tools.push(...manifest.tools);
  });

  const search = String(req.query.query || '')
    .trim()
    .toLowerCase();
  const plugin = String(req.query.plugin || '').trim();
  const module = String(req.query.module || '').trim();
  const offset = Math.max(0, Number(req.query.cursor) || 0);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const filtered = tools.filter((tool) => {
    if (plugin && tool.plugin !== plugin) return false;
    if (module && tool.module !== module) return false;
    if (!search) return true;

    return `${tool.id} ${tool.plugin} ${tool.module} ${tool.description}`
      .toLowerCase()
      .includes(search);
  });

  return res.json({
    tools: filtered.slice(offset, offset + limit),
    total: filtered.length,
    nextCursor:
      offset + limit < filtered.length ? String(offset + limit) : null,
    unavailablePlugins: [...new Set(unavailablePlugins)],
  });
});

router.post(
  '/agent-tools/call',
  express.json({ limit: '256kb' }),
  async (req: AgentRequest, res) => {
    const user = requireOAuth(req, res);
    if (!user) return;

    const { toolId, input, confirmationId } = req.body || {};

    if (typeof toolId !== 'string' || !toolId) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'toolId is required' },
      });
    }

    if (
      input !== undefined &&
      (!input || typeof input !== 'object' || Array.isArray(input))
    ) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'input must be an object' },
      });
    }

    const plugin = pluginFromToolId(toolId);
    const target = plugin
      ? targets().find((candidate) => candidate.name === plugin)
      : undefined;

    if (!target) {
      return res.status(404).json({
        error: { code: 'UNKNOWN_TOOL', message: 'Unknown erxes tool' },
      });
    }

    try {
      const headers = signedHeaders(req, user);
      const manifestResult = await fetchInternal<AgentToolManifest>({
        target,
        path: '/agent-tools/manifest',
        headers,
      });
      const tool = manifestResult.payload.data?.tools.find(
        (candidate) => candidate.id === toolId,
      );

      if (!tool) {
        return res.status(403).json({
          error: {
            code: 'TOOL_NOT_GRANTED',
            message: 'This tool was not delegated during OAuth',
          },
        });
      }

      if (tool.destructive) {
        const confirmed =
          typeof confirmationId === 'string' &&
          (await consumeConfirmation(req, user, toolId, input, confirmationId));

        if (!confirmed) {
          return res.status(409).json({
            error: {
              code: 'CONFIRMATION_REQUIRED',
              message: 'Explicit user confirmation is required',
            },
            confirmation: await createConfirmation(req, user, tool, input),
          });
        }
      }

      const result = await fetchInternal<unknown>({
        target,
        path: '/agent-tools/call',
        method: 'POST',
        headers,
        body: { toolId, input },
      });

      console.log(
        JSON.stringify({
          scope: 'agent-tools',
          event: 'call',
          subdomain: getSubdomain(req),
          userId: user._id,
          oauthClientId: user.oauthClientId,
          toolId,
          status: result.status,
        }),
      );

      return res.status(result.status).json(result.payload);
    } catch {
      return res.status(502).json({
        error: {
          code: 'PLUGIN_UNAVAILABLE',
          message: 'The erxes plugin is temporarily unavailable',
        },
      });
    }
  },
);

export default router;

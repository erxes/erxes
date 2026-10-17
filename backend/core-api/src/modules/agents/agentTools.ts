import {
  agentToolsAuthHeaderName,
  encodeAgentToolsAuthHeader,
  getPluginAddress,
  getPlugins,
} from 'erxes-api-shared/utils';

/**
 * Client for the platform's admit-only agent capability endpoints
 * (`/agent-tools/manifest`, `/agent-tools/call`) that are auto-mounted on
 * every plugin exposing a tRPC router. Identity is carried in the HMAC-signed
 * `x-erxes-agent-auth` header (5-minute TTL, minted per request).
 */

interface IEnvelope<T> {
  status: 'success' | 'error';
  data?: T;
  error?: { code?: string; message?: string; suggestion?: string };
}

export interface IAgentToolDescriptor {
  id: string;
  kind: 'trpc';
  plugin: string;
  module: string;
  method: 'query' | 'mutation';
  destructive: boolean;
  description: string;
  inputFields: { name: string; type: string; required: boolean }[] | null;
  inputSchema?: Record<string, unknown>;
  permission: { module: string; action: string } | null;
  path: string;
}

export interface IPluginToolManifest {
  plugin: string;
  tools: IAgentToolDescriptor[];
}

const readEnvelope = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as IEnvelope<T>;

  if (payload.status !== 'success' || payload.data === undefined) {
    const code = payload.error?.code || 'SERVER_ERROR';
    const message = payload.error?.message || 'Agent tools request failed.';
    const error = new Error(message);

    Object.assign(error, {
      code,
      statusCode: response.status,
      ...(payload.error?.suggestion
        ? { suggestion: payload.error.suggestion }
        : {}),
    });

    throw error;
  }

  return payload.data;
};

/** Fetch one service's manifest; tolerates unreachable services. */
const fetchManifest = async (
  plugin: string,
  subdomain: string,
): Promise<IPluginToolManifest | { plugin: string; error: string }> => {
  try {
    const address = await getPluginAddress(plugin);

    if (!address) {
      return { plugin, error: 'address unavailable' };
    }

    const response = await fetch(`${address}/agent-tools/manifest`, {
      headers: {
        [agentToolsAuthHeaderName]: encodeAgentToolsAuthHeader(subdomain),
      },
    });

    return await readEnvelope<IPluginToolManifest>(response);
  } catch (error) {
    return {
      plugin,
      error: error instanceof Error ? error.message : 'manifest fetch failed',
    };
  }
};

/** Manifests of every currently registered service, merged client-side. */
export const listAgentToolManifests = async (
  subdomain: string,
): Promise<{
  manifests: IPluginToolManifest[];
  failures: { plugin: string; error: string }[];
}> => {
  const plugins = await getPlugins();
  const results = await Promise.all(
    plugins.map((plugin) => fetchManifest(plugin, subdomain)),
  );

  const manifests: IPluginToolManifest[] = [];
  const failures: { plugin: string; error: string }[] = [];

  for (const result of results) {
    if ('tools' in result) {
      manifests.push(result);
    } else {
      failures.push(result);
    }
  }

  return { manifests, failures };
};

/**
 * Execute a tool through its owning plugin's `/agent-tools/call`. Requires a
 * signed `subdomain` + `userId`; the owning service enforces the acting
 * user's permission for the tool's declared action.
 */
export const callAgentTool = async ({
  subdomain,
  userId,
  toolId,
  input,
}: {
  subdomain: string;
  userId: string;
  toolId: string;
  input?: Record<string, unknown>;
}): Promise<unknown> => {
  const [plugin] = toolId.split('.');

  if (!plugin) {
    throw new Error(`Invalid agent tool id "${toolId}".`);
  }

  const address = await getPluginAddress(plugin);

  if (!address) {
    throw new Error(`Service "${plugin}" address is not available.`);
  }

  const response = await fetch(`${address}/agent-tools/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [agentToolsAuthHeaderName]: encodeAgentToolsAuthHeader(
        subdomain,
        userId,
      ),
    },
    body: JSON.stringify({ toolId, input: input || {} }),
  });

  return readEnvelope<unknown>(response);
};

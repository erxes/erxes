import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import type { Client } from '@__id__/api';
import { pluginFetch } from 'erxes-ui';

/** The plugin's name in core. */
export const PLUGIN = '__id__';

const PREFIX = '/rpc';

const link = new RPCLink({
  // A placeholder origin: pluginFetch swaps it for the API address in the
  // manifest and adds this member's 5-minute session token.
  url: new URL(PREFIX, window.location.origin),
  fetch: async (request) => {
    const { pathname, search } = new URL(request.url);

    return pluginFetch(PLUGIN, `rpc${pathname.slice(PREFIX.length)}${search}`, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'GET' ? undefined : await request.arrayBuffer(),
      signal: request.signal,
    });
  },
});

/** The API, typed from api/src/router.ts: `await client.items.list({})`. */
export const client: Client = createORPCClient(link);

/** TanStack Query options per procedure: `useQuery(orpc.items.list.queryOptions({ input }))`. */
export const orpc = createTanstackQueryUtils(client);

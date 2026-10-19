import { WorkerEntrypoint } from 'cloudflare:workers';

const WORKER_COMPATIBILITY_DATE = '2025-09-01';

// Handed to the extension for one call. Its only prop is the invocation's
// grant, which the runtime maps to one tenant, one install, its collections,
// its pinned contracts and the caller's session, and revokes when the call
// ends. The extension can't name another tenant, extension or session.
//
// Both methods answer with the runtime's envelope, `{ ok, data }` or
// `{ ok: false, error: { code, message, issues } }`, unchanged.
export class Host extends WorkerEntrypoint {
  async db(collection, op, args) {
    return hostPost(this, '/db', { collection, op, args });
  }

  async call(host, name, input) {
    return hostPost(this, '/contract', { host, name, input });
  }
}

// The global outbound of an extension that declares network hosts, made for
// one call like Host. Every fetch the extension makes goes to the runtime's
// /egress, which checks it against the call's grant and sends it upstream.
export class Egress extends WorkerEntrypoint {
  async fetch(request) {
    const forwarded = new Request('http://runtime/egress', request);
    forwarded.headers.set('x-ext-runtime-token', this.env.TOKEN);
    forwarded.headers.set('x-ext-grant', this.ctx.props.grant);
    forwarded.headers.set('x-ext-egress-url', request.url);
    return this.env.RUNTIME.fetch(forwarded);
  }
}

// Not a Host method: every method there is callable by the extension.
const hostPost = async ({ env, ctx }, path, body) => {
  const res = await env.RUNTIME.fetch(`http://runtime${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-ext-runtime-token': env.TOKEN,
    },
    body: JSON.stringify({ ...body, grant: ctx.props.grant }),
  });

  return res.json().catch(() => ({
    ok: false,
    error: { code: 'HOST_ERROR', message: `host answered ${res.status}` },
  }));
};

export const blockedOutbound = {
  async fetch() {
    return new Response('egress blocked', { status: 403 });
  },
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method !== 'POST' || url.pathname !== '/invoke') {
      return new Response('not found', { status: 404 });
    }

    const { workerKey, grant, code, name, input, user, network, secrets } =
      await request.json();
    const started = Date.now();

    try {
      const workerCode = (globalOutbound) => ({
        compatibilityDate: WORKER_COMPATIBILITY_DATE,
        mainModule: 'ext.js',
        modules: { 'ext.js': code },
        globalOutbound,
        env: {},
      });
      // The loader caches a worker by key with the outbound it was loaded
      // with, so an outbound bound to this call's grant needs a worker of its
      // own: `load` makes one that isn't cached. Without network hosts the
      // cached worker gets no outbound at all.
      const worker = network
        ? env.loader.load(workerCode(ctx.exports.Egress({ props: { grant } })))
        : env.loader.get(workerKey, () => workerCode(null));
      const host = ctx.exports.Host({ props: { grant } });
      // The worker's result is already the envelope; pass it through.
      const result = await worker
        .getEntrypoint()
        .invoke(name, input, user, host, secrets);

      return Response.json({ ...result, ms: Date.now() - started });
    } catch (e) {
      // The bundle failed to load, or invoke itself threw.
      return Response.json({
        ok: false,
        error: { code: 'FUNCTION_ERROR', message: String(e) },
        ms: Date.now() - started,
      });
    }
  },
};

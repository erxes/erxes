import { WorkerEntrypoint } from 'cloudflare:workers';

const WORKER_COMPATIBILITY_DATE = '2025-09-01';

// Handed to the extension for one call. Its only prop is the invocation's
// grant, which the runtime maps to one tenant, one install and its
// collections, and revokes when the call ends. The extension can't name
// another tenant or extension.
export class Host extends WorkerEntrypoint {
  // Answers with the runtime's envelope, `{ ok, data }` or
  // `{ ok: false, error: { code, message, issues } }`, unchanged.
  async db(collection, op, args) {
    const res = await this.env.RUNTIME.fetch('http://runtime/db', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-ext-runtime-token': this.env.TOKEN,
      },
      body: JSON.stringify({
        grant: this.ctx.props.grant,
        collection,
        op,
        args,
      }),
    });

    return res.json().catch(() => ({
      ok: false,
      error: { code: 'HOST_ERROR', message: `host answered ${res.status}` },
    }));
  }
}

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

    const { workerKey, grant, code, name, input, user } = await request.json();
    const started = Date.now();

    try {
      const worker = env.loader.get(workerKey, () => ({
        compatibilityDate: WORKER_COMPATIBILITY_DATE,
        mainModule: 'ext.js',
        modules: { 'ext.js': code },
        globalOutbound: null,
        env: {},
      }));
      const host = ctx.exports.Host({ props: { grant } });
      // The worker's result is already the envelope; pass it through.
      const result = await worker
        .getEntrypoint()
        .invoke(name, input, user, host);

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

import { deriveTenantSecret, sign, verify } from './hmac';
import { masterFor, routeFor } from './routes';
import { Env } from './types';

const MAX_SKEW_SECONDS = 300;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const isFresh = (timestamp: string) => {
  const seconds = Number.parseInt(timestamp, 10);

  return (
    Number.isFinite(seconds) &&
    Math.abs(Date.now() / 1000 - seconds) <= MAX_SKEW_SECONDS
  );
};

const tenantOf = (body: string) => {
  try {
    return (JSON.parse(body) as { tenant?: string }).tenant?.trim() ?? '';
  } catch {
    return '';
  }
};

export const handleVerify = async (request: Request, env: Env) => {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const body = await request.text();
  const tenant = tenantOf(body);

  if (!tenant) {
    return json({ ok: false, error: 'tenant is required' }, 400);
  }

  const route = await routeFor(env, tenant);
  const secret = await deriveTenantSecret(masterFor(env, route), tenant);
  const timestamp = request.headers.get('x-erxes-timestamp') ?? '';
  const signature = request.headers.get('x-erxes-signature') ?? '';

  if (
    !isFresh(timestamp) ||
    !(await verify(`${timestamp}.${body}`, signature, secret))
  ) {
    return json({ ok: false, error: 'Invalid signature' }, 401);
  }

  if (!route.endpoint) {
    return json(
      { ok: false, error: `No endpoint is configured for ${tenant}` },
      404,
    );
  }

  const probe = JSON.stringify({ probe: true, tenant });
  const probeStamp = Math.floor(Date.now() / 1000).toString();

  try {
    const response = await fetch(route.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-erxes-timestamp': probeStamp,
        'x-erxes-signature': await sign(`${probeStamp}.${probe}`, secret),
      },
      body: probe,
    });

    return json({
      ok: response.ok,
      endpoint: route.endpoint,
      status: response.status,
      error: response.ok ? undefined : (await response.text()).slice(0, 512),
    });
  } catch (error) {
    return json({
      ok: false,
      endpoint: route.endpoint,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

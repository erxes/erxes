import { Env, TenantRoute } from './types';

const ROUTE_CACHE_SECONDS = 300;

export const routeFor = async (
  env: Env,
  tenant: string,
): Promise<TenantRoute> => {
  const registered = env.MAIL_ROUTES
    ? await env.MAIL_ROUTES.get<TenantRoute>(tenant, {
        type: 'json',
        cacheTtl: ROUTE_CACHE_SECONDS,
      })
    : null;

  if (registered?.endpoint) {
    return registered;
  }

  if (env.ERXES_ENDPOINT) {
    return { endpoint: env.ERXES_ENDPOINT };
  }

  return {
    endpoint: env.ERXES_ENDPOINT_TEMPLATE.replace('{tenant}', tenant),
  };
};

export const masterFor = (env: Env, route: TenantRoute) =>
  route.secret || env.WEBHOOK_SECRET;

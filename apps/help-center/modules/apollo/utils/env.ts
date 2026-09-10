/*
 * The gateway address is read at run time, not baked into the bundle, so one
 * image can serve any number of deployments. `docker-entrypoint.sh` writes
 * public/js/env.js from the container's environment before the server starts,
 * and the root layout loads that file ahead of the app.
 *
 * On the server the same value is still in `process.env`, which is where
 * server components and the Apollo client used during SSR read it from.
 */
declare global {
  interface Window {
    env?: Record<string, string | undefined>;
  }
}

export const readApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.env?.NEXT_PUBLIC_ERXES_API_URL) {
    return window.env.NEXT_PUBLIC_ERXES_API_URL;
  }

  // No env.js — running from `next dev` or `next start` outside Docker, where
  // the value comes from .env.local the way any other Next app reads it.
  return process.env.NEXT_PUBLIC_ERXES_API_URL ?? '';
};

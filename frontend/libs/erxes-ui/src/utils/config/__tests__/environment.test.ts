/** @jest-environment node */

import { buildSync } from 'esbuild';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

type EnvironmentContext = {
  window?: {
    env?: Record<string, string>;
    location: { protocol: string; hostname: string };
  };
  process?: { env: Record<string, string> };
};

const loadEnvironment = (
  context: EnvironmentContext,
  define?: Record<string, string>,
): Record<string, string | undefined> => {
  const result = buildSync({
    entryPoints: [resolve(__dirname, '../index.ts')],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'neutral',
    define,
  });
  const code = result.outputFiles?.[0]?.text;
  if (!code) throw new Error('No environment module was built.');
  const module: { exports: Record<string, string | undefined> } = {
    exports: {},
  };
  runInNewContext(code, { module, ...context });
  return module.exports;
};

describe('standalone package environment', () => {
  const location = { protocol: 'https:', hostname: 'acme.example.com' };

  it('loads in a browser without a Node process global', () => {
    const environment = loadEnvironment({ window: { location } });
    expect(environment.NODE_ENV).toBe('development');
    expect(environment.REACT_APP_API_URL).toBe('http://localhost:4000');
    expect(environment.REACT_APP_IMAGE_CDN_URL).toBeUndefined();
  });

  it('prefers runtime browser configuration and replaces the subdomain', () => {
    const environment = loadEnvironment({
      window: {
        location,
        env: {
          REACT_APP_API_URL: 'https://<subdomain>.api.example.com',
          REACT_APP_IMAGE_CDN_URL: 'https://cdn.example.com',
        },
      },
      process: { env: { REACT_APP_API_URL: 'https://build.example.com' } },
    });
    expect(environment.REACT_APP_API_URL).toBe('https://acme.api.example.com');
    expect(environment.REACT_APP_IMAGE_CDN_URL).toBe('https://cdn.example.com');
  });

  it('uses the browser gateway in production', () => {
    const environment = loadEnvironment({
      window: { location },
      process: { env: { NODE_ENV: 'production' } },
    });
    expect(environment.REACT_APP_API_URL).toBe(
      'https://acme.example.com/gateway',
    );
  });

  it('can be evaluated during server rendering without a window', () => {
    const environment = loadEnvironment({
      process: { env: { NODE_ENV: 'production' } },
    });
    expect(environment.REACT_APP_API_URL).toBe('/gateway');
  });

  it('preserves compile-time environment replacement in the host bundler', () => {
    const environment = loadEnvironment(
      { window: { location } },
      {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.REACT_APP_API_URL': JSON.stringify(
          'https://build.example.com',
        ),
      },
    );
    expect(environment.NODE_ENV).toBe('production');
    expect(environment.REACT_APP_API_URL).toBe('https://build.example.com');
  });
});

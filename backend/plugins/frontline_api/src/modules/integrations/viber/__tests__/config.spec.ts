import { test } from 'node:test';
import { deepStrictEqual, strictEqual, throws } from 'node:assert';
import { Module } from 'node:module';
import type { TestContext } from './helperHarness';

const SUBDOMAIN = 'tenant-test';
const INBOX_ID = 'inbox-test';

const loadConfig = (
  t: TestContext,
  environment: Record<string, string> = {},
) => {
  const [utilsPath, configPath] = ['erxes-api-shared/utils', '../config'].map(
    (specifier) => require.resolve(specifier),
  );
  const originals = new Map(
    [utilsPath, configPath].map((filename) => [
      filename,
      require.cache[filename],
    ]),
  );
  const originalNodeEnv = process.env.NODE_ENV;

  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) {
        require.cache[filename] = original;
      } else {
        delete require.cache[filename];
      }
    }
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  if (environment.NODE_ENV === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = environment.NODE_ENV;
  }

  // Model the public getEnv contract without loading its service dependencies.
  const getEnv = t.mock.fn(
    ({ name, subdomain }: { name: string; subdomain?: string }): string => {
      const value = environment[name] || '';
      return subdomain ? value.replace('<subdomain>', subdomain) : value;
    },
  );
  const replacement = new Module(utilsPath);
  replacement.filename = utilsPath;
  replacement.loaded = true;
  replacement.exports = { getEnv };
  require.cache[utilsPath] = replacement;
  delete require.cache[configPath];

  const config: typeof import('../config') = require('../config');
  return { ...config, getEnv };
};

test('builds the production gateway callback path', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    NODE_ENV: 'production',
    DOMAIN: 'https://tenant.example',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tenant.example/gateway/pl:frontline/viber/receive/inbox-test',
  );
});

test('builds the non-production gateway callback path', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    NODE_ENV: 'development',
    DOMAIN: 'https://tenant.example',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tenant.example/pl:frontline/viber/receive/inbox-test',
  );
});

test('an unset NODE_ENV uses the non-production path', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    DOMAIN: 'https://tenant.example',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tenant.example/pl:frontline/viber/receive/inbox-test',
  );
});

test('a direct-plugin tunnel override takes precedence over DOMAIN', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    NODE_ENV: 'production',
    DOMAIN: 'http://localhost:3001',
    VIBER_RECEIVE_URL: 'https://tunnel.example/viber/receive/',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tunnel.example/viber/receive/inbox-test',
  );
});

test('an explicit receiver URL works without DOMAIN and preserves its path', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    VIBER_RECEIVE_URL: 'https://tunnel.example/custom/viber/receive///',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tunnel.example/custom/viber/receive/inbox-test',
  );
});

test('removes trailing DOMAIN slashes without dropping an existing path prefix', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    NODE_ENV: 'production',
    DOMAIN: 'https://tenant.example/erxes///',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tenant.example/erxes/gateway/pl:frontline/viber/receive/inbox-test',
  );
});

test('supplies the tenant to getEnv for both supported configuration values', (t) => {
  const { getViberWebhookUrl, getEnv } = loadConfig(t, {
    DOMAIN: 'https://<subdomain>.example',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tenant-test.example/pl:frontline/viber/receive/inbox-test',
  );
  deepStrictEqual(
    getEnv.mock.calls.map(({ arguments: args }) => args),
    [
      [{ name: 'VIBER_RECEIVE_URL', subdomain: SUBDOMAIN }],
      [{ name: 'DOMAIN', subdomain: SUBDOMAIN }],
    ],
  );
});

test('uses the tenant-resolved override returned by getEnv', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    VIBER_RECEIVE_URL: 'https://<subdomain>.example/viber/receive',
  });

  strictEqual(
    getViberWebhookUrl(SUBDOMAIN, INBOX_ID),
    'https://tenant-test.example/viber/receive/inbox-test',
  );
});

test('encodes reserved characters and Unicode ids into one path segment', (t) => {
  const { getViberWebhookUrl } = loadConfig(t, {
    VIBER_RECEIVE_URL: 'https://tenant.example/viber/receive',
  });

  for (const integrationId of [
    'inbox/child?x=1#part',
    '%2E%2E',
    'ирсэн мессеж',
  ]) {
    const url = new URL(getViberWebhookUrl(SUBDOMAIN, integrationId));

    strictEqual(
      url.pathname,
      `/viber/receive/${encodeURIComponent(integrationId)}`,
    );
    strictEqual(decodeURIComponent(url.pathname.split('/')[3]), integrationId);
    strictEqual(url.search, '');
    strictEqual(url.hash, '');
  }
});

test('rejects blank tenant, blank id, and dot-segment ids before reading config', (t) => {
  const { getViberWebhookUrl, getEnv } = loadConfig(t);

  for (const subdomain of ['', ' \t\n']) {
    throws(() => getViberWebhookUrl(subdomain, INBOX_ID), {
      message: 'Subdomain is required',
    });
  }
  for (const integrationId of ['', ' \t\n', '.', '..']) {
    throws(() => getViberWebhookUrl(SUBDOMAIN, integrationId), {
      message: 'Invalid integration id',
    });
  }
  strictEqual(getEnv.mock.callCount(), 0);
});

test('rejects missing configuration with an actionable error', (t) => {
  const { getViberWebhookUrl } = loadConfig(t);

  throws(() => getViberWebhookUrl(SUBDOMAIN, INBOX_ID), {
    message: 'Viber webhook URL is not configured',
  });
});

test('rejects invalid configured URLs without silently falling back to DOMAIN', (t) => {
  const environment = {
    DOMAIN: 'https://tenant.example',
    VIBER_RECEIVE_URL: '',
  };
  const { getViberWebhookUrl } = loadConfig(t, environment);

  for (const value of [
    'not-a-url',
    '/viber/receive',
    'http://tenant.example/viber/receive',
    'ftp://tenant.example/viber/receive',
    'https://user:secret@tenant.example/viber/receive',
    'https://tenant.example/viber/receive?token=secret',
    'https://tenant.example/viber/receive#fragment',
  ]) {
    environment.VIBER_RECEIVE_URL = value;
    throws(() => getViberWebhookUrl(SUBDOMAIN, INBOX_ID), {
      message: 'Invalid Viber receive URL',
    });
  }

  environment.VIBER_RECEIVE_URL = '';
  environment.DOMAIN = 'http://localhost:3001';
  throws(() => getViberWebhookUrl(SUBDOMAIN, INBOX_ID), {
    message: 'Invalid Viber receive URL',
  });
});

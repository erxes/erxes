import { createHmac } from 'crypto';
import {
  isRetryableWebhookStatus,
  publicLookup,
  signWebhookBody,
  validateWebhookUrl,
} from './changes';

describe('validateWebhookUrl', () => {
  const env = process.env.DATA_EXTENSIONS_WEBHOOKS_ALLOW_HTTP;

  afterEach(() => {
    process.env.DATA_EXTENSIONS_WEBHOOKS_ALLOW_HTTP = env;
  });

  it('accepts public https URLs', () => {
    expect(
      validateWebhookUrl('https://hooks.example.com/erxes?x=1').hostname,
    ).toBe('hooks.example.com');
  });

  it.each([
    ['http://hooks.example.com', 'https'],
    ['ftp://hooks.example.com', 'https'],
    ['https://user:pass@hooks.example.com', 'credentials'],
    ['https://127.0.0.1/x', 'private'],
    ['https://10.1.2.3/x', 'private'],
    ['https://172.20.0.5/x', 'private'],
    ['https://192.168.1.1/x', 'private'],
    ['https://169.254.169.254/latest/meta-data', 'private'],
    ['https://100.64.0.1/x', 'private'],
    ['https://0.0.0.0/x', 'private'],
    ['https://[::1]/x', 'private'],
    ['https://[fd00::1]/x', 'private'],
    ['https://[::ffff:127.0.0.1]/x', 'private'],
    ['not a url', 'not valid'],
  ])('refuses %s', (url, message) => {
    expect(() => validateWebhookUrl(url)).toThrow(message);
  });

  it('allows http only when the environment opts in', () => {
    process.env.DATA_EXTENSIONS_WEBHOOKS_ALLOW_HTTP = 'true';

    expect(validateWebhookUrl('http://hooks.example.com').protocol).toBe(
      'http:',
    );
    expect(() => validateWebhookUrl('http://127.0.0.1')).toThrow('private');
  });
});

describe('signWebhookBody', () => {
  it('signs the exact body with HMAC-SHA256', () => {
    const body = JSON.stringify({ event: 'values.updated' });

    expect(signWebhookBody('secret', body)).toBe(
      `sha256=${createHmac('sha256', 'secret').update(body).digest('hex')}`,
    );
  });
});

describe('isRetryableWebhookStatus', () => {
  it.each([0, 429, 500, 502, 503, 504])('retries %s', (status) => {
    expect(isRetryableWebhookStatus(status)).toBe(true);
  });

  it.each([400, 401, 403, 404, 410, 422, 301])('stops on %s', (status) => {
    expect(isRetryableWebhookStatus(status)).toBe(false);
  });
});

describe('webhook address checks', () => {
  it.each([
    'https://redis.saas-prod.svc.cluster.local/x',
    'https://core-api.svc/x',
    'https://erxes-prod-redis-prod-0.us-west1-a.c.erxes-saas-production.internal/x',
    'https://localhost/x',
    'https://printer.local/x',
    'https://[::ffff:a00:1]/x',
    'https://[64:ff9b::a00:1]/x',
    'https://[fec0::1]/x',
    'https://198.18.0.1/x',
  ])('refuses %s', (url) => {
    expect(() => validateWebhookUrl(url)).toThrow('private');
  });

  it('refuses a host that resolves to a private address when connecting', (done) => {
    publicLookup('localhost', {}, (error) => {
      expect(error?.code).toBe('EPRIVATE');
      done();
    });
  });

  it('refuses addresses listed in DATA_EXTENSIONS_WEBHOOKS_BLOCKED', () => {
    process.env.DATA_EXTENSIONS_WEBHOOKS_BLOCKED =
      '203.0.113.7, 198.51.100.0/24';

    jest.isolateModules(() => {
      const isolated = require('./changes');

      expect(isolated.isRefusedAddress('203.0.113.7')).toBe(true);
      expect(isolated.isRefusedAddress('::ffff:203.0.113.7')).toBe(true);
      expect(isolated.isRefusedAddress('198.51.100.20')).toBe(true);
      expect(isolated.isRefusedAddress('203.0.113.8')).toBe(false);
      expect(() =>
        isolated.validateWebhookUrl('https://198.51.100.20/x'),
      ).toThrow('private');
    });

    delete process.env.DATA_EXTENSIONS_WEBHOOKS_BLOCKED;
  });

  it('allows only port 443 on SaaS unless ports are configured', () => {
    const version = process.env.VERSION;
    process.env.VERSION = 'saas';

    jest.isolateModules(() => {
      const isolated = require('./changes');

      expect(
        isolated.validateWebhookUrl('https://hooks.example.com/x').port,
      ).toBe('');
      expect(() =>
        isolated.validateWebhookUrl('https://hooks.example.com:9200/x'),
      ).toThrow('port 443');
    });

    process.env.DATA_EXTENSIONS_WEBHOOKS_PORTS = '443,8443';

    jest.isolateModules(() => {
      const isolated = require('./changes');

      expect(
        isolated.validateWebhookUrl('https://hooks.example.com:8443/x').port,
      ).toBe('8443');
    });

    process.env.VERSION = version;
    delete process.env.DATA_EXTENSIONS_WEBHOOKS_PORTS;
  });

  it('allows any port outside SaaS', () => {
    expect(validateWebhookUrl('https://hooks.example.com:5678/x').port).toBe(
      '5678',
    );
  });
});

import { createHmac } from 'crypto';
import { signWebhookBody, validateWebhookUrl } from './changes';

describe('validateWebhookUrl', () => {
  const env = process.env.DATA_EXTENSIONS_WEBHOOKS_ALLOW_HTTP;

  afterEach(() => {
    process.env.DATA_EXTENSIONS_WEBHOOKS_ALLOW_HTTP = env;
  });

  it('accepts public https URLs', () => {
    expect(validateWebhookUrl('https://hooks.example.com/erxes?x=1').hostname).toBe(
      'hooks.example.com',
    );
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

    expect(validateWebhookUrl('http://hooks.example.com').protocol).toBe('http:');
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

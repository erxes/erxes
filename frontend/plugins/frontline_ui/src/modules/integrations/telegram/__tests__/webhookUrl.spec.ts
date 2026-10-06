import {
  getTelegramDefaultServerAddress,
  getTelegramServerAddress,
  getTelegramWebhookUrl,
} from '../webhookUrl';

test.each([
  [
    'https://workspace.example/gateway',
    'https://workspace.example/gateway/pl:frontline',
  ],
  ['https://api.example/', 'https://api.example/pl:frontline'],
  [
    'https://workspace.example/custom/api/',
    'https://workspace.example/custom/api/pl:frontline',
  ],
])(
  'production API base %s uses the existing Frontline gateway proxy',
  (apiUrl, expected) => {
    expect(getTelegramDefaultServerAddress(apiUrl)).toBe(expected);
    expect(getTelegramWebhookUrl(expected, 'saved-bot')).toBe(
      `${expected}/telegram/receive/saved-bot`,
    );
  },
);

test.each([
  'http://localhost:4000',
  'https://localhost:4000',
  'https://tenant.localhost',
  'https://frontline.local',
  'https://127.0.0.1',
  'https://[::1]',
  'https://10.0.0.2',
  'https://192.168.1.4',
  'https://172.16.0.4',
  'https://169.254.1.4',
  'http://workspace.example/gateway',
  'https://user:password@workspace.example/gateway',
  'https://workspace.example/gateway?token=secret',
  '',
])(
  'API base %s requires an explicit public address instead of an unusable automatic callback',
  (apiUrl) => {
    expect(getTelegramDefaultServerAddress(apiUrl)).toBeUndefined();
  },
);

test('a new bot uses the same generated webhook path for a host with or without a trailing slash', () => {
  for (const address of [
    'https://frontline.example',
    ' https://frontline.example/ ',
  ]) {
    expect(getTelegramWebhookUrl(address, 'saved-bot')).toBe(
      'https://frontline.example/telegram/receive/saved-bot',
    );
  }
});

test('editing a registered webhook preserves its reverse-proxy prefix without duplicating the bot path', () => {
  const existing = 'https://example.com/frontline/telegram/receive/saved-bot';
  expect(getTelegramServerAddress(existing)).toBe(
    'https://example.com/frontline',
  );
  expect(getTelegramWebhookUrl(existing, 'saved-bot')).toBe(existing);
  expect(
    getTelegramWebhookUrl('https://example.com/frontline/', 'saved-bot'),
  ).toBe(existing);
});

test('pasting another bot callback generates the selected bot callback', () => {
  expect(
    getTelegramWebhookUrl(
      'https://example.com/telegram/receive/old-bot',
      'new-bot',
    ),
  ).toBe('https://example.com/telegram/receive/new-bot');
});

test('invalid callback addresses are rejected before token and webhook mutations can run', () => {
  for (const address of [
    '',
    'not-a-url',
    'http://example.com',
    'https://user:pass@example.com',
    'https://example.com/?token=secret',
    'https://example.com/#fragment',
  ]) {
    expect(getTelegramServerAddress(address)).toBeUndefined();
    expect(getTelegramWebhookUrl(address, 'saved-bot')).toBeUndefined();
  }
});

test('preserves long interior path separators and trims only trailing separators', () => {
  const base = `https://example.com/proxy${'/'.repeat(100_000)}gateway`;
  expect(getTelegramServerAddress(`${base}///`)).toBe(base);
});

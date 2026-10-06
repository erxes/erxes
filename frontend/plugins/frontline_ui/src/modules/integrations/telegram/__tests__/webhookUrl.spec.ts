import { getTelegramServerAddress, getTelegramWebhookUrl } from '../webhookUrl';

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

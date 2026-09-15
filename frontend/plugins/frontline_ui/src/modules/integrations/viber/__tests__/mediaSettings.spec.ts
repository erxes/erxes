import { test } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';
import {
  parseViberMediaHostnames,
  viberMediaSettingsSchema,
} from '../mediaSettings';

test('the settings form accepts empty policy and normalizes line/comma-separated exact hosts', () => {
  strictEqual(
    viberMediaSettingsSchema.safeParse({ hostnames: '' }).success,
    true,
  );
  const text = ' CDN.EXAMPLE.COM, cdn.example.com\nfiles.example.com\n';
  strictEqual(
    viberMediaSettingsSchema.safeParse({ hostnames: text }).success,
    true,
  );
  deepStrictEqual(parseViberMediaHostnames(text), [
    'cdn.example.com',
    'files.example.com',
  ]);
});

test('the settings form rejects unsafe shapes and bounds the policy size', () => {
  for (const hostnames of [
    '*.viber.com',
    'https://media.example.com',
    '127.0.0.1',
    'localhost',
    'host.local',
    'host.internal',
    '[::1]',
    'media.example.com:443',
    'media.example.com/path',
    'media.example.com.',
    Array.from({ length: 33 }, (_, i) => `host-${i}.example.com`).join('\n'),
    'a'.repeat(8193),
  ]) {
    strictEqual(
      viberMediaSettingsSchema.safeParse({ hostnames }).success,
      false,
      hostnames.slice(0, 50),
    );
  }
});

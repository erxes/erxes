import { test } from 'node:test';
import { deepStrictEqual, throws } from 'node:assert';
import { normalizeViberMediaHostnames } from '../mediaHostnames';

test('media policy normalizes exact names and does not invent default hosts', () => {
  deepStrictEqual(normalizeViberMediaHostnames([]), []);
  deepStrictEqual(
    normalizeViberMediaHostnames([' CDN.EXAMPLE.COM ', 'cdn.example.com']),
    ['cdn.example.com'],
  );
});

test('media policy rejects URLs, wildcard matches, IP literals, local names and malformed input', () => {
  for (const value of [
    null,
    {},
    'media.example.com',
    [''],
    [12],
    ['https://media.example.com'],
    ['*.example.com'],
    ['127.0.0.1'],
    ['169.254.169.254'],
    ['[::1]'],
    ['localhost'],
    ['host.local'],
    ['host.internal'],
    ['host.localhost'],
    ['host.arpa'],
    ['media.example.com:443'],
    ['user@media.example.com'],
    ['media.example.com/'],
    ['media.example.com.'],
    ['media..example.com'],
    ['-media.example.com'],
    ['m'.repeat(64) + '.com'],
    ['a'.repeat(63) + ('.' + 'b'.repeat(63)).repeat(3)],
    Array.from({ length: 33 }, (_, i) => `media-${i}.example.com`),
  ]) {
    throws(() => normalizeViberMediaHostnames(value));
  }
});

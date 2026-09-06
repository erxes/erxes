import { test } from 'node:test';
import { strictEqual } from 'node:assert';
import { verifyViberSignature } from '../signature';

test('accepts a valid Viber signature', () => {
  const token = 'test-viber-token';
  const body = Buffer.from('{"event":"message","timestamp":1234567890}');
  const signature =
    'a6209a44d6cbb4781e2e3b647d83d9d983c2060d598ff4a5c2b152e92f19b932';

  const result = verifyViberSignature(token, body, signature);
  strictEqual(result, true);
});

test('rejects a modified body', () => {
  const token = 'test-viber-token';
  const body = Buffer.from('{"event":"message","timestamp":1234567891}');
  const signature =
    'a6209a44d6cbb4781e2e3b647d83d9d983c2060d598ff4a5c2b152e92f19b932';

  const result = verifyViberSignature(token, body, signature);
  strictEqual(result, false);
});

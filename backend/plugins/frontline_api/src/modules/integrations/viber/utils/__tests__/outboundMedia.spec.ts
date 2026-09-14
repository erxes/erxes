import { test } from 'node:test';
import { deepStrictEqual, ok, rejects, strictEqual } from 'node:assert';
import { Readable } from 'node:stream';
import { createTransportHarness } from '../../__tests__/transportHarness';

test('media signatures bind tenant, integration, message, part, filename and expiry without exposing credentials', (t) => {
  createTransportHarness(t);
  const media: typeof import('../outboundMedia') = require('../outboundMedia');
  const url = new URL(
    media.getViberOutboundMediaUrl(
      'test',
      'inbox',
      'secret-test-token',
      'message',
      0,
      'photo.png',
    ),
  );
  ok(!url.toString().includes('secret-test-token'));
  const expires = Number(url.searchParams.get('expires'));
  const signature = url.searchParams.get('signature') ?? '';
  strictEqual(
    media.verifyViberMediaLink(
      'test',
      'inbox',
      'secret-test-token',
      'message',
      0,
      'photo.png',
      expires,
      signature,
    ),
    true,
  );
  for (const args of [
    [
      'other-tenant',
      'inbox',
      'secret-test-token',
      'message',
      0,
      'photo.png',
      expires,
      signature,
    ],
    [
      'test',
      'other-inbox',
      'secret-test-token',
      'message',
      0,
      'photo.png',
      expires,
      signature,
    ],
    [
      'test',
      'inbox',
      'rotated-token',
      'message',
      0,
      'photo.png',
      expires,
      signature,
    ],
    [
      'test',
      'inbox',
      'secret-test-token',
      'other-message',
      0,
      'photo.png',
      expires,
      signature,
    ],
    [
      'test',
      'inbox',
      'secret-test-token',
      'message',
      1,
      'photo.png',
      expires,
      signature,
    ],
    [
      'test',
      'inbox',
      'secret-test-token',
      'message',
      0,
      'photo.html',
      expires,
      signature,
    ],
    [
      'test',
      'inbox',
      'secret-test-token',
      'message',
      0,
      'photo.png',
      1,
      signature,
    ],
    [
      'test',
      'inbox',
      'secret-test-token',
      'message',
      0,
      'photo.png',
      expires + 1,
      signature,
    ],
  ] satisfies Parameters<typeof media.verifyViberMediaLink>[])
    strictEqual(media.verifyViberMediaLink(...args), false);
});

test('storage reads enforce actual byte counts and close the stream on success and failure', async (t) => {
  const h = createTransportHarness(t);
  const {
    readViberStoredAttachment,
  }: typeof import('../outboundMedia') = require('../outboundMedia');
  const file = {
    name: 'report.pdf',
    url: 'report.pdf',
    type: 'application/pdf',
    size: 3,
  };
  deepStrictEqual(
    await readViberStoredAttachment('test', file),
    Buffer.from('abc'),
  );
  const stream = Readable.from([Buffer.from('too large')]);
  h.storage.mock.mockImplementation(async () => stream);
  await rejects(readViberStoredAttachment('test', file), /exceeds/);
  strictEqual(stream.destroyed, true);
  const short = Readable.from([Buffer.from('a')]);
  h.storage.mock.mockImplementation(async () => short);
  await rejects(readViberStoredAttachment('test', file), /does not match/);
  strictEqual(short.destroyed, true);
});

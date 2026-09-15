import { test } from 'node:test';
import { deepStrictEqual, strictEqual, throws } from 'node:assert';
import {
  buildViberSpecialMessage,
  createViberSpecialSchema,
  createViberTokenSchema,
  viberDeliveryLabel,
  viberIntegrationSchema,
  viberTokenSchema,
} from '../validation';

test('UI validators and delivery labels use the supplied translator', () => {
  const t = (key: string) => `translated:${key}`;
  const token = createViberTokenSchema(t).safeParse('');
  strictEqual(
    token.error?.issues[0].message,
    'translated:viber-token-required',
  );
  const special = createViberSpecialSchema(t).safeParse({
    ...base,
    type: 'sticker',
    stickerId: 'invalid',
  });
  strictEqual(
    special.error?.issues[0].message,
    'translated:viber-sticker-invalid',
  );
  strictEqual(
    viberDeliveryLabel(null, t),
    'translated:viber-delivery-unavailable',
  );
  strictEqual(
    viberDeliveryLabel({ _id: 'message', state: 'sent', parts: [] }, t),
    'translated:sent',
  );
});

test('create requires name, brand and exact token; edit may leave the token unchanged', () => {
  const input = { name: ' Support ', brandId: 'brand', token: 'exact-token' };
  deepStrictEqual(viberIntegrationSchema(false).parse(input), {
    ...input,
    name: 'Support',
  });
  for (const token of ['', ' ', ' token', 'token\n'])
    throws(() => viberTokenSchema.parse(token));
  throws(() => viberIntegrationSchema(false).parse({ ...input, brandId: '' }));
  throws(() => viberIntegrationSchema(false).parse({ ...input, name: ' ' }));
  strictEqual(
    viberIntegrationSchema(true).parse({ ...input, token: '' }).token,
    '',
  );
});

const base = {
  type: 'url' as const,
  url: '',
  lat: '',
  lon: '',
  name: '',
  phone: '',
  stickerId: '',
};

test('structured messages use the exact backend payload shape and validate coordinates including zero', () => {
  deepStrictEqual(
    buildViberSpecialMessage({ ...base, url: 'https://example.com' }),
    { type: 'url', media: 'https://example.com' },
  );
  deepStrictEqual(
    buildViberSpecialMessage({
      ...base,
      type: 'location',
      lat: '0',
      lon: '-180',
    }),
    { type: 'location', location: { lat: 0, lon: -180 } },
  );
  for (const lat of ['', 'NaN', 'Infinity', '90.1'])
    throws(() =>
      buildViberSpecialMessage({ ...base, type: 'location', lat, lon: '0' }),
    );
  for (const url of [
    'http://example.com',
    // eslint-disable-next-line no-script-url -- Deliberately rejected input, never navigated.
    'javascript:alert(1)',
    'https://token@example.com',
  ])
    throws(() => buildViberSpecialMessage({ ...base, url }));
  deepStrictEqual(
    buildViberSpecialMessage({
      ...base,
      type: 'contact',
      name: ' Jane ',
      phone: ' +97612345678 ',
    }),
    {
      type: 'contact',
      contact: { name: 'Jane', phone_number: '+97612345678' },
    },
  );
  deepStrictEqual(
    buildViberSpecialMessage({ ...base, type: 'sticker', stickerId: '00123' }),
    { type: 'sticker', sticker_id: '00123' },
  );
  throws(() =>
    buildViberSpecialMessage({ ...base, type: 'sticker', stickerId: '1.5' }),
  );
});

test('delivery labels never confuse provider acceptance with delivery or seen receipts', () => {
  const status = {
    _id: 'message',
    state: 'sent',
    parts: [{ index: 0, type: 'text', state: 'sent' }],
  };
  strictEqual(viberDeliveryLabel(status), 'Sent');
  strictEqual(
    viberDeliveryLabel({
      ...status,
      parts: [{ ...status.parts[0], seenAt: '2026-09-15' }],
    }),
    'Seen',
  );
  strictEqual(
    viberDeliveryLabel({
      ...status,
      parts: [{ ...status.parts[0], deliveredAt: '2026-09-15' }],
    }),
    'Delivered',
  );
  strictEqual(
    viberDeliveryLabel({ ...status, state: 'unknown' }),
    'Delivery unconfirmed',
  );
  strictEqual(viberDeliveryLabel(null), 'Delivery status unavailable');
});

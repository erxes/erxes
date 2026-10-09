import {
  normalizeErrorMessage,
  withStableFingerprint,
} from './sentryFingerprint';

const castEvent = (id: string) =>
  ({
    exception: {
      values: [
        {
          type: 'CastError',
          value: `Cast to ObjectId failed for value "${id}" (type string) at path "_id" for model "email_deliveries"`,
        },
      ],
    },
    tags: { 'graphql.field': 'emailDeliveryDetail', service: 'core' },
  }) as any;

describe('sentryFingerprint', () => {
  test('the same CastError with different ids gets ONE fingerprint', () => {
    const ids = [
      'wrp0k8luRGDDpeMRu2CEg',
      '-tLJJZkNK-jn4M3Lun46n',
      'yGbX35-H3kXNl_o8nEf2W',
      '45GQtwu_vXovHFx3jd3xr',
    ];
    const prints = ids.map((id) =>
      JSON.stringify(withStableFingerprint(castEvent(id)).fingerprint),
    );
    expect(new Set(prints).size).toBe(1);
    expect(JSON.parse(prints[0])).toEqual([
      'CastError',
      'Cast to ObjectId failed for value "<v>" (type string) at path "<v>" for model "<v>"',
      'graphql:emailDeliveryDetail',
      'core',
    ]);
  });

  test('different resolvers stay different issues', () => {
    const a = castEvent('wrp0k8luRGDDpeMRu2CEg');
    const b = castEvent('wrp0k8luRGDDpeMRu2CEg');
    b.tags['graphql.field'] = 'dealDetail';
    expect(withStableFingerprint(a).fingerprint).not.toEqual(
      withStableFingerprint(b).fingerprint,
    );
  });

  test('an explicit fingerprint is kept', () => {
    const e = castEvent('x');
    e.fingerprint = ['custom'];
    expect(withStableFingerprint(e).fingerprint).toEqual(['custom']);
  });

  test.each([
    [
      'Organization with subdomain = acme is not found',
      'Organization with subdomain = acme is not found',
    ],
    [
      'timeout after 30000ms on 507f1f77bcf86cd799439011',
      'timeout after 30000ms on <id>',
    ],
    [
      'request 3fa85f64-5717-4562-b3fc-2c963f66afa6 failed',
      'request <id> failed',
    ],
    ['user mFQSnGxoA3izrxMkE has no access', 'user <id> has no access'],
    ['sent to ops@erxes.io 3 times', 'sent to <email> <n> times'],
    ['Unexpected end of JSON input', 'Unexpected end of JSON input'],
  ])('normalizes "%s"', (input, expected) => {
    expect(normalizeErrorMessage(input)).toBe(expected);
  });
});

import {
  containsCredentialTraffic,
  isCredentialField,
} from './credential-privacy';

describe('credential telemetry boundary', () => {
  it('recognizes fields independently of operation names and aliases', () => {
    expect(isCredentialField('credentialsGrantCreate')).toBe(true);
    expect(
      containsCredentialTraffic({
        data: {
          query:
            'mutation Ordinary { alias: credentialsCreate(input: {}) { _id } }',
        },
      }),
    ).toBe(true);
    expect(
      containsCredentialTraffic(
        'fragment F on Query { credentialsList { _id } }',
      ),
    ).toBe(true);
    expect(containsCredentialTraffic('/pl:core/credentials/consume')).toBe(
      true,
    );
  });

  it('drops telemetry with credentials nested in spans and breadcrumbs', () => {
    expect(
      containsCredentialTraffic({
        spans: [
          { data: { 'graphql.document': 'mutation { credentialsUpdate }' } },
        ],
      }),
    ).toBe(true);
    expect(
      containsCredentialTraffic({
        breadcrumbs: [
          { data: { url: 'https://example.invalid/credentials/consume' } },
        ],
      }),
    ).toBe(true);
  });

  it('does not change existing integration operations and handles cycles', () => {
    expect(isCredentialField('configsEdit')).toBe(false);
    expect(
      containsCredentialTraffic({ query: 'mutation { configsEdit }' }),
    ).toBe(false);
    const cycle: { self?: unknown } = {};
    cycle.self = cycle;
    expect(containsCredentialTraffic(cycle)).toBe(false);
  });
});

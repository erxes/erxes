import {
  fingerprintOf,
  normalizeMessage,
  shouldReport,
  toFailures,
} from './sentryApollo';

describe('sentryApollo', () => {
  test('a query rejected by the gateway (400 validation) is reported', () => {
    const f = toFailures({
      operationName: 'SalesStages',
      graphQLErrors: [
        {
          message: 'Unknown argument "isNotLost" on field "Query.salesStages".',
          extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
        },
      ],
      networkError: {
        statusCode: 400,
        message: 'Response not successful: Received status code 400',
      },
    });
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({
      operation: 'SalesStages',
      kind: 'graphql',
      code: 'GRAPHQL_VALIDATION_FAILED',
    });
  });

  test('server errors without GraphQL errors are reported as network failures', () => {
    expect(
      toFailures({
        operationName: 'Deals',
        networkError: { statusCode: 502, message: 'Bad Gateway' },
      }),
    ).toEqual([
      {
        operation: 'Deals',
        kind: 'network',
        message: 'Bad Gateway',
        status: 502,
      },
    ]);
  });

  test.each([
    ['Login required', undefined],
    ['Permission required', undefined],
    ['Name is required', undefined],
    ['Email already exists', undefined],
    ['anything', 'UNAUTHENTICATED'],
    ['anything', 'BAD_USER_INPUT'],
  ])('expected outcome "%s" (%s) is NOT reported', (message, code) => {
    expect(
      toFailures({
        operationName: 'X',
        graphQLErrors: [{ message, extensions: code ? { code } : {} }],
      }),
    ).toEqual([]);
  });

  test('aborted requests and 401/403 responses are not reported', () => {
    expect(
      toFailures({ networkError: { message: 'The operation was aborted' } }),
    ).toEqual([]);
    expect(
      toFailures({
        networkError: { statusCode: 401, message: 'Unauthorized' },
      }),
    ).toEqual([]);
  });

  test('the same bug with different ids gets one fingerprint', () => {
    const a = fingerprintOf({
      operation: 'EmailDeliveryDetail',
      kind: 'graphql',
      message: 'Cast to ObjectId failed for value "wrp0k8luRGDDpeMRu2CEg"',
    });
    const b = fingerprintOf({
      operation: 'EmailDeliveryDetail',
      kind: 'graphql',
      message: 'Cast to ObjectId failed for value "45GQtwu_vXovHFx3jd3xr"',
    });
    expect(a).toEqual(b);
    expect(normalizeMessage('user mFQSnGxoA3izrxMkE failed 3 times')).toBe(
      'user <id> failed <n> times',
    );
  });

  test('throttle: once a minute per failure, 20 per 5 minutes per page', () => {
    const t0 = 1_000_000;
    expect(shouldReport('a', t0)).toBe(true);
    expect(shouldReport('a', t0 + 30e3)).toBe(false);
    expect(shouldReport('a', t0 + 61e3)).toBe(true);
    let sent = 2;
    for (let i = 0; i < 40; i++)
      if (shouldReport('k' + i, t0 + 62e3)) sent += 1;
    expect(sent).toBe(20);
  });
});

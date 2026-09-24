import {
  actionRetryDelayMs,
  AUTOMATION_RETRY_LIMITS,
  resolveActionBranchTarget,
  resolveActionErrorPolicy,
} from './actionErrorPolicy';

const policy = (errorPolicy: unknown) =>
  resolveActionErrorPolicy({ errorPolicy });

describe('resolveActionErrorPolicy', () => {
  it('defaults to today behaviour: no retry, the run fails', () => {
    expect(resolveActionErrorPolicy(undefined)).toEqual({
      attempts: 0,
      delaySeconds: AUTOMATION_RETRY_LIMITS.DEFAULT_DELAY_SECONDS,
      backoff: 'none',
      onError: 'fail',
    });

    expect(resolveActionErrorPolicy({ url: 'https://example.com' })).toEqual(
      resolveActionErrorPolicy(undefined),
    );
  });

  it('reads a configured policy', () => {
    expect(
      policy({
        retry: { attempts: 3, delaySeconds: 30, backoff: 'exponential' },
        onError: 'branch',
      }),
    ).toEqual({
      attempts: 3,
      delaySeconds: 30,
      backoff: 'exponential',
      onError: 'branch',
    });
  });

  it('never lets a hand-edited automation exceed the ceilings', () => {
    const { MAX_ATTEMPTS, MAX_DELAY_SECONDS, MIN_DELAY_SECONDS } =
      AUTOMATION_RETRY_LIMITS;

    expect(
      policy({ retry: { attempts: 99, delaySeconds: 999999 } }).attempts,
    ).toBe(MAX_ATTEMPTS);
    expect(
      policy({ retry: { attempts: 99, delaySeconds: 999999 } }).delaySeconds,
    ).toBe(MAX_DELAY_SECONDS);
    expect(policy({ retry: { attempts: -4, delaySeconds: 0 } })).toMatchObject({
      attempts: 0,
      delaySeconds: MIN_DELAY_SECONDS,
    });
    expect(policy({ retry: { backoff: 'fibonacci' } }).backoff).toBe('none');
    expect(policy({ onError: 'explode' }).onError).toBe('fail');
  });
});

describe('actionRetryDelayMs', () => {
  const base = { attempts: 3, delaySeconds: 60, onError: 'fail' } as const;

  it('waits the same amount every time without a backoff', () => {
    const flat = { ...base, backoff: 'none' } as const;

    expect([2, 3, 4].map((n) => actionRetryDelayMs(flat, n))).toEqual([
      60_000, 60_000, 60_000,
    ]);
  });

  it('grows the wait with each further try', () => {
    const linear = { ...base, backoff: 'linear' } as const;
    const exponential = { ...base, backoff: 'exponential' } as const;

    expect([2, 3, 4].map((n) => actionRetryDelayMs(linear, n))).toEqual([
      60_000, 120_000, 180_000,
    ]);
    expect([2, 3, 4].map((n) => actionRetryDelayMs(exponential, n))).toEqual([
      60_000, 120_000, 240_000,
    ]);
  });

  it('caps a growing wait at the ceiling', () => {
    const exponential = {
      ...base,
      delaySeconds: 3000,
      backoff: 'exponential',
    } as const;

    expect(actionRetryDelayMs(exponential, 5)).toBe(
      AUTOMATION_RETRY_LIMITS.MAX_DELAY_SECONDS * 1000,
    );
  });
});

describe('resolveActionBranchTarget', () => {
  const branching = {
    nextActionId: 'plain-next',
    config: {
      errorPolicy: { onError: 'branch' },
      onSuccessActionId: 'happy',
      onErrorActionId: 'sad',
    },
  };

  it('reads the plain next action while the policy is off', () => {
    const action = { nextActionId: 'plain-next', config: {} };

    expect(resolveActionBranchTarget(action, 'success')).toBe('plain-next');
    expect(resolveActionBranchTarget(action, 'error')).toBeUndefined();
  });

  it('reads both named exits once the action branches', () => {
    expect(resolveActionBranchTarget(branching, 'success')).toBe('happy');
    expect(resolveActionBranchTarget(branching, 'error')).toBe('sad');
  });

  it('never falls back to the plain next action while branching', () => {
    const halfWired = {
      nextActionId: 'plain-next',
      config: { errorPolicy: { onError: 'branch' } },
    };

    expect(resolveActionBranchTarget(halfWired, 'success')).toBeUndefined();
    expect(resolveActionBranchTarget(halfWired, 'error')).toBeUndefined();
  });
});

import { createRequestContext } from './context';
import { LIMITS } from './limits';

describe('request record budget', () => {
  it('allows up to the limit and refuses beyond it', () => {
    const context = createRequestContext('tenant-a', { _id: 'user-1' } as never);

    expect(() => context.consumeRecords(LIMITS.records)).not.toThrow();
    expect(() => context.consumeRecords(1)).toThrow(
      `more than ${LIMITS.records} records`,
    );
  });

  it('keeps each request separate', () => {
    const first = createRequestContext('tenant-a', { _id: 'user-1' } as never);
    const second = createRequestContext('tenant-a', { _id: 'user-1' } as never);

    first.consumeRecords(LIMITS.records);

    expect(() => second.consumeRecords(LIMITS.records)).not.toThrow();
  });
});

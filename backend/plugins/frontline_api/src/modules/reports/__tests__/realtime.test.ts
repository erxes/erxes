import { graphqlPubsub } from 'erxes-api-shared/utils';
import { publishReportUpdate } from '@/reports/realtime';

jest.mock('erxes-api-shared/utils', () => ({
  graphqlPubsub: { publish: jest.fn() },
}));

const publish = jest.mocked(graphqlPubsub.publish);

beforeEach(() => {
  jest.useFakeTimers();
  publish.mockReset();
});

afterEach(() => jest.useRealTimers());

it('publishes the affected scopes only on the owning tenant topic', async () => {
  publish.mockResolvedValue(undefined);

  await publishReportUpdate('tenant-a', ['ticket', 'ticket']);

  expect(publish).toHaveBeenCalledWith('frontlineReportsChanged:tenant-a', {
    frontlineReportsChanged: { scopes: ['ticket'] },
  });
  expect(jest.getTimerCount()).toBe(0);
});

it('does not fail the completed write when Redis rejects', async () => {
  publish.mockRejectedValue(new Error('Redis unavailable'));

  await expect(
    publishReportUpdate('tenant-a', ['inbox']),
  ).resolves.toBeUndefined();
  expect(jest.getTimerCount()).toBe(0);
});

it('returns within one second even when Redis never settles', async () => {
  publish.mockImplementation(() => new Promise<void>(() => undefined));
  const completed = jest.fn();
  const result = publishReportUpdate('tenant-a', ['call']).then(completed);

  await jest.advanceTimersByTimeAsync(999);
  expect(completed).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(1);
  await result;

  expect(completed).toHaveBeenCalledTimes(1);
  expect(jest.getTimerCount()).toBe(0);
});

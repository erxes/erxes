import { isTicketStatusChanged } from '@/ticket/meta/automations/trigger/checkStatusChangedTrigger';

const target = { pipelineId: 'pipeline-1' };
const moved = (prev: string, current: string) => ({
  updated: { statusId: { prev, current } },
});

describe('isTicketStatusChanged', () => {
  it('needs the status to have moved', () => {
    expect(isTicketStatusChanged({ target, config: {} })).toBe(false);
    expect(
      isTicketStatusChanged({
        target,
        config: {},
        eventUpdateDescription: { updated: { name: { prev: 'a', current: 'b' } } },
      }),
    ).toBe(false);
    expect(
      isTicketStatusChanged({
        target,
        config: {},
        eventUpdateDescription: moved('s1', 's1'),
      }),
    ).toBe(false);
    expect(
      isTicketStatusChanged({
        target,
        config: {},
        eventUpdateDescription: moved('s1', 's2'),
      }),
    ).toBe(true);
  });

  it('keeps to the configured pipeline', () => {
    const eventUpdateDescription = moved('s1', 's2');

    expect(
      isTicketStatusChanged({
        target,
        config: { pipelineId: 'pipeline-2' },
        eventUpdateDescription,
      }),
    ).toBe(false);
    expect(
      isTicketStatusChanged({
        target,
        config: { pipelineId: 'pipeline-1' },
        eventUpdateDescription,
      }),
    ).toBe(true);
  });

  it('narrows to the chosen statuses when given', () => {
    expect(
      isTicketStatusChanged({
        target,
        config: { toStatusIds: ['s3'] },
        eventUpdateDescription: moved('s1', 's2'),
      }),
    ).toBe(false);
    expect(
      isTicketStatusChanged({
        target,
        config: { toStatusIds: ['s2', 's3'] },
        eventUpdateDescription: moved('s1', 's2'),
      }),
    ).toBe(true);
  });
});

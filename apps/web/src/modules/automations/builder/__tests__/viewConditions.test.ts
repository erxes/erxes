import { describe, expect, it } from 'vite-plus/test';
import { eventDataFields } from '../flowChecks';
import { conditionsFromView } from '../viewConditions';

describe('start from a saved view', () => {
  it('copies an all-of filter with the state its list shows', () => {
    expect(
      conditionsFromView({
        recordType: 'lead',
        filter: {
          match: 'all',
          rules: [
            { path: 'subject.leadStageId', op: 'in', value: ['Qualified'] },
            { path: 'subject.company.industry', op: 'eq', value: 'Mining' },
          ],
        },
      }),
    ).toEqual({
      match: 'all',
      rules: [
        { path: 'subject.state', op: 'eq', value: 'lead' },
        { path: 'subject.leadStageId', op: 'in', value: ['Qualified'] },
        { path: 'subject.company.industry', op: 'eq', value: 'Mining' },
      ],
    });
  });

  it('keeps an any-of filter as one group, so the state still applies to all of it', () => {
    const anyOf = {
      match: 'any' as const,
      rules: [
        { path: 'subject.firstName', op: 'eq' as const, value: 'Ann' },
        { path: 'subject.lastName', op: 'eq' as const, value: 'Keep' },
      ],
    };

    expect(conditionsFromView({ recordType: 'customer', filter: anyOf })).toEqual({
      match: 'all',
      rules: [{ path: 'subject.state', op: 'eq', value: 'customer' }, anyOf],
    });
  });

  it('copies a view with no filter as its state alone', () => {
    expect(conditionsFromView({ recordType: 'company_lead', filter: null })).toEqual({
      match: 'all',
      rules: [{ path: 'subject.state', op: 'eq', value: 'lead' }],
    });
  });
});

describe("an event's values in conditions", () => {
  it('names their records, so conditions pick a stage rather than type its id', () => {
    expect(
      eventDataFields({
        label: 'Deal moved',
        source: 'sales',
        fields: [
          { key: 'stageId', label: 'Stage', type: 'text', recordType: 'stage' },
          { key: 'amount', label: 'Amount', type: 'number' },
        ],
      }),
    ).toEqual([
      {
        path: 'event.payload.stageId',
        label: 'Stage',
        type: 'text',
        group: 'event',
        groupLabel: 'Deal moved',
        recordType: 'stage',
        source: 'sales',
      },
      {
        path: 'event.payload.amount',
        label: 'Amount',
        type: 'number',
        group: 'event',
        groupLabel: 'Deal moved',
        recordType: undefined,
        source: 'sales',
      },
    ]);
  });
});

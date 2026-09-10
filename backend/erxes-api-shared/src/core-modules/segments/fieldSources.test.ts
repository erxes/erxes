import { SegmentFieldMeta } from './fieldMeta';

const fields: Record<string, Record<string, SegmentFieldMeta[]>> = {
  sales: {
    'sales:sales.deals': [
      {
        key: 'name',
        label: 'Name',
        kind: 'projected',
        path: 'name',
        operators: [],
        input: 'text',
      },
      {
        key: 'stageProbability',
        label: 'Stage probability',
        kind: 'derived',
        operators: [],
        input: 'text',
        dependsOn: [
          { fields: ['stageId'] },
          {
            contentType: 'sales:sales.stages',
            fields: ['probability'],
            via: 'stageId',
          },
        ],
      },
      {
        key: 'pipelineId',
        label: 'Pipeline',
        kind: 'derived',
        operators: [],
        input: 'text',
        dependsOn: [
          { fields: ['stageId'] },
          {
            contentType: 'sales:sales.stages',
            fields: ['pipelineId'],
            via: 'stageId',
          },
        ],
      },
      {
        key: 'boardName',
        label: 'Board name',
        kind: 'derived',
        operators: [],
        input: 'text',
        dependsOn: [{ contentType: 'sales:sales.boards', fields: ['name'] }],
      },
    ],
  },
};

jest.mock('../../utils', () => ({
  getPlugins: async () => Object.keys(fields),
  getPlugin: async (name: string) => ({
    config: { meta: { segments: { segmentFields: fields[name] } } },
  }),
}));

const { gatherSegmentFieldSources } = require('./relationRegistry');

describe('gatherSegmentFieldSources', () => {
  it('files a field under every collection its value is read from', async () => {
    const { byField } = await gatherSegmentFieldSources();

    expect(byField.get('sales:sales.deals:stageProbability')).toEqual([
      'sales:sales.stages',
    ]);
    expect(byField.get('sales:sales.deals:boardName')).toEqual([
      'sales:sales.boards',
    ]);
  });

  it("leaves the subject's own fields out - their writes already announce them", async () => {
    const { byField, bySource } = await gatherSegmentFieldSources();

    expect(byField.has('sales:sales.deals:name')).toBe(false);
    expect(bySource.has('sales:sales.deals')).toBe(false);
  });

  it('collapses fields that arrive through the same path', async () => {
    const { bySource } = await gatherSegmentFieldSources();

    expect(bySource.get('sales:sales.stages')).toHaveLength(1);
  });

  it('names the path back only where the declaration gives one', async () => {
    const { bySource } = await gatherSegmentFieldSources();

    expect(bySource.get('sales:sales.stages')).toEqual([
      { subjectType: 'sales:sales.deals', via: 'stageId' },
    ]);

    expect(bySource.has('sales:sales.boards')).toBe(false);
  });
});

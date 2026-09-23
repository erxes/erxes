import {
  exportRuleToMongoQuery,
  getExportFilterRules,
  withExportFilters,
} from './exportFilters';

describe('export filters', () => {
  it('validates and combines independent ticket date rules', () => {
    const filters = {
      exportConditions: [
        {
          field: 'createdAt',
          operator: 'greaterThan',
          from: '2026-09-11T00:00:00.000Z',
        },
        {
          field: 'targetDate',
          operator: 'lessThan',
          to: '2026-10-01T00:00:00.000Z',
        },
      ],
    };

    expect(
      withExportFilters({ pipelineId: 'pipeline-1' }, filters, {
        createdAt: 'date',
        startDate: 'date',
        targetDate: 'date',
      }),
    ).toEqual({
      $and: [
        { pipelineId: 'pipeline-1' },
        { createdAt: { $gte: new Date('2026-09-11T00:00:00.000Z') } },
        { targetDate: { $lt: new Date('2026-10-01T00:00:00.000Z') } },
      ],
    });
  });

  it('escapes text as a literal and requires populated negative matches', () => {
    const query = exportRuleToMongoQuery({
      field: 'name',
      operator: 'notContain',
      value: 'a+b.*',
    }) as { name: { $not: RegExp; $exists: boolean; $nin: unknown[] } };

    expect(query.name.$not.source).toBe('a\\+b\\.\\*');
    expect(query.name.$not.flags).toContain('i');
    expect(query.name.$exists).toBe(true);
    expect(query.name.$nin).toEqual([null, '']);
  });

  it.each([
    ['equals', '^A\\+B$'],
    ['contains', 'A\\+B'],
  ])('builds a case-insensitive literal %s match', (operator, source) => {
    const query = exportRuleToMongoQuery({
      field: 'name',
      operator,
      value: 'A+B',
    }) as { name: RegExp };
    expect(query.name.source).toBe(source);
    expect(query.name.flags).toContain('i');
  });

  it.each(['notEqual', 'notContain'])(
    '%s excludes missing and empty fields',
    (operator) => {
      const query = exportRuleToMongoQuery({
        field: 'name',
        operator,
        value: 'value',
      }) as { name: { $exists: boolean; $nin: unknown[]; $not: RegExp } };
      expect(query.name.$exists).toBe(true);
      expect(query.name.$nin).toEqual([null, '']);
      expect(query.name.$not).toBeInstanceOf(RegExp);
    },
  );

  it('distinguishes set and unset text fields', () => {
    expect(
      exportRuleToMongoQuery({ field: 'name', operator: 'isSet' }),
    ).toEqual({ name: { $exists: true, $nin: [null, ''] } });
    expect(
      exportRuleToMongoQuery({ field: 'name', operator: 'notSet' }),
    ).toEqual({
      $or: [{ name: { $exists: false } }, { name: null }, { name: '' }],
    });
  });

  it('rejects unsupported, duplicate, and invalid date rules', () => {
    expect(() =>
      getExportFilterRules(
        {
          exportConditions: [
            { field: 'status', operator: 'equals', value: 'x' },
          ],
        },
        { name: 'text' },
      ),
    ).toThrow('Unsupported or duplicate export filter field');

    expect(() =>
      getExportFilterRules(
        {
          exportConditions: [
            { field: 'createdAt', operator: 'lessThan', to: 'invalid' },
          ],
        },
        { createdAt: 'date' },
      ),
    ).toThrow('valid ISO timestamp');

    expect(() =>
      getExportFilterRules(
        {
          exportConditions: [
            {
              field: 'createdAt',
              operator: 'lessThan',
              to: '2026-09-10T00:00:00.000Z',
            },
            {
              field: 'createdAt',
              operator: 'greaterThan',
              from: '2026-09-11T00:00:00.000Z',
            },
          ],
        },
        { createdAt: 'date' },
      ),
    ).toThrow('Unsupported or duplicate export filter field');
  });
});

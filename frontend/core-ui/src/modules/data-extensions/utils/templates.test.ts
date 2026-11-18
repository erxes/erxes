import { TEMPLATE_PACKS, packTemplate } from './templatePacks';
import { applyDataModelTemplate, buildDataModelTemplate, readDataModelTemplate } from './templates';

jest.mock('ui-modules', () => ({
  isComputedField: (field: { type: string }) => field.type === 'formula' || field.type === 'rollup',
}));

describe('data model templates', () => {
  it('applies objects, stored fields, relations, then computed fields', async () => {
    const calls: string[] = [];
    const template = packTemplate(TEMPLATE_PACKS.find((pack) => pack.id === 'school')!, 'mn');
    const result = await applyDataModelTemplate(template, {
      addObject: async (input) => calls.push(`object:${input.key}`),
      addField: async (input) => calls.push(`field:${input.key}`),
      addRelation: async (input) => calls.push(`relation:${input.key}`),
    });

    expect(calls[0]).toBe('object:course');
    expect(calls.indexOf('relation:students')).toBeLessThan(calls.indexOf('field:enrolledCount'));
    expect(calls[calls.length - 1]).toBe('field:enrolledCount');
    expect(result.failed).toEqual([]);
    expect(template.objects[0].pluralLabel).toBe('Хичээлүүд');
  });

  it('skips what already exists and reports real failures', async () => {
    const template = packTemplate(TEMPLATE_PACKS[0], 'en');
    const result = await applyDataModelTemplate(template, {
      addObject: async () => {
        throw new Error('An object with the key "property" already exists');
      },
      addField: async (input) => {
        if (input.key === 'price') throw new Error('Key "price" is already used by Properties');
        if (input.key === 'agent') throw new Error('Network down');
      },
      addRelation: async () => undefined,
    });

    expect(result.skipped).toEqual(expect.arrayContaining(['Properties', 'Viewings', 'custom:property · Price']));
    expect(result.failed).toEqual([{ item: 'custom:property · Agent', error: 'Network down' }]);
  });

  it('exports chosen record types and only portable relations', () => {
    const template = buildDataModelTemplate(
      ['custom:contract'],
      [{ _id: 'o1', key: 'contract', recordType: 'custom:contract', singularLabel: 'Contract', pluralLabel: 'Contracts', status: 'active' }],
      [
        { _id: 'f1', recordType: 'custom:contract', key: 'value', label: 'Value', type: 'currency', order: 0, status: 'active' },
        { _id: 'f2', recordType: 'custom:contract', key: 'company', label: 'Company', type: 'relation', order: 0, status: 'active', relation: { targetRecordType: 'core:company', kind: 'manyToOne', side: 'source', inverseFieldId: 'f3' } },
        { _id: 'f3', recordType: 'core:company', key: 'contracts', label: 'Contracts', type: 'relation', order: 0, status: 'active', relation: { targetRecordType: 'custom:contract', kind: 'manyToOne', side: 'inverse', inverseFieldId: 'f2' } },
        { _id: 'f4', recordType: 'custom:contract', key: 'other', label: 'Other', type: 'relation', order: 0, status: 'active', relation: { targetRecordType: 'custom:invoice', kind: 'manyToOne', side: 'source' } },
      ],
    );

    expect(template.objects.map((object) => object.key)).toEqual(['contract']);
    expect(template.fields.map((field) => field.key)).toEqual(['value']);
    expect(template.relations).toEqual([
      expect.objectContaining({ key: 'company', inverseKey: 'contracts', targetRecordType: 'core:company' }),
    ]);
    expect(readDataModelTemplate(JSON.stringify(template)).version).toBe(1);
    expect(() => readDataModelTemplate('{"version":2}')).toThrow('Not a data model template');
  });
});

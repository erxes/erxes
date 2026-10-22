import { print } from 'graphql';
import {
  buildRecordPatch,
  createRecordValuesSchema,
  formatRecordValue,
  getWritableFields,
  localDateTimeValue,
} from '../recordUtils';
import {
  createRecordDocuments,
  recordInputByName,
  recordFromWire,
} from '../recordDocuments';
import { dataModelFormSchema } from '../validation';
import { field, model, record } from './fixtures';

it.each(['Asset', '1asset', 'asset.name', '../companies', ''])(
  'rejects invalid model identity %s',
  (name) => {
    expect(
      dataModelFormSchema.safeParse({
        name,
        labelSingular: 'Asset',
        labelPlural: 'Assets',
        description: '',
      }).success,
    ).toBe(false);
  },
);

it('uses first-class field required flags and preserves false / zero', () => {
  const fields = [
    field({ _id: 'enabled', name: 'enabled', type: 'boolean', required: true }),
    field({ _id: 'cost', name: 'cost', type: 'number', required: true }),
  ];
  const schema = createRecordValuesSchema(
    fields,
    fields,
    undefined,
    () => null,
  );
  expect(
    schema.safeParse({ values: { enabled: false, cost: 0 } }).success,
  ).toBe(true);
  expect(schema.safeParse({ values: {} }).success).toBe(false);
});

it('sends only changed fields and maps immutable IDs to typed API names', () => {
  const fields = [
    field(),
    field({ _id: 'cost-id', name: 'purchasePrice', type: 'number' }),
  ];
  const patch = buildRecordPatch(
    fields,
    { title: '', 'cost-id': 0, history: 'keep' },
    new Set(['title', 'cost-id']),
  );
  expect(recordInputByName(patch, fields)).toEqual({
    title: null,
    purchasePrice: 0,
  });
});

it('builds real named field selections and typed inputs, not Properties or JSON operations', () => {
  const fields = [field({ _id: 'random-id', name: 'serialNumber' })];
  const documents = createRecordDocuments(model, fields);
  expect(print(documents.list)).toContain('dataModel_assetList');
  expect(print(documents.list)).toContain('serialNumber');
  expect(print(documents.create)).toContain('DataModel_assetCreateInput!');
  expect(print(documents.create)).not.toContain('propertiesData');
  expect(
    recordFromWire({ ...record, serialNumber: 'SN-1' }, fields).values,
  ).toEqual({ 'random-id': 'SN-1' });
});

it('excludes archived and unsupported fields from the editor', () => {
  expect(
    getWritableFields(model, [
      field(),
      field({ _id: 'old', archivedAt: '2026-10-22' }),
      field({ _id: 'file', type: 'file' }),
    ]).map((entry) => entry._id),
  ).toEqual(['title']);
});

it.each([null, '', ' ', []])('rejects empty required value %j', (value) => {
  const fields = [field({ required: true })];
  expect(
    createRecordValuesSchema(fields, fields, undefined, () => null).safeParse({
      values: { title: value },
    }).success,
  ).toBe(false);
});

it('formats false and zero distinctly from missing values', () => {
  expect(formatRecordValue(field({ type: 'boolean' }), false)).toBe('No');
  expect(formatRecordValue(field({ type: 'number' }), 0)).toBe('0');
  expect(formatRecordValue(field(), null)).toBe('—');
});

it('preserves ISO instants in local date controls', () => {
  const iso = '2026-10-22T12:34:56Z';
  expect(new Date(localDateTimeValue(iso)).getTime()).toBe(
    new Date(iso).getTime(),
  );
});

it('treats required multi-object links as one choice across all destinations', async () => {
  const first = field({
    _id: 'toBuilding',
    name: 'related_building',
    type: 'relation',
    required: true,
    relation: {
      targetModelId: 'building',
      multiple: false,
      inverseFieldId: 'inverse-a',
      isInverse: false,
      morphId: 'group',
      morphName: 'related',
      morphSize: 2,
    },
  });
  const second = {
    ...first,
    _id: 'toProject',
    name: 'related_project',
    relation: {
      ...first.relation,
      targetModelId: 'project',
      multiple: false,
      inverseFieldId: 'inverse-b',
      isInverse: false,
    },
  };
  const definitions = [first, second];
  const schema = createRecordValuesSchema(
    definitions,
    definitions,
    undefined,
    () => null,
  );
  expect(
    schema.safeParse({ values: { toBuilding: 'building-a' } }).success,
  ).toBe(true);
  expect(schema.safeParse({ values: {} }).success).toBe(false);
  expect(
    schema.safeParse({
      values: { toBuilding: 'building-a', toProject: 'project-a' },
    }).success,
  ).toBe(false);
});

import { IDataExtensionField } from './types';
import { getRecordTypesSharingStorage } from './recordTypes';
import {
  buildDataExtensionPatch,
  DataExtensionValidationError,
  pickDataExtensionValues,
  validateDataExtensionFieldCreate,
  validateDataExtensionFieldEdit,
  validateDataExtensionRelationCreate,
} from './validation';

const field = (
  key: string,
  type: IDataExtensionField['type'],
  options?: IDataExtensionField['options'],
): IDataExtensionField => ({
  recordType: 'core:company',
  key,
  label: key,
  type,
  options,
  order: 0,
  status: 'active',
});

describe('validateDataExtensionFieldCreate', () => {
  it('normalises a valid definition', () => {
    expect(
      validateDataExtensionFieldCreate({
        recordType: 'core:company',
        key: 'accountReference',
        label: '  Account reference ',
        type: 'text',
      }),
    ).toEqual({
      recordType: 'core:company',
      key: 'accountReference',
      label: 'Account reference',
      description: undefined,
      type: 'text',
      order: 0,
    });
  });

  it.each(['Account', '1abc', 'a.b', 'a$b', '_id', 'a-b', 'x'.repeat(64)])(
    'rejects key %s',
    (key) => {
      expect(() =>
        validateDataExtensionFieldCreate({
          recordType: 'core:company',
          key,
          label: 'Label',
          type: 'text',
        }),
      ).toThrow(DataExtensionValidationError);
    },
  );

  it('rejects reserved keys, unknown record types and types', () => {
    const base = { recordType: 'core:company', label: 'L', type: 'text' };

    expect(() =>
      validateDataExtensionFieldCreate({ ...base, key: 'constructor' }),
    ).toThrow('reserved');
    expect(() =>
      validateDataExtensionFieldCreate({
        ...base,
        key: 'a',
        recordType: 'loyalty:voucher',
      }),
    ).toThrow('Unsupported record type');
    expect(() =>
      validateDataExtensionFieldCreate({ ...base, key: 'a', type: 'gauge' }),
    ).toThrow('Unsupported field type');
  });

  it('requires unique options for select fields only', () => {
    const base = { recordType: 'core:company', key: 'tier', label: 'Tier' };

    expect(() =>
      validateDataExtensionFieldCreate({ ...base, type: 'select' }),
    ).toThrow('at least one option');
    expect(() =>
      validateDataExtensionFieldCreate({
        ...base,
        type: 'select',
        options: [
          { value: 'a', label: 'A' },
          { value: 'a', label: 'B' },
        ],
      }),
    ).toThrow('Duplicate option');
    expect(() =>
      validateDataExtensionFieldCreate({
        ...base,
        type: 'text',
        options: [{ value: 'a', label: 'A' }],
      }),
    ).toThrow('Only select fields');
  });
});

describe('validateDataExtensionFieldEdit', () => {
  const existing = field('tier', 'select', [
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
  ]);

  it('allows relabelling and adding options', () => {
    expect(
      validateDataExtensionFieldEdit(existing, {
        options: [
          { value: 'gold', label: 'Gold tier' },
          { value: 'silver', label: 'Silver' },
          { value: 'bronze', label: 'Bronze' },
        ],
      }).options,
    ).toHaveLength(3);
  });

  it('refuses to remove an option stored values may use', () => {
    expect(() =>
      validateDataExtensionFieldEdit(existing, {
        options: [{ value: 'gold', label: 'Gold' }],
      }),
    ).toThrow('Options cannot be removed: silver');
  });
});

describe('buildDataExtensionPatch', () => {
  const fields = [
    field('reference', 'text'),
    field('score', 'number'),
    field('vip', 'boolean'),
    field('dueAt', 'date'),
    field('tier', 'select', [{ value: 'gold', label: 'Gold' }]),
    field('tags', 'multiSelect', [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]),
    field('email', 'email'),
    field('site', 'url'),
  ];

  it('sets supplied keys, clears nulls and ignores omitted keys', () => {
    const patch = buildDataExtensionPatch(fields, {
      reference: 'ACC-1',
      score: 4.5,
      vip: false,
      dueAt: '2027-06-01T00:00:00.000Z',
      tier: null,
      tags: ['a', 'a', 'b'],
    });

    expect(patch.$set).toEqual({
      'dataExtensions.reference': 'ACC-1',
      'dataExtensions.score': 4.5,
      'dataExtensions.vip': false,
      'dataExtensions.dueAt': new Date('2027-06-01T00:00:00.000Z'),
      'dataExtensions.tags': ['a', 'b'],
    });
    expect(patch.$unset).toEqual({ 'dataExtensions.tier': '' });
  });

  it.each([
    [{ unknown: 1 }, 'Unknown or inactive field'],
    [{ score: '4' }, 'finite number'],
    [{ score: Number.NaN }, 'finite number'],
    [{ vip: 'yes' }, 'boolean'],
    [{ dueAt: 'not a date' }, 'ISO date'],
    [{ tier: 'platinum' }, 'one of its options'],
    [{ tags: ['c'] }, 'only contain its options'],
    [{ email: 'nope' }, 'email'],
    [{ site: 'javascript:alert(1)' }, 'http(s) URL'],
    [{ reference: 'x'.repeat(2001) }, 'at most 2000'],
    [{ reference: { $gt: '' } }, 'must be a string'],
    [{}, 'Nothing to update'],
  ])('rejects %j', (values, message) => {
    expect(() => buildDataExtensionPatch(fields, values)).toThrow(message);
  });
});

describe('pickDataExtensionValues', () => {
  it('returns only keys defined for the record type', () => {
    expect(
      pickDataExtensionValues({ reference: 'A', vendorRating: 5 }, [
        { key: 'reference' },
      ]),
    ).toEqual({ reference: 'A' });
    expect(pickDataExtensionValues(undefined, [{ key: 'a' }])).toEqual({});
  });
});

describe('getRecordTypesSharingStorage', () => {
  it('groups record types that write the same documents', () => {
    expect(getRecordTypesSharingStorage('core:lead').sort()).toEqual(
      ['core:client', 'core:customer', 'core:lead', 'core:vendor'].sort(),
    );
    expect(getRecordTypesSharingStorage('core:company').sort()).toEqual(
      ['core:client', 'core:company', 'core:vendor'].sort(),
    );
    expect(getRecordTypesSharingStorage('operation:task')).toEqual([
      'operation:task',
    ]);
  });
});

describe('relations', () => {
  const relationInput = {
    recordType: 'operation:task',
    key: 'account',
    label: 'Account',
    targetRecordType: 'core:company',
    kind: 'manyToOne',
    inverseKey: 'tasks',
    inverseLabel: 'Tasks',
  };

  it('stores has-many as belongs-to started from the other record type', () => {
    const { source, inverse } = validateDataExtensionRelationCreate({
      recordType: 'operation:project',
      key: 'teams',
      label: 'Teams',
      description: 'Teams working on it',
      targetRecordType: 'operation:team',
      kind: 'oneToMany',
      inverseKey: 'project',
      inverseLabel: 'Project',
    });

    expect(source).toMatchObject({
      recordType: 'operation:team',
      key: 'project',
      label: 'Project',
      relation: { targetRecordType: 'operation:project', kind: 'manyToOne', side: 'source' },
    });
    expect(source.description).toBeUndefined();
    expect(inverse).toMatchObject({
      recordType: 'operation:project',
      key: 'teams',
      label: 'Teams',
      description: 'Teams working on it',
      relation: { targetRecordType: 'operation:team', kind: 'manyToOne', side: 'inverse' },
    });
  });

  it('creates a source and an inverse pair', () => {
    const { source, inverse } = validateDataExtensionRelationCreate(relationInput);

    expect(source).toMatchObject({
      recordType: 'operation:task',
      key: 'account',
      type: 'relation',
      relation: { targetRecordType: 'core:company', kind: 'manyToOne', side: 'source' },
    });
    expect(inverse).toMatchObject({
      recordType: 'core:company',
      key: 'tasks',
      type: 'relation',
      relation: { targetRecordType: 'operation:task', kind: 'manyToOne', side: 'inverse' },
    });
  });

  it('rejects unknown kinds, targets and same-type key clashes', () => {
    expect(() =>
      validateDataExtensionRelationCreate({ ...relationInput, kind: 'cascade' }),
    ).toThrow('Unsupported relation kind');
    expect(() =>
      validateDataExtensionRelationCreate({ ...relationInput, targetRecordType: 'loyalty:voucher' }),
    ).toThrow('Unsupported target');
    expect(() =>
      validateDataExtensionRelationCreate({
        ...relationInput,
        targetRecordType: 'operation:task',
        inverseKey: 'account',
      }),
    ).toThrow('two different keys');
    expect(() =>
      validateDataExtensionFieldCreate({
        recordType: 'core:company',
        key: 'parent',
        label: 'Parent',
        type: 'relation',
      }),
    ).toThrow('relation API');
  });

  const source = (kind: 'manyToOne' | 'oneToOne' | 'manyToMany'): IDataExtensionField => ({
    ...field('link', 'relation'),
    relation: { targetRecordType: 'core:company', kind, side: 'source' },
  });
  const inverse: IDataExtensionField = {
    ...field('linkedFrom', 'relation'),
    relation: { targetRecordType: 'operation:task', kind: 'manyToOne', side: 'inverse' },
  };

  it('stores one id or a de-duplicated id list on the source', () => {
    expect(buildDataExtensionPatch([source('manyToOne')], { link: 'c1' }).$set).toEqual({
      'dataExtensions.link': 'c1',
    });
    expect(
      buildDataExtensionPatch([source('manyToMany')], { link: ['c1', 'c2', 'c1'] }).$set,
    ).toEqual({ 'dataExtensions.link': ['c1', 'c2'] });
    expect(buildDataExtensionPatch([source('oneToOne')], { link: null }).$unset).toEqual({
      'dataExtensions.link': '',
    });
  });

  it('rejects malformed ids and writes to the inverse side', () => {
    expect(() => buildDataExtensionPatch([source('manyToOne')], { link: ['c1'] })).toThrow(
      'record id',
    );
    expect(() => buildDataExtensionPatch([source('manyToMany')], { link: 'c1' })).toThrow(
      'list of record ids',
    );
    // The owner never stores the virtual side; the runtime writes it as links.
    expect(() => buildDataExtensionPatch([inverse], { linkedFrom: 'x' })).toThrow(
      'other side of a relation',
    );
  });
});

describe('one-to-one scope', () => {
  it('refuses one-to-one from a record type stored in several collections', () => {
    expect(() =>
      validateDataExtensionRelationCreate({
        recordType: 'core:vendor',
        key: 'account',
        label: 'Account',
        targetRecordType: 'core:company',
        kind: 'oneToOne',
        inverseKey: 'vendorOf',
        inverseLabel: 'Vendor of',
      }),
    ).toThrow('stored in several places');
  });
});

import {
  buildCustomDataExtensionRecordType,
  DATA_EXTENSION_RECORD_TYPES,
  findGeneratedNameClash,
  getAllDataExtensionRecordTypes,
  getDataExtensionRecordType,
  getDataExtensionStorageKeys,
  getRecordTypesSharingStorage,
  runWithDataExtensionRecordTypes,
} from './recordTypes';
import { IDataExtensionField } from './types';
import {
  buildDataExtensionCreateValues,
  validateDataExtensionFieldCreate,
  validateDataExtensionObjectCreate,
  validateDataExtensionObjectEdit,
} from './validation';

const contract = buildCustomDataExtensionRecordType({
  key: 'contract',
  singularLabel: 'Contract',
  pluralLabel: 'Contracts',
  icon: 'file-text',
});

describe('custom record types', () => {
  it('describe a core-owned record type in its own storage', () => {
    expect(contract).toMatchObject({
      recordType: 'custom:contract',
      owner: 'core',
      typeName: 'Contract',
      label: 'Contracts',
      singularLabel: 'Contract',
      custom: true,
      storages: ['custom:contract'],
      readAction: 'dataExtensionRecordsRead',
      updateAction: 'dataExtensionRecordsManage',
    });
    expect(contract.nativeFields.map((field) => field.name)).toEqual([
      '_id',
      'name',
      'createdBy',
      'createdAt',
      'updatedAt',
    ]);
  });

  it('are only visible inside the tenant scope that holds them', async () => {
    expect(getDataExtensionRecordType('custom:contract')).toBeUndefined();

    await runWithDataExtensionRecordTypes([contract], async () => {
      await Promise.resolve();
      expect(getDataExtensionRecordType('custom:contract')).toBe(contract);
      expect(getDataExtensionStorageKeys('custom:contract', 'value')).toEqual([
        'custom:contract:value',
      ]);
      expect(getRecordTypesSharingStorage('custom:contract')).toEqual([
        'custom:contract',
      ]);
      expect(getAllDataExtensionRecordTypes()).toHaveLength(
        DATA_EXTENSION_RECORD_TYPES.length + 1,
      );
      // Static record types resolve exactly as before.
      expect(getDataExtensionRecordType('core:company')?.typeName).toBe(
        'Company',
      );
    });

    expect(getDataExtensionRecordType('custom:contract')).toBeUndefined();
  });

  it('let fields and relations target custom objects inside the scope', () => {
    expect(() =>
      validateDataExtensionFieldCreate({
        recordType: 'custom:contract',
        key: 'value',
        label: 'Value',
        type: 'currency',
      }),
    ).toThrow('Unsupported record type');

    runWithDataExtensionRecordTypes([contract], () => {
      expect(
        validateDataExtensionFieldCreate({
          recordType: 'custom:contract',
          key: 'value',
          label: 'Value',
          type: 'currency',
        }).recordType,
      ).toBe('custom:contract');
    });
  });
});

describe('findGeneratedNameClash', () => {
  const others = [...DATA_EXTENSION_RECORD_TYPES, contract];
  const candidate = (key: string) =>
    buildCustomDataExtensionRecordType({
      key,
      singularLabel: 'A',
      pluralLabel: 'Bs',
    });

  it('accepts a key whose generated names are all free', () => {
    expect(findGeneratedNameClash(candidate('property'), others)).toBeUndefined();
  });

  it.each([
    ['company', 'Company'],
    ['companyMany', 'CompanyMany'],
    ['companyDataExtensions', 'CompanyDataExtensions'],
    ['query', 'Query'],
    ['jSON', 'JSON'],
    ['dataExtensionCurrency', 'DataExtensionCurrency'],
    ['operationTaskSearch', 'OperationTaskSearch'],
  ])('refuses %s, which would reuse %s', (key, name) => {
    expect(findGeneratedNameClash(candidate(key), others)).toBe(name);
  });
});

describe('object definitions', () => {
  it('normalise labels and fix the key format', () => {
    expect(
      validateDataExtensionObjectCreate({
        key: 'contract',
        singularLabel: ' Contract ',
        pluralLabel: 'Contracts',
        icon: 'file-text',
      }),
    ).toEqual({
      key: 'contract',
      singularLabel: 'Contract',
      pluralLabel: 'Contracts',
      description: undefined,
      icon: 'file-text',
    });

    for (const key of ['Contract', 'c', 'my-object', '1st']) {
      expect(() =>
        validateDataExtensionObjectCreate({
          key,
          singularLabel: 'A',
          pluralLabel: 'B',
        }),
      ).toThrow('Object key');
    }

    expect(() =>
      validateDataExtensionObjectCreate({
        key: 'deal',
        singularLabel: 'Deal',
        pluralLabel: 'deal',
      }),
    ).toThrow('must differ');
    expect(() =>
      validateDataExtensionObjectCreate({
        key: 'deal',
        singularLabel: 'Deal',
        pluralLabel: 'Deals',
        icon: 'rocket',
      }),
    ).toThrow('Unknown icon');
  });

  it('only edits labels, description and icon', () => {
    expect(
      validateDataExtensionObjectEdit(
        { singularLabel: 'Deal', pluralLabel: 'Deals' },
        { pluralLabel: 'All deals', icon: 'coin' },
      ),
    ).toEqual({ pluralLabel: 'All deals', icon: 'coin' });
  });
});

describe('buildDataExtensionCreateValues', () => {
  const field = (
    key: string,
    type: IDataExtensionField['type'],
    settings?: IDataExtensionField['settings'],
  ): IDataExtensionField => ({
    recordType: 'custom:contract',
    key,
    label: key,
    type,
    settings,
    order: 0,
    status: 'active',
  });
  const fields = [
    field('stage', 'text', { defaultValue: 'draft' }),
    field('value', 'number', { required: true, min: 0 }),
    field('note', 'text'),
  ];

  it('fills defaults, checks values and returns plain keys', () => {
    expect(buildDataExtensionCreateValues(fields, { value: 10 })).toEqual({
      stage: 'draft',
      value: 10,
    });
    expect(
      buildDataExtensionCreateValues(fields, { value: 1, stage: 'signed' }),
    ).toEqual({ value: 1, stage: 'signed' });
  });

  it('refuses a missing required value or an invalid one', () => {
    expect(() => buildDataExtensionCreateValues(fields, {})).toThrow(
      'value is required',
    );
    expect(() => buildDataExtensionCreateValues(fields, { value: -1 })).toThrow(
      'at least 0',
    );
    expect(() =>
      buildDataExtensionCreateValues(fields, { value: 1, unknown: 'x' }),
    ).toThrow('Unknown or inactive field');
  });
});

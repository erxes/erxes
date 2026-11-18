import { IDataExtensionField } from 'erxes-api-shared/core-modules';
import {
  applyAutomationOperation,
  coerceAutomationValue,
  dataExtensionRecordTypeOfModule,
  splitDataExtensionModifier,
} from './automations';

const field = (
  type: IDataExtensionField['type'],
  extra: Partial<IDataExtensionField> = {},
) =>
  ({
    key: 'value',
    label: 'Value',
    type,
    ...extra,
  } as IDataExtensionField);

describe('set-property on Data Extension values', () => {
  it('maps core modules to their record types', () => {
    expect(dataExtensionRecordTypeOfModule('core:contacts.customers')).toBe(
      'core:customer',
    );
    expect(dataExtensionRecordTypeOfModule('core:contacts.leads')).toBe(
      'core:lead',
    );
    expect(dataExtensionRecordTypeOfModule('core:organization.users')).toBe(
      'core:teamMember',
    );
    expect(dataExtensionRecordTypeOfModule('core:products.products')).toBe(
      undefined,
    );
  });

  it('separates extension values from the owner paths', () => {
    expect(
      splitDataExtensionModifier({
        $set: { firstName: 'Bat', 'dataExtensions.bloodType': 'O-' },
        $unset: { 'dataExtensions.note': '' },
      }),
    ).toEqual({
      native: { $set: { firstName: 'Bat' } },
      extension: [
        { operator: '$set', key: 'bloodType', value: 'O-' },
        { operator: '$unset', key: 'note', value: '' },
      ],
    });
  });

  it('turns placeholder text into stored values', () => {
    expect(coerceAutomationValue(field('number'), '42')).toBe(42);
    expect(coerceAutomationValue(field('number'), 'abc')).toBe('abc');
    expect(coerceAutomationValue(field('boolean'), 'true')).toBe(true);
    expect(
      coerceAutomationValue(
        field('currency', { settings: { currency: 'MNT' } }),
        '1500',
      ),
    ).toEqual({ amount: 1500, currency: 'MNT' });
    expect(coerceAutomationValue(field('multiSelect'), 'a, b,')).toEqual([
      'a',
      'b',
    ]);
    expect(coerceAutomationValue(field('member'), 'u1')).toBe('u1');
    expect(
      coerceAutomationValue(
        field('member', { settings: { multiple: true } }),
        'u1',
      ),
    ).toEqual(['u1']);
  });

  it('adds to and removes from lists against the current value', () => {
    const tags = field('multiSelect');

    expect(
      applyAutomationOperation(
        tags,
        { operator: '$addToSet', key: 'value', value: { $each: ['b', 'c'] } },
        ['a', 'b'],
      ),
    ).toEqual(['a', 'b', 'c']);
    expect(
      applyAutomationOperation(
        tags,
        { operator: '$pull', key: 'value', value: { $in: ['a'] } },
        ['a', 'b'],
      ),
    ).toEqual(['b']);
    expect(
      applyAutomationOperation(
        tags,
        { operator: '$unset', key: 'value', value: '' },
        ['a'],
      ),
    ).toBeNull();
  });

  it('refuses list operators on single values', () => {
    expect(() =>
      applyAutomationOperation(
        field('text'),
        { operator: '$push', key: 'value', value: 'x' },
        'a',
      ),
    ).toThrow('not a list');
  });
});

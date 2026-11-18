import { evaluateOwnedSegmentFields } from '../segments/evaluateOwned';
import { compileSegmentMongoFilter } from '../segments/mongoFilter';
import { SegmentOperator } from '../segments/operators';
import {
  dataExtensionSegmentNamespace,
  toDataExtensionSegmentFields,
} from './segments';
import { IDataExtensionField } from './types';

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

describe('Data Extension segment fields', () => {
  it('compares stored values on their dotted path', () => {
    expect(toDataExtensionSegmentFields(field('text'))).toMatchObject([
      {
        key: 'dataExtensions.value',
        path: 'dataExtensions.value',
        input: 'text',
      },
    ]);
    expect(toDataExtensionSegmentFields(field('rating'))[0].input).toBe(
      'number',
    );
    expect(toDataExtensionSegmentFields(field('dateTime'))[0].input).toBe(
      'date',
    );
    expect(toDataExtensionSegmentFields(field('boolean'))[0].input).toBe(
      'boolean',
    );
  });

  it('compares a currency by its amount and a select by its options', () => {
    expect(toDataExtensionSegmentFields(field('currency'))).toMatchObject([
      { key: 'dataExtensions.value.amount', input: 'number' },
    ]);
    expect(
      toDataExtensionSegmentFields(
        field('select', {
          options: [{ value: 'a', label: 'A', color: 'red' }],
        }),
      ),
    ).toMatchObject([
      {
        input: 'select',
        source: 'static',
        options: [{ value: 'a', label: 'A' }],
      },
    ]);
  });

  it('splits composite values into their parts and names the group', () => {
    const fields = toDataExtensionSegmentFields(
      field('fullName', { settings: { group: 'Contact' } }),
    );

    expect(fields.map(({ key, label }) => [key, label])).toEqual([
      ['dataExtensions.value.firstName', 'Contact / Value / First name'],
      ['dataExtensions.value.lastName', 'Contact / Value / Last name'],
    ]);
  });

  it('offers nothing for values a condition cannot name', () => {
    for (const type of [
      'formula',
      'rollup',
      'links',
      'files',
      'json',
      'relation',
    ] as const) {
      expect(toDataExtensionSegmentFields(field(type))).toEqual([]);
    }
  });

  it('compiles to a filter on the record namespace', () => {
    const { filter, unsupported } = compileSegmentMongoFilter(
      {
        kind: 'field',
        contentType: 'core:contacts.customers',
        fieldKey: 'dataExtensions.price.amount',
        operator: SegmentOperator.NumberGt,
        value: 100,
      },
      {
        fields: [],
        namespaces: [dataExtensionSegmentNamespace('core:customer')],
      },
    );

    expect(unsupported).toEqual([]);
    expect(Object.keys(filter)).toEqual(['dataExtensions.price.amount']);
  });

  it('reads plain and composite values from records', async () => {
    const result = await evaluateOwnedSegmentFields(
      {
        sourceFor: () => ({
          find: async () => [
            {
              _id: 'c1',
              dataExtensions: {
                bloodType: 'O-',
                price: { amount: 450, currency: 'MNT' },
              },
            },
          ],
        }),
        fields: {},
        namespaces: {
          'core:contacts.customers': [
            dataExtensionSegmentNamespace('core:customer'),
          ],
        },
      },
      {
        subjectType: 'core:contacts.customers',
        subjectIds: ['c1'],
        requests: [
          {
            kind: 'field',
            ref: 'a',
            contentType: 'core:contacts.customers',
            fieldKey: 'dataExtensions.bloodType',
          },
          {
            kind: 'field',
            ref: 'b',
            contentType: 'core:contacts.customers',
            fieldKey: 'dataExtensions.price.amount',
          },
        ],
      },
    );

    expect(result).toEqual({ values: { c1: { a: 'O-', b: 450 } } });
  });
});

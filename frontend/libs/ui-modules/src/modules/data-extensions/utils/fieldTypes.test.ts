import { formatDataExtensionValue, groupFields } from './fieldDisplay';
import { IDataExtensionField, IDataExtensionRecordType } from '../types';
import { buildRecordQuery } from './typedOperations';

jest.mock('erxes-ui', () => ({ REACT_APP_API_URL: 'http://api', cn: () => '' }));

const field = (
  key: string,
  type: IDataExtensionField['type'],
  extra: Partial<IDataExtensionField> = {},
): IDataExtensionField => ({
  _id: key,
  recordType: 'core:company',
  key,
  label: key,
  type,
  order: 0,
  status: 'active',
  ...extra,
});

const company: IDataExtensionRecordType = {
  recordType: 'core:company',
  label: 'Companies',
  typeName: 'Company',
  owner: 'core',
  contentTypes: ['core:company'],
  createMutations: [],
  fieldCount: 3,
};

describe('typed queries for new field types', () => {
  it('selects the parts of composite values and team members', () => {
    const query = buildRecordQuery(
      company,
      [
        field('price', 'currency'),
        field('office', 'address'),
        field('docs', 'files'),
        field('owner', 'member'),
        field('meta', 'json'),
      ],
      [company],
    );

    expect(query).toContain('price { amount currency }');
    expect(query).toContain(
      'office { street street2 city state postalCode country }',
    );
    expect(query).toContain('docs { url name type size }');
    expect(query).toContain('owner { _id fullName email }');
    expect(query).toMatch(/ meta[ }]/);
  });
});

describe('formatDataExtensionValue', () => {
  it('formats money, percents, ratings and names for one-line cells', () => {
    expect(
      formatDataExtensionValue(
        field('price', 'currency', { settings: { precision: 0 } }),
        { amount: 1500, currency: 'USD' },
        { locale: 'en-US' },
      ),
    ).toBe('$1,500');
    expect(
      formatDataExtensionValue(field('share', 'percent'), 12.5, {
        locale: 'en-US',
      }),
    ).toBe('12.5%');
    expect(
      formatDataExtensionValue(
        field('stars', 'rating', { settings: { scale: 3 } }),
        2,
      ),
    ).toBe('2/3');
    expect(
      formatDataExtensionValue(field('contact', 'fullName'), {
        firstName: 'Bat',
        lastName: 'Dorj',
      }),
    ).toBe('Bat Dorj');
    expect(
      formatDataExtensionValue(field('office', 'address'), {
        city: 'Ulaanbaatar',
        country: 'MN',
      }),
    ).toBe('Ulaanbaatar, MN');
  });

  it('shows option labels and linked names, never ids', () => {
    expect(
      formatDataExtensionValue(
        field('tier', 'select', {
          options: [{ value: 'gold', label: 'Gold' }],
        }),
        'gold',
      ),
    ).toBe('Gold');
    expect(
      formatDataExtensionValue(field('team', 'member'), ['u1'], {
        links: [{ _id: 'u1', name: 'Bat' }],
      }),
    ).toBe('Bat');
  });
});

describe('groupFields', () => {
  it('keeps ungrouped fields first, then sections in field order', () => {
    const groups = groupFields([
      field('a', 'text', { settings: { group: 'Contract' } }),
      field('b', 'text'),
      field('c', 'text', { settings: { group: 'Billing' } }),
      field('d', 'text', { settings: { group: 'Contract' } }),
    ]);

    expect(groups.map(({ group, items }) => [group, items.map((f) => f.key)])).toEqual([
      ['', ['b']],
      ['Contract', ['a', 'd']],
      ['Billing', ['c']],
    ]);
  });
});

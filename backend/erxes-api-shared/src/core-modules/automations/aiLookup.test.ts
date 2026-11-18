import {
  belongsToLookupCustomer,
  isPublicLookup,
  projectLookupRecord,
} from './aiLookup';

const target = {
  value: 'sales:pos.orders',
  label: 'POS order',
  lookupFields: [],
  output: {
    variables: [
      { key: 'number', label: 'Number' },
      { key: 'status', label: 'Status' },
    ],
  },
  lookup: {
    description: 'Order status',
    customerField: 'customerId',
    byFields: ['number'],
  },
};

const order = {
  _id: 'o1',
  number: '1042',
  status: 'delivery',
  customerId: 'c-102',
  internalNote: 'courier phone 9911…',
};

describe('projectLookupRecord', () => {
  it('keeps only the declared output', () => {
    expect(projectLookupRecord(target, order)).toEqual({
      number: '1042',
      status: 'delivery',
    });
  });

  it('passes nothing through when there is no record', () => {
    expect(projectLookupRecord(target, null)).toBeNull();
  });
});

describe('belongsToLookupCustomer', () => {
  it('accepts only the run customer', () => {
    expect(belongsToLookupCustomer(target, order, 'c-102')).toBe(true);
    expect(belongsToLookupCustomer(target, order, 'c-999')).toBe(false);
  });

  it('refuses without a customer or a lookup declaration', () => {
    expect(belongsToLookupCustomer(target, order, '')).toBe(false);
    expect(
      belongsToLookupCustomer({ ...target, lookup: undefined }, order, 'c-102'),
    ).toBe(false);
  });
});

describe('isPublicLookup', () => {
  it('is organization data without a customer field', () => {
    expect(isPublicLookup(target)).toBe(false);
    expect(
      isPublicLookup({
        ...target,
        lookup: { description: 'Stock', byFields: ['code'] },
      }),
    ).toBe(true);
    expect(isPublicLookup({ ...target, lookup: undefined })).toBe(false);
  });

  it('never matches an owner for organization data', () => {
    expect(
      belongsToLookupCustomer(
        { ...target, lookup: { description: 'Stock', byFields: ['code'] } },
        order,
        'c-102',
      ),
    ).toBe(false);
  });
});

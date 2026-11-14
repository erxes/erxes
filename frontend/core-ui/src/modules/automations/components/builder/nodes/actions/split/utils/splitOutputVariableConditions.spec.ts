import {
  flattenOutputVariables,
  normalizeOutputVariables,
  splitOperatorsOf,
  splitOperatorTakesValue,
} from './splitOutputVariableConditions';

describe('splitOutputVariableConditions', () => {
  it('flattens objects and object arrays into dotted leaves', () => {
    expect(
      flattenOutputVariables([
        { name: 'total', type: 'number' },
        {
          name: 'customer',
          type: 'object',
          children: [{ name: 'email', label: 'Email' }],
        },
        {
          name: 'items',
          type: 'array',
          arrayItemType: 'object',
          arrayItemSchema: [{ name: 'sku' }],
        },
        { name: '' },
      ]),
    ).toEqual([
      { name: 'total', label: 'total', type: 'number', options: undefined },
      {
        name: 'customer.email',
        label: 'customer.Email',
        type: 'string',
        options: undefined,
      },
      {
        name: 'items.sku',
        label: 'items.sku',
        type: 'string',
        options: undefined,
      },
    ]);
  });

  it('treats anything but a list as no variables', () => {
    expect(normalizeOutputVariables('x')).toEqual([]);
  });

  it('offers operators by type, text for unknown types', () => {
    expect(splitOperatorsOf('number')[0].value).toBe('numbere');
    expect(splitOperatorsOf('unknown')[0].value).toBe('e');
  });

  it('knows which operators take a value', () => {
    expect(splitOperatorTakesValue('e')).toBe(true);
    expect(splitOperatorTakesValue('ins')).toBe(false);
    expect(splitOperatorTakesValue(undefined)).toBe(false);
  });
});

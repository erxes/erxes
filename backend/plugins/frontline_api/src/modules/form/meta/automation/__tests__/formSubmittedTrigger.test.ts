import type { IModels } from '~/connectionResolvers';
import {
  getFormAnswerVariables,
  isFormSubmittedTriggerMatched,
} from '@/form/meta/automation/workers';
import type { TFormSubmittedTriggerTarget } from '@/form/meta/automation/types';

const target: TFormSubmittedTriggerTarget = {
  _id: 'group-1',
  formId: 'form-1',
  channelId: 'channel-1',
  customerId: 'customer-1',
  conversationId: null,
  fieldValues: {
    city: 'Ulaanbaatar',
    age: 30,
    topics: ['billing', 'refund'],
    note: '',
  },
};

describe('isFormSubmittedTriggerMatched', () => {
  it('requires the configured form', () => {
    expect(isFormSubmittedTriggerMatched(target, {})).toBe(false);
    expect(isFormSubmittedTriggerMatched(target, { formId: 'other' })).toBe(
      false,
    );
    expect(isFormSubmittedTriggerMatched(target, { formId: 'form-1' })).toBe(
      true,
    );
  });

  it('joins conditions with and by default', () => {
    const conditions = [
      { fieldId: 'city', operator: 'e', value: 'Ulaanbaatar' },
      { fieldId: 'age', operator: 'numberigt', value: '40' },
    ];

    expect(
      isFormSubmittedTriggerMatched(target, { formId: 'form-1', conditions }),
    ).toBe(false);
    expect(
      isFormSubmittedTriggerMatched(target, {
        formId: 'form-1',
        conjunction: 'or',
        conditions,
      }),
    ).toBe(true);
  });

  it('compares number values as text for equals', () => {
    expect(
      isFormSubmittedTriggerMatched(target, {
        formId: 'form-1',
        conditions: [{ fieldId: 'age', operator: 'e', value: '30' }],
      }),
    ).toBe(true);
  });

  it('matches any picked option, and negatives against every option', () => {
    const check = (operator: string, value: string) =>
      isFormSubmittedTriggerMatched(target, {
        formId: 'form-1',
        conditions: [{ fieldId: 'topics', operator, value }],
      });

    expect(check('e', 'refund')).toBe(true);
    expect(check('e', 'sales')).toBe(false);
    expect(check('dne', 'refund')).toBe(false);
    expect(check('dne', 'sales')).toBe(true);
  });

  it('tests presence on the whole value', () => {
    expect(
      isFormSubmittedTriggerMatched(target, {
        formId: 'form-1',
        conditions: [
          { fieldId: 'note', operator: 'ins' },
          { fieldId: 'topics', operator: 'is' },
        ],
      }),
    ).toBe(true);
  });
});

describe('getFormAnswerVariables', () => {
  const modelsWith = (fields: Record<string, unknown>[]) =>
    ({
      Fields: {
        find: jest.fn(() => ({
          sort: () => ({ lean: () => Promise.resolve(fields) }),
        })),
      },
    }) as unknown as IModels;

  it('lists each field under fieldValues with its type and options', async () => {
    const variables = await getFormAnswerVariables(
      modelsWith([
        { _id: 'f1', text: 'Phone', type: 'text' },
        { _id: 'f2', text: 'Age', type: 'text', validation: 'number' },
        { _id: 'f3', text: 'Topic', type: 'select', options: ['a', 'b'] },
      ]),
      'form-1',
    );

    expect(variables).toEqual([
      {
        key: 'fieldValues',
        label: 'Form answers',
        fields: [
          { key: 'f1', label: 'Phone', type: 'string' },
          { key: 'f2', label: 'Age', type: 'number' },
          {
            key: 'f3',
            label: 'Topic',
            type: 'string',
            options: [
              { label: 'a', value: 'a' },
              { label: 'b', value: 'b' },
            ],
          },
        ],
      },
    ]);
  });

  it('adds nothing for a form without fields', async () => {
    expect(await getFormAnswerVariables(modelsWith([]), 'form-1')).toEqual([]);
  });
});

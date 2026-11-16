import {
  readWorkflowForEach,
  validateWorkflowBindings,
} from './workflowValidation';

const workflow = (config: Record<string, unknown>) => ({
  id: 'w1',
  name: 'Per product',
  config,
});

describe('readWorkflowForEach', () => {
  it('is off without a list or an item input', () => {
    expect(readWorkflowForEach(undefined)).toBeNull();
    expect(
      readWorkflowForEach({ forEach: { items: ' ', itemInput: 'product' } }),
    ).toBeNull();
    expect(
      readWorkflowForEach({
        forEach: { items: '{{ actions.a.items }}', itemInput: '' },
      }),
    ).toBeNull();
  });

  it('continues past a failed item unless told to stop', () => {
    expect(
      readWorkflowForEach({
        forEach: { items: '{{ actions.a.items }}', itemInput: 'product' },
      }),
    ).toEqual({
      items: '{{ actions.a.items }}',
      itemInput: 'product',
      onItemError: 'continue',
    });
  });
});

describe('validateWorkflowBindings', () => {
  const actions = [{ id: 'a', type: 'webhook' }];

  it('accepts a complete for-each', () => {
    expect(
      validateWorkflowBindings(
        [
          workflow({
            inputs: { product: '' },
            forEach: { items: '{{ actions.a.items }}', itemInput: 'product' },
          }),
        ],
        actions,
      ),
    ).toEqual([]);
  });

  it('rejects an item input the workflow does not declare', () => {
    expect(
      validateWorkflowBindings(
        [
          workflow({
            inputs: {},
            forEach: { items: '{{ actions.a.items }}', itemInput: 'product' },
          }),
        ],
        actions,
      ),
    ).toHaveLength(1);
  });

  it('rejects a list that points at a missing action', () => {
    expect(
      validateWorkflowBindings(
        [
          workflow({
            inputs: { product: '' },
            forEach: {
              items: '{{ actions.gone.items }}',
              itemInput: 'product',
            },
          }),
        ],
        actions,
      ),
    ).toEqual([
      'Workflow "Per product": input "for-each list" references missing action "gone"',
    ]);
  });

  it('ignores the stale binding of the item input', () => {
    expect(
      validateWorkflowBindings(
        [
          workflow({
            inputs: { product: '{{ actions.gone.x }}' },
            forEach: { items: '{{ actions.a.items }}', itemInput: 'product' },
          }),
        ],
        actions,
      ),
    ).toEqual([]);
  });
});

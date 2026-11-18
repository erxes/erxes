import { workflowForEachError } from '@/automations/components/builder/hooks/useWorkflowForEach';

describe('workflowForEachError', () => {
  it('has nothing to say while for-each is off', () => {
    expect(workflowForEachError(undefined, [])).toBeNull();
  });

  it('asks for the list first, then the item input', () => {
    expect(
      workflowForEachError({ items: ' ', itemInput: 'product' }, ['product']),
    ).toBe('list-required');
    expect(
      workflowForEachError({ items: '{{ actions.a.items }}', itemInput: '' }, [
        'product',
      ]),
    ).toBe('item-input-required');
  });

  it('rejects an item input the workflow no longer declares', () => {
    expect(
      workflowForEachError(
        { items: '{{ actions.a.items }}', itemInput: 'removed' },
        ['product'],
      ),
    ).toBe('item-input-required');
  });

  it('accepts a complete for-each', () => {
    expect(
      workflowForEachError(
        { items: '{{ actions.a.items }}', itemInput: 'product' },
        ['product'],
      ),
    ).toBeNull();
  });
});

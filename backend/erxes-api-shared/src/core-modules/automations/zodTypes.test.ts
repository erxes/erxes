import { AutomationExecutionInput } from './zodTypes';

describe('AutomationExecutionInput', () => {
  it('keeps a workflow run inputs across the producer boundary', () => {
    const parsed = AutomationExecutionInput.parse({
      _id: 'run-1',
      automationId: 'a-1',
      triggerId: 't-1',
      triggerType: 'frontline:facebook.messages',
      targetId: 'm-1',
      target: {},
      status: 'active',
      description: '',
      workflowId: 'w-1',
      inputs: { items: '[{"code":"tv","count":1}]' },
    });

    // Without them a workflow step's `{{ input.* }}` resolves to nothing
    expect(parsed.inputs).toEqual({ items: '[{"code":"tv","count":1}]' });
    expect(parsed.workflowId).toBe('w-1');
  });
});

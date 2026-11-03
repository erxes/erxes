import { getAiAgentOutputVariables } from './aiAgentOutputVariables';

describe('getAiAgentOutputVariables', () => {
  it('offers what a replying agent captured, option values included', () => {
    expect(
      getAiAgentOutputVariables({
        goalType: 'generateText',
        captureFields: [
          {
            fieldName: 'priority',
            dataType: 'option',
            options: [{ value: '4' }, { value: '1' }],
          },
          { fieldName: 'budget', dataType: 'number' },
          { fieldName: 'attachmentIds', dataType: 'array' },
        ],
      }),
    ).toEqual([
      {
        name: 'attributes.priority',
        label: 'priority',
        type: 'string',
        options: [
          { label: '4', value: '4' },
          { label: '1', value: '1' },
        ],
      },
      { name: 'attributes.budget', label: 'budget', type: 'number' },
    ]);
  });

  it('offers the topic of a routing agent', () => {
    expect(
      getAiAgentOutputVariables({
        goalType: 'splitTopic',
        topics: [{ id: 'buy', topicName: 'Purchase' }],
      }),
    ).toEqual([
      {
        name: 'topicId',
        label: 'topic',
        type: 'string',
        options: [{ label: 'Purchase', value: 'buy' }],
      },
    ]);
  });
});

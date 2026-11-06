import { getAutomationNodeSchema } from '../automationAuthoring';

jest.mock('../../graphql/resolvers/utils/queriesUtils', () => ({
  getAutomationConstants: jest.fn(async () => ({
    triggersConst: [],
    actionsConst: [
      {
        type: 'outgoingWebhook',
        label: 'Outgoing webhook',
        configJsonSchema: {
          type: 'object',
          required: ['url', 'auth'],
          properties: {
            url: { type: 'string' },
            auth: { type: 'object', builderOnly: true },
            options: {
              type: 'object',
              properties: {
                proxy: {
                  type: 'object',
                  properties: {
                    host: { type: 'string' },
                    auth: { type: 'object', builderOnly: true },
                  },
                },
              },
            },
          },
        },
      },
    ],
  })),
}));

describe('getAutomationNodeSchema', () => {
  it('names builder-only fields at any depth instead of describing them', async () => {
    const { configJsonSchema, builderOnlyFields } =
      await getAutomationNodeSchema('outgoingWebhook');

    expect(builderOnlyFields).toEqual(['auth', 'options.proxy.auth']);
    expect(configJsonSchema).toEqual({
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string' },
        options: {
          type: 'object',
          properties: {
            proxy: { type: 'object', properties: { host: { type: 'string' } } },
          },
        },
      },
    });
  });
});

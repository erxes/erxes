import { getPlugin, sendCoreModuleProducer } from '../../utils';
import { resolveAutomationActionInputs } from './outputResolvers';

jest.mock('../../utils', () => ({
  getPlugin: jest.fn(),
  sendCoreModuleProducer: jest.fn(),
}));

const mockedGetPlugin = jest.mocked(getPlugin);
const mockedProducer = jest.mocked(sendCoreModuleProducer);

const pluginWith = (trigger: Record<string, unknown>) =>
  ({
    config: { meta: { automations: { constants: { triggers: [trigger] } } } },
  }) as unknown as Awaited<ReturnType<typeof getPlugin>>;

describe('resolveAutomationActionInputs', () => {
  beforeEach(() => {
    mockedGetPlugin.mockReset();
    mockedProducer.mockReset();
  });

  it('fills the inputs from the trigger output keys it declared', async () => {
    mockedGetPlugin.mockResolvedValue(
      pluginWith({
        type: 'sales:pos.orders',
        output: {
          variables: [
            { key: 'totalAmount', label: 'Total' },
            { key: 'paidAmount', label: 'Paid' },
          ],
          resolverKeys: ['paidAmount'],
        },
        actionInputs: {
          'loyalty:score.score.create': {
            totalAmount: 'totalAmount',
            paidAmount: 'paidAmount',
          },
        },
      }),
    );
    // Keys with a resolver are computed by the trigger's own plugin.
    mockedProducer.mockResolvedValue({ totalAmount: 1000, paidAmount: 800 });

    await expect(
      resolveAutomationActionInputs({
        subdomain: 'test',
        triggerType: 'sales:pos.orders',
        actionType: 'loyalty:score.score.create',
        target: { totalAmount: 1000 },
      }),
    ).resolves.toEqual({ totalAmount: 1000, paidAmount: 800 });
  });

  it('gives nothing when the trigger declares nothing for the action', async () => {
    mockedGetPlugin.mockResolvedValue(
      pluginWith({ type: 'core:contacts.customers' }),
    );

    await expect(
      resolveAutomationActionInputs({
        subdomain: 'test',
        triggerType: 'core:contacts.customers',
        actionType: 'loyalty:score.score.create',
        target: {},
      }),
    ).resolves.toBeUndefined();
    expect(mockedProducer).not.toHaveBeenCalled();
  });
});

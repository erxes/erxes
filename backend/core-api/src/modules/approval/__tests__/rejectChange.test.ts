import { ApprovalRequest } from 'erxes-api-shared/core-modules';
import { notifyRejectedChange } from '../rejectChange';

const mockSendCoreModuleProducer = jest.fn();

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils'),
  sendCoreModuleProducer: (...args: unknown[]) =>
    mockSendCoreModuleProducer(...args),
}));

const request = {
  _id: 'req-1',
  kind: 'change',
  contentType: 'core:automations.executions',
  contentId: 'exec-1',
  requesterId: 'owner-1',
  status: 'rejected',
  requiredApproverIds: ['manager-1'],
  decisions: [],
  createdAt: new Date(),
  change: {
    changeType: 'core:automations.approvalStep',
    payload: { executionId: 'exec-1', actionId: 'a1' },
    summary: 'Refund 50,000₮',
  },
} as unknown as ApprovalRequest;

beforeEach(() => {
  mockSendCoreModuleProducer.mockReset();
});

describe('notifyRejectedChange', () => {
  it('tells the plugin owning the change type who rejected it and why', async () => {
    await notifyRejectedChange('test', request, {
      rejecterId: 'manager-1',
      reason: 'Too much',
    });

    expect(mockSendCoreModuleProducer).toHaveBeenCalledWith({
      subdomain: 'test',
      moduleName: 'approval',
      pluginName: 'core',
      producerName: 'rejectChange',
      input: {
        requestId: 'req-1',
        changeType: 'core:automations.approvalStep',
        payload: { executionId: 'exec-1', actionId: 'a1' },
        contentType: 'core:automations.executions',
        contentId: 'exec-1',
        requesterId: 'owner-1',
        rejecterId: 'manager-1',
        reason: 'Too much',
      },
    });
  });

  it('does nothing for an access request', async () => {
    await notifyRejectedChange(
      'test',
      { ...request, change: undefined } as ApprovalRequest,
      {},
    );

    expect(mockSendCoreModuleProducer).not.toHaveBeenCalled();
  });

  it('keeps the rejection when the plugin fails', async () => {
    mockSendCoreModuleProducer.mockRejectedValue(new Error('offline'));
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      notifyRejectedChange('test', request, { reason: 'cancelled' }),
    ).resolves.toBeUndefined();

    spy.mockRestore();
  });
});

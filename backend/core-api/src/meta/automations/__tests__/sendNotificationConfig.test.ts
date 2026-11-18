import {
  approvalActionConfigSchema,
  sendNotificationActionConfigSchema,
} from 'erxes-api-shared/core-modules';
import {
  validateApprovalConfig,
  validateSendNotificationConfig,
} from '../configValidators';

const mockFind = jest.fn();

jest.mock('~/connectionResolvers', () => ({
  generateModels: async () => ({
    Users: { find: (...args: unknown[]) => ({ lean: () => mockFind(...args) }) },
  }),
}));

jest.mock('~/utils/email/senders', () => ({
  isSenderAllowed: jest.fn(),
  resolveAlignedFrom: jest.fn(),
}));

const validate = (config: Record<string, unknown>) =>
  validateSendNotificationConfig({ subdomain: 'test', config });

beforeEach(() => {
  mockFind.mockReset();
});

describe('sendNotificationActionConfigSchema', () => {
  it('needs recipients and a title', () => {
    expect(sendNotificationActionConfigSchema.safeParse({}).success).toBe(false);
    expect(
      sendNotificationActionConfigSchema.safeParse({
        userIds: '{{ trigger.assignedUserIds }}',
        title: 'New lead {{ trigger.name }}',
      }).success,
    ).toBe(true);
  });
});

describe('validateSendNotificationConfig', () => {
  it('names team members that do not exist', async () => {
    mockFind.mockResolvedValue([{ _id: 'u1' }]);

    await expect(validate({ userIds: 'u1, u2' })).resolves.toEqual([
      expect.objectContaining({
        path: 'config.userIds',
        malformed: true,
        message: 'Team member u2 does not exist',
      }),
    ]);
  });

  it('leaves placeholders to send time', async () => {
    await expect(
      validate({ userIds: '{{ trigger.assignedUserIds }}' }),
    ).resolves.toEqual([]);
    expect(mockFind).not.toHaveBeenCalled();
  });
});

describe('approvalActionConfigSchema', () => {
  it('needs approvers and a summary, and keeps both branches', () => {
    expect(approvalActionConfigSchema.safeParse({ summary: 'x' }).success).toBe(
      false,
    );
    expect(
      approvalActionConfigSchema.safeParse({
        approverIds: 'manager-1',
        summary: 'Refund {{ trigger.amount }}',
        timeoutHours: '24',
        approved: 'a2',
        rejected: 'a3',
      }).success,
    ).toBe(true);
  });
});

describe('validateApprovalConfig', () => {
  it('names approvers that do not exist', async () => {
    mockFind.mockResolvedValue([]);

    await expect(
      validateApprovalConfig({
        subdomain: 'test',
        config: { approverIds: 'ghost' },
      }),
    ).resolves.toEqual([
      expect.objectContaining({ path: 'config.approverIds', malformed: true }),
    ]);
  });
});

import { IModels } from '~/connectionResolvers';
import { checkCampaignDoc } from '../engage';

const mockIsSenderAllowed = jest.fn();

jest.mock('~/utils/email/senders', () => ({
  isSenderAllowed: (...args: unknown[]) => mockIsSenderAllowed(...args),
}));

jest.mock('../targeting', () => ({ customerTargetFilter: jest.fn() }));

jest.mock('../workflowAutomation', () => ({
  findCampaignAutomation: jest.fn(),
}));

const models = {} as IModels;

const emailCampaign = (email: Record<string, unknown>) =>
  ({
    method: 'email',
    targetIds: ['segment'],
    fromEmail: 'news@bank.mn',
    email: { content: '<p>Hi</p>', ...email },
  } as unknown as Parameters<typeof checkCampaignDoc>[1]);

beforeEach(() => {
  jest.resetAllMocks();

  mockIsSenderAllowed.mockResolvedValue(true);
});

describe('checkCampaignDoc', () => {
  it('lets an email go out without a reply-to', async () => {
    await expect(
      checkCampaignDoc(models, emailCampaign({})),
    ).resolves.toBeUndefined();
    expect(mockIsSenderAllowed).toHaveBeenCalledTimes(1);
  });

  it('checks a reply-to the way it checks the From', async () => {
    await expect(
      checkCampaignDoc(models, emailCampaign({ replyTo: 'info@bank.mn' })),
    ).resolves.toBeUndefined();
    expect(mockIsSenderAllowed).toHaveBeenCalledWith(
      models,
      'info@bank.mn',
      'broadcast',
    );
  });

  it('refuses a reply-to the workspace does not speak for', async () => {
    mockIsSenderAllowed.mockImplementation(
      async (_models: IModels, email: string) => email !== 'phish@gmail.com',
    );

    await expect(
      checkCampaignDoc(models, emailCampaign({ replyTo: 'phish@gmail.com' })),
    ).rejects.toThrow("can't be the reply-to");
  });
});

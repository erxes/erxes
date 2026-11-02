import { validateSendEmailSenders } from '../configValidators';

const mockIsSenderAllowed = jest.fn();
const mockResolveAlignedFrom = jest.fn();

jest.mock('~/connectionResolvers', () => ({
  generateModels: async () => ({}),
}));

jest.mock('~/utils/email/senders', () => ({
  isSenderAllowed: (...args: unknown[]) => mockIsSenderAllowed(...args),
  resolveAlignedFrom: (...args: unknown[]) => mockResolveAlignedFrom(...args),
}));

const validate = (config: Record<string, unknown>) =>
  validateSendEmailSenders({ subdomain: 'test', config });

beforeEach(() => {
  jest.resetAllMocks();

  mockIsSenderAllowed.mockResolvedValue(true);
  mockResolveAlignedFrom.mockResolvedValue(null);
});

describe('validateSendEmailSenders', () => {
  it('needs the confirmed address while the From is aligned', async () => {
    mockResolveAlignedFrom.mockResolvedValue('noreply@bank.mn');

    await expect(validate({ replyToEmail: 'sales@bank.mn' })).resolves.toEqual([
      expect.objectContaining({ path: 'config.fromEmailPlaceHolder' }),
    ]);
  });

  it('sends from a typed address without a reply-to', async () => {
    await expect(
      validate({ type: 'custom', fromEmailPlaceHolder: 'noreply@bank.mn' }),
    ).resolves.toEqual([]);
    expect(mockIsSenderAllowed).toHaveBeenCalledWith({}, 'noreply@bank.mn');
  });

  it('refuses a typed From the workspace cannot send as', async () => {
    mockIsSenderAllowed.mockResolvedValue(false);

    await expect(
      validate({ type: 'custom', fromEmailPlaceHolder: 'promo@gmail.com' }),
    ).resolves.toEqual([
      expect.objectContaining({
        path: 'config.fromEmailPlaceHolder',
        malformed: true,
      }),
    ]);
  });

  it('leaves a placeholder From to the send', async () => {
    await expect(
      validate({
        type: 'custom',
        fromEmailPlaceHolder: '{{ assignedUser.primaryEmail }}',
      }),
    ).resolves.toEqual([]);
    expect(mockIsSenderAllowed).not.toHaveBeenCalled();
  });

  it('checks a reply-to only when one is set', async () => {
    mockIsSenderAllowed.mockResolvedValue(false);

    await expect(validate({ type: 'default' })).resolves.toEqual([]);
    await expect(validate({ replyToEmail: 'x@gmail.com' })).resolves.toEqual([
      expect.objectContaining({ path: 'config.replyToEmail', malformed: true }),
    ]);
  });
});

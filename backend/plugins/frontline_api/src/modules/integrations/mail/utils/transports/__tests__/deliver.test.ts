import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { deliver } from '../deliver';
import type { IMailTransport, ISendMailInput } from '../types';

jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  sendTRPCMessage: jest.fn(),
}));
jest.mock('@/integrations/mail/debuggers', () => ({ debugError: jest.fn() }));
jest.mock('string-strip-html', () => ({ stripHtml: jest.fn() }));

const core = jest.mocked(sendTRPCMessage);
const send = jest.fn<ReturnType<IMailTransport['send']>, [ISendMailInput]>();
const transport: IMailTransport = {
  name: 'test',
  domain: 'example.com',
  provider: 'custom',
  send,
};
const input: ISendMailInput = {
  messageId: 'message',
  from: 'sender@example.com',
  replyTo: 'sender@example.com',
  to: ['known@example.com'],
  subject: 'Test',
  html: '<p>Test</p>',
};

describe('verified recipient delivery guard', () => {
  beforeEach(() => {
    core.mockReset();
    send.mockReset();
  });

  it.each(['to', 'cc', 'bcc'] as const)(
    'never hands off an unverified %s address',
    async (field) => {
      core.mockResolvedValue([
        { primaryEmail: 'known@example.com', emailValidationStatus: 'valid' },
      ]);
      await expect(
        deliver('tenant', transport, {
          ...input,
          [field]: ['unknown@example.com'],
        }),
      ).rejects.toMatchObject({ retryable: false });
      expect(send).not.toHaveBeenCalled();
      expect(core).toHaveBeenCalledTimes(1);
    },
  );

  it('does not send when verification cannot be read', async () => {
    core.mockRejectedValue(new Error('Core unavailable'));
    await expect(deliver('tenant', transport, input)).rejects.toThrow(
      'Core unavailable',
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('continues to block suppressed addresses even when verified', async () => {
    core
      .mockResolvedValueOnce([
        { primaryEmail: 'known@example.com', emailValidationStatus: 'valid' },
      ])
      .mockResolvedValueOnce({ emails: input.to });
    await expect(deliver('tenant', transport, input)).resolves.toMatchObject({
      delivered: [],
      bounced: input.to,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('hands verified recipients to the transport after suppression checks', async () => {
    core
      .mockResolvedValueOnce([
        { primaryEmail: 'known@example.com', emailValidationStatus: 'valid' },
      ])
      .mockResolvedValueOnce({ emails: [] })
      .mockResolvedValueOnce('log')
      .mockResolvedValueOnce(undefined);
    send.mockResolvedValue({ delivered: input.to, bounced: [], queued: [] });
    await expect(deliver('tenant', transport, input)).resolves.toMatchObject({
      delivered: input.to,
    });
    expect(send).toHaveBeenCalledWith(input);
  });
});

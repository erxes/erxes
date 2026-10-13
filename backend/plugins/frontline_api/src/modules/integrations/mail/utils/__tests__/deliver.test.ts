import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { deliver } from '../transports/deliver';
import type { IMailTransport, ISendMailInput } from '../transports/types';

jest.mock('string-strip-html', () => ({ stripHtml: jest.fn() }));

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

const blocked = jest.fn<Promise<string[]>, [string[], string]>();
const createLog = jest.fn().mockResolvedValue('delivery');
const updateLog = jest.fn().mockResolvedValue(undefined);

jest.mock('../emailPorts', () => ({
  MAIL_DELIVERY_SOURCE: 'frontline:mail',
  createSuppressionPort: () => ({ blocked }),
  createDeliveryLogPort: () => ({ create: createLog, update: updateLog }),
}));

const input: ISendMailInput = {
  messageId: 'message',
  from: 'sender@example.com',
  replyTo: 'sender@example.com',
  to: ['new-contact@example.net'],
  cc: ['cc@example.net'],
  bcc: ['bcc@example.net'],
  subject: 'Test',
  html: '<p>Test</p>',
};

const send = jest.fn<ReturnType<IMailTransport['send']>, [ISendMailInput]>();
const transport: IMailTransport = {
  name: 'Test transport',
  provider: 'custom',
  domain: 'example.com',
  send,
};

describe('mail delivery recipients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    blocked.mockResolvedValue([]);
    send.mockResolvedValue({ delivered: input.to, bounced: [], queued: [] });
  });

  it('hands manually entered recipients to the provider without checking contact verification', async () => {
    await deliver('tenant', transport, input);
    expect(sendTRPCMessage).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith(input);
    expect(blocked).toHaveBeenCalledWith(
      [...input.to, ...(input.cc ?? []), ...(input.bcc ?? [])],
      'frontline:mail',
    );
  });

  it('rejects malformed email addresses before provider handoff', async () => {
    await expect(
      deliver('tenant', transport, { ...input, to: ['invalid-address'] }),
    ).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });

  it('still excludes suppressed recipients from every recipient field', async () => {
    blocked.mockResolvedValue([...(input.cc ?? []), ...(input.bcc ?? [])]);
    await deliver('tenant', transport, input);
    expect(send).toHaveBeenCalledWith({ ...input, cc: [], bcc: [] });
  });
});

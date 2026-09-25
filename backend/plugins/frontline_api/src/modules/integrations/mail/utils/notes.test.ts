import { IModels } from '~/connectionResolvers';
import { mailTicketNote } from '@/integrations/mail/utils/notes';
import { findPipelineIntegration } from '@/integrations/mail/utils/pipeline';
import {
  resolveTicketRecipient,
  sendTicketMail,
} from '@/integrations/mail/utils/tickets';
import { assertSendableIntegration } from '@/integrations/mail/utils/transports/readiness';

jest.mock('@/integrations/mail/utils/pipeline', () => ({
  findPipelineIntegration: jest.fn(),
}));

jest.mock('@/integrations/mail/utils/tickets', () => ({
  resolveTicketRecipient: jest.fn(),
  sendTicketMail: jest.fn(),
}));

jest.mock('@/integrations/mail/utils/transports/readiness', () => ({
  assertSendableIntegration: jest.fn(),
}));

const ticket = { _id: 'ticket-1', name: 'Invoice', pipelineId: 'pipeline-1' };

const emptyQuery = () => ({
  sort: () => ({ lean: async () => null }),
});

const buildModels = (found: typeof ticket | null = ticket) =>
  ({
    Ticket: { findOne: jest.fn(async () => found) },
    MailMessages: { findOne: jest.fn(emptyQuery) },
  } as unknown as IModels);

const paragraph = JSON.stringify([
  { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
]);

describe('mailTicketNote', () => {
  beforeEach(() => {
    jest
      .mocked(findPipelineIntegration)
      .mockResolvedValue({ _id: 'integration-1' } as unknown as Awaited<
        ReturnType<typeof findPipelineIntegration>
      >);
    jest.mocked(resolveTicketRecipient).mockResolvedValue('bat@example.com');
    jest.mocked(assertSendableIntegration).mockResolvedValue(undefined);
    jest.mocked(sendTicketMail).mockResolvedValue({
      _id: 'message-1',
    } as unknown as Awaited<ReturnType<typeof sendTicketMail>>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('never mails an internal note', async () => {
    const models = buildModels();

    await expect(
      mailTicketNote(models, 'test', {
        contentId: 'ticket-1',
        content: paragraph,
        isInternal: true,
      }),
    ).resolves.toBeUndefined();

    expect(models.Ticket.findOne).not.toHaveBeenCalled();
    expect(sendTicketMail).not.toHaveBeenCalled();
  });

  it('skips a pipeline without a mail address', async () => {
    jest.mocked(findPipelineIntegration).mockResolvedValue(null);

    await expect(
      mailTicketNote(buildModels(), 'test', {
        contentId: 'ticket-1',
        content: paragraph,
      }),
    ).resolves.toBeUndefined();

    expect(sendTicketMail).not.toHaveBeenCalled();
  });

  it('refuses a reply when the ticket has no customer email', async () => {
    jest.mocked(resolveTicketRecipient).mockResolvedValue(undefined);

    await expect(
      mailTicketNote(buildModels(), 'test', {
        contentId: 'ticket-1',
        content: paragraph,
      }),
    ).rejects.toThrow('no customer email address');

    expect(sendTicketMail).not.toHaveBeenCalled();
  });

  it('refuses a reply when the workspace cannot send', async () => {
    jest
      .mocked(assertSendableIntegration)
      .mockRejectedValue(new Error('This inbox would have no way to reply.'));

    await expect(
      mailTicketNote(buildModels(), 'test', {
        contentId: 'ticket-1',
        content: paragraph,
      }),
    ).rejects.toThrow('no way to reply');

    expect(sendTicketMail).not.toHaveBeenCalled();
  });

  it('mails the resolved recipient and returns the message id', async () => {
    await expect(
      mailTicketNote(buildModels(), 'test', {
        contentId: 'ticket-1',
        content: paragraph,
        attachments: [
          {
            name: 'invoice.pdf',
            url: 'files/invoice.pdf',
            type: 'application/pdf',
            size: 2048,
          },
        ],
      }),
    ).resolves.toBe('message-1');

    expect(sendTicketMail).toHaveBeenCalledWith(
      expect.anything(),
      'test',
      ticket,
      expect.objectContaining({
        ticketId: 'ticket-1',
        to: ['bat@example.com'],
        subject: 'Re: Invoice',
        body: '<p>Hello</p>',
        attachments: [
          {
            name: 'invoice.pdf',
            url: 'files/invoice.pdf',
            type: 'application/pdf',
            size: 2048,
          },
        ],
      }),
    );
  });

  it('sends a pasted image as an inline attachment', async () => {
    await mailTicketNote(buildModels(), 'test', {
      contentId: 'ticket-1',
      content: JSON.stringify([
        { type: 'image', props: { url: '0.81-screenshot.png', caption: '' } },
      ]),
    });

    const [, , , args] = jest.mocked(sendTicketMail).mock.calls[0];

    expect(args.body).toMatch(
      /^<p><img src="cid:[^"]+@erxes" alt="" \/><\/p>$/,
    );
    expect(args.attachments).toEqual([
      expect.objectContaining({
        url: '0.81-screenshot.png',
        type: 'image/png',
        disposition: 'inline',
        contentId: expect.stringMatching(/@erxes$/),
      }),
    ]);
  });

  it('does not mail a note with neither text nor attachments', async () => {
    await expect(
      mailTicketNote(buildModels(), 'test', {
        contentId: 'ticket-1',
        content: '[]',
      }),
    ).resolves.toBeUndefined();

    expect(sendTicketMail).not.toHaveBeenCalled();
  });
});

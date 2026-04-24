import { IContext } from '~/connectionResolvers';


export const extractNewContent = (html: string): string | undefined => {
  const start = html.indexOf('<div dir="ltr">');
  if (start === -1) return undefined;
  const end = html.indexOf('</div><br>', start);
  if (end === -1) return undefined;
  return html.substring(start, end + '</div><br>'.length);
};


export const extractQuotedReply = (html: string): string | undefined => {
  const start = html.indexOf('<div class="gmail_quote">');
  if (start === -1) return undefined;
  const end = html.lastIndexOf('</div>');
  if (end === -1) return undefined;
  return html.substring(start, end);
};

const sanitiseBody = (body: string): string =>
  body === '<div dir="ltr">false</div>\n' ? '<div dir="ltr"></div>\n' : body;

const convertEmails = (
  emails: { name?: string; address?: string }[] | undefined,
) =>
  (emails ?? []).map(({ name, address }) => ({ name, email: address }));


export const imapQueries = {
  async imapConversationDetail(
    _root,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ) {
    const messages = await models.ImapMessages.find({
      inboxConversationId: conversationId,
    }).sort({ createdAt: 1 });

    return messages.map((message) => {
      const body = sanitiseBody(message.body ?? '');
      return {
        _id: message._id,
        createdAt: message.createdAt,
        mailData: {
          messageId: message.messageId,
          type: message.type,
          from: convertEmails(message.from),
          to: convertEmails(message.to),
          cc: convertEmails(message.cc),
          bcc: convertEmails(message.bcc),
          subject: message.subject,
          body,
          newContent: extractNewContent(body),
          replies: extractQuotedReply(body),
          attachments: message.attachments,
        },
      };
    });
  },

  async imapGetIntegrations(_root, _args, { models }: IContext) {
    return models.ImapIntegrations.find();
  },

  async imapLogs(_root, _args, { models }: IContext) {
    return models.ImapLogs.find().sort({ date: -1 }).limit(100);
  },
};

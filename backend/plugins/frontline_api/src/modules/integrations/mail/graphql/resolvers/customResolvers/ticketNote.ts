import { IContext } from '~/connectionResolvers';
import { INote } from '@/ticket/@types/note';
import { MAIL_MESSAGE_TYPES } from '@/integrations/mail/constants';
import { canResend } from '@/integrations/mail/utils/delivery';
import { toUnsavedAttachments } from '@/integrations/mail/utils/noteAttachments';

export const TicketNote = {
  async mailDelivery(
    { mailMessageId }: Pick<INote, 'mailMessageId'>,
    _args: undefined,
    { models, user }: IContext,
  ) {
    if (!mailMessageId || !user?._id) {
      return null;
    }

    const message = await models.MailMessages.findOne({
      _id: mailMessageId,
      type: MAIL_MESSAGE_TYPES.SENT,
    }).lean();

    if (!message) {
      return null;
    }

    return {
      status: message.deliveryStatus,
      error: message.deliveryError,
      to: message.to.map(({ address }) => address),
      bouncedRecipients: message.bouncedRecipients ?? [],
      retryable: message.deliveryRetryable ?? false,
      canRetry: canResend(message),
    };
  },

  async unsavedAttachments(
    { mailMessageId }: Pick<INote, 'mailMessageId'>,
    _args: undefined,
    { models, user }: IContext,
  ) {
    if (!mailMessageId || !user?._id) {
      return [];
    }

    const message = await models.MailMessages.findOne({
      _id: mailMessageId,
      type: MAIL_MESSAGE_TYPES.INBOX,
    }).lean();

    return message ? toUnsavedAttachments(message) : [];
  },
};

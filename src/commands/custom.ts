import * as EmailValidator from 'email-deep-validator';
import { connect, disconnect } from '../db/connection';
import { ConversationMessages, Conversations, Customers } from '../db/models';

const validateEmail = async email => {
  const emailValidator = new EmailValidator();
  const { validDomain, validMailbox } = await emailValidator.verify(email);
  return validDomain && validMailbox;
};
export const checkMail = async () => {
  connect();

  const customersWithoutMailChecks = await Customers.find({
    hasValidEmail: { $exists: false },
    primaryEmail: { $ne: '' },
  });

  const bulkOps: Array<{
    updateOne: { filter: { _id: string }; update: { hasValidEmail: boolean } };
  }> = [];
  for (const customer of customersWithoutMailChecks) {
    const isValid = await validateEmail(customer.primaryEmail);
    bulkOps.push({
      updateOne: {
        filter: { _id: customer._id },
        update: { hasValidEmail: isValid },
      },
    });
  }
  await Customers.bulkWrite(bulkOps);
};
export const customCommand = async () => {
  connect();

  const conversations = await Conversations.find({
    firstRespondedUserId: null,
    firstRespondedDate: null,
    messageCount: { $gt: 1 },
  })
    .select('_id')
    .sort({ createdAt: -1 });

  for (const { _id } of conversations) {
    // First message that answered to a conversation
    const message = await ConversationMessages.findOne({
      conversationId: _id,
      userId: { $ne: null },
    }).sort({ createdAt: 1 });

    if (message) {
      await Conversations.updateOne(
        { _id },
        {
          $set: {
            firstRespondedUserId: message.userId,
            firstRespondedDate: message.createdAt,
          },
        },
      );
    }
  }

  disconnect();
};

customCommand();
checkMail();

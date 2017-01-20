import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import moment from 'moment';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { sendEmail } from '/imports/api/server/utils';
import { Customers } from '/imports/api/customers/customers';
import { Brands } from '/imports/api/brands/brands';
import { Conversations } from '../conversations';
import { CONVERSATION_STATUSES } from '../constants';
import { Messages } from '../messages';


function sendMessageEmail() {
  // new or open conversations
  const conversations = Conversations.find(
    { status: { $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN] } },
    { fields: { _id: 1, customerId: 1, brandId: 1 } },
  );

  _.each(conversations.fetch(), (conversation) => {
    const customer = Customers.findOne(conversation.customerId);
    const brand = Brands.findOne(conversation.brandId);

    if (!customer || !customer.email) { return; }
    if (!brand) { return; }

    // user's last non answered question
    const question = Messages.findOne(
      {
        conversationId: conversation._id,
        customerId: { $exists: true },
      },
      { sort: { createdAt: -1 } },
    ) || {};

    question.createdAt = moment(question.createdAt).format('DD MMM YY, HH:mm');

    // generate admin unread answers
    const answers = [];

    const adminMessages = Messages.find(
      {
        conversationId: conversation._id,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },

        // exclude internal notes
        internal: false,
      },
      { sort: { createdAt: 1 } },
    ).fetch();

    _.each(adminMessages, (message) => {
      const answer = message;

      // add user object to answer
      answer.user = Meteor.users.findOne(message.userId);
      answer.createdAt = moment(answer.createdAt).format('DD MMM YY, HH:mm');
      answers.push(answer);
    });

    if (answers.length < 1) {
      return;
    }

    // template data
    const data = { customer, question, answers, brand };

    // add user's signature
    const user = Meteor.users.findOne(answers[0].userId);

    if (user && user.emailSignatures) {
      const signature = _.find(
        user.emailSignatures,
        s => brand._id === s.brandId,
      );

      if (signature) {
        data.signature = signature.signature;
      }
    }

    // send email
    sendEmail({
      to: customer.email,
      subject: `Reply from "${brand.name}"`,
      template: {
        name: 'conversationCron',
        isCustom: true,
        data,
      },
    });

    // mark sent messages as read
    Messages.update(
      {
        conversationId: conversation._id,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      },
      { $set: { isCustomerRead: true } },
      { multi: true },
    );
  });
}

SyncedCron.add({
  name: 'Send unread conversation messages to customer\'s email',

  schedule(parser) {
    // return parser.text('every 10 seconds');
    return parser.text('every 10 minutes');
  },

  job() {
    sendMessageEmail();
  },
});

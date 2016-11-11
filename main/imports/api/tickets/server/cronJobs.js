import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import moment from 'moment';

import { SyncedCron } from 'meteor/percolate:synced-cron';

import { sendEmail } from '/imports/api/server/utils';
import { Customers } from '/imports/api/customers/customers';
import { Brands } from '/imports/api/brands/brands';

import { Tickets } from '../tickets';
import { TICKET_STATUSES } from '../constants';
import { Comments } from '../comments';


function sendCommentEmail() {
  // new or open tickets
  const tickets = Tickets.find(
    { status: { $in: [TICKET_STATUSES.NEW, TICKET_STATUSES.OPEN] } },
    { fields: { _id: 1, customerId: 1, brandId: 1 } }
  );

  _.each(tickets.fetch(), (ticket) => {
    const customer = Customers.findOne(ticket.customerId);
    const brand = Brands.findOne(ticket.brandId);

    if (!customer || !customer.email) { return; }
    if (!brand) { return; }

    // user's last non answered question
    const question = Comments.findOne(
      {
        ticketId: ticket._id,
        customerId: { $exists: true },
      },
      { sort: { createdAt: -1 } }
    ) || {};

    question.createdAt = moment(question.createdAt).format('DD MMM YY, HH:mm');

    // generate admin unread answers
    const answers = [];

    const adminComments = Comments.find(
      {
        ticketId: ticket._id,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },

        // exclude internal notes
        internal: false,
      },
      { sort: { createdAt: 1 } }
    ).fetch();

    _.each(adminComments, (comment) => {
      const answer = comment;

      // add user object to answer
      answer.user = Meteor.users.findOne(comment.userId);
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
        (s) => brand._id === s.brandId
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
        name: 'ticketCron',
        isCustom: true,
        data,
      },
    });

    // mark sent comments as read
    Comments.update(
      {
        ticketId: ticket._id,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      },
      { $set: { isCustomerRead: true } },
      { multi: true }
    );
  });
}

SyncedCron.add({
  name: 'Send unread ticket comments to customer\'s email',

  schedule(parser) {
    // return parser.text('every 10 seconds');
    return parser.text('every 10 minutes');
  },

  job() {
    sendCommentEmail();
  },
});

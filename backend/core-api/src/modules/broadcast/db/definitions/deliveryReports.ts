import { Schema } from 'mongoose';

export const statsSchema = new Schema({
  engageMessageId: {
    type: String,
    label: 'Engage message id at erxes-api',
    unique: true,
  },
  createdAt: { type: Date, default: Date.now },
  open: {
    type: Number,
    default: 0,
    label:
      'The recipient received the message and opened it in their email client',
  },
  click: {
    type: Number,
    default: 0,
    label: 'The recipient clicked one or more links in the email',
  },
  complaint: {
    type: Number,
    default: 0,
    label:
      'The email was successfully delivered to the recipient. The recipient marked the email as spam',
  },
  delivery: {
    type: Number,
    default: 0,
    label: `The provider delivered the email to the recipient's mail server`,
  },
  bounce: {
    type: Number,
    default: 0,
    label: `The recipient's mail server permanently rejected the email`,
  },
  reject: {
    type: Number,
    default: 0,
    label:
      'The provider accepted the email, found it to be a risk, and blocked it',
  },
  send: {
    type: Number,
    default: 0,
    label:
      'The handoff to the provider succeeded and delivery is being attempted',
  },
  renderingfailure: {
    type: Number,
    default: 0,
    label: `The email wasn't sent because of a template rendering issue`,
  },
  deferred: {
    type: Number,
    default: 0,
    // The only sign a provider gives when it is holding us back rather than
    // refusing us outright: nothing failed, so no error is ever raised.
    label:
      'The receiving server asked for the message later and the provider is still trying',
  },
  total: { type: Number, default: 0, label: 'Total of all cases above' },
});

export const deliveryReportsSchema = new Schema({
  customerId: { type: String, label: 'Customer id at erxes-api', index: true },
  mailId: {
    type: String,
    optional: true,
    label: 'AWS SES mail id',
    index: true,
  },
  status: {
    type: String,
    optional: true,
    label: 'Delivery status',
    index: true,
  },
  engageMessageId: {
    type: String,
    optional: true,
    label: 'Engage message id at erxes-api',
    index: true,
  },
  createdAt: {
    type: Date,
    label: 'Created at',
    default: Date.now,
    index: true,
  },
  email: { type: String, label: 'Customer email', index: true },
});

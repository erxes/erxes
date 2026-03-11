import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const branchSchema = new Schema({
  _id: mongooseStringRandomId,
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description', optional: true },
  userId: { type: String, optional: true, label: 'Created by' },
  createdAt: { type: Date, label: 'Created at' },
  user1Ids: { type: [String], label: 'user ids' },
  user2Ids: { type: [String], label: 'user ids' },
  user3Ids: { type: [String], label: 'user ids' },
  user4Ids: { type: [String], label: 'user ids' },
  user5Ids: { type: [String], label: 'user ids' },

  paymentIds: { type: [String], label: 'Online Payments' },
  paymentTypes: { type: [Object], label: 'Other Payments' },
  token: { type: String, label: ' token' },
  uiOptions: { type: Object, label: 'UI Options' },
  pipelineConfig: { type: Object, label: 'UI Options' },
  erxesAppToken: { type: String, label: 'Erxes App token' },
  permissionConfig: {
    type: Object,
    optional: true,
    label: 'Permission',
  },
  status: { type: String, label: 'Status', optional: true },
  websiteReservationLock: {
    type: Boolean,
    label: 'websiteReservationLock',
    optional: true,
    default: false,
  },
  time: { type: String, label: 'time', optional: true },
  discount: { type: Object, label: 'object', optional: true },
  extraProductCategories: {
    type: [String],
    label: ' extraProductCategories ids',
  },
  roomCategories: { type: [String], label: ' roomCategories ids' },
  checkintime: { type: String, label: 'checkintime' },
  checkouttime: { type: String, label: 'checkouttime' },
  checkinamount: { type: Number, label: 'checkinamount' },
  checkoutamount: { type: Number, label: 'checkoutamount' },
});

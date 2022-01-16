import { Schema } from 'mongoose';
import { COMPAIGN_STATUS, OWNER_TYPES } from './Constants';

export const attachmentSchema = new Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number
  },
  { _id: false }
);

export const commonCompaignSchema = {
  _id: { pkey: true },

  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' },
  modifiedAt: { type: Date, label: 'Modified at' },
  modifiedBy: { type: String, label: 'Modified by' },

  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  startDate: { type: Date, label: 'Start Date' },
  endDate: { type: Date, label: 'End Date' },
  attachment: { type: attachmentSchema },

  status: { type: String, enum: COMPAIGN_STATUS.ALL, default: 'active' }
};

export const commonSchema = {
  _id: { pkey: true },
  compaignId: { type: String },
  createdAt: { type: Date, label: 'Created at' },
  usedAt: { type: Date, label: 'Used date' },

  ownerType: { type: String, label: 'Owner Type', enum: OWNER_TYPES.ALL },
  ownerId: { type: String },
}

export const validCompaign = (doc) => {
  if (!doc.startDate || doc.startDate < new Date()) {
    throw new Error('The start date must be in the future')
  }

  if (doc.endDate && doc.startDate > doc.endDate) {
    throw new Error('The end date must be after from start date')
  }
}

export const changeScoreOwner = async (models, { ownerType, ownerId, changeScore }) => {
  let owner;
  let collection;
  if (ownerType === 'customer') {
    collection = models.Customers;
    owner = models.Customers.findOne({ _id: ownerId }).lean();
  }
  if (ownerType === 'user') {
    collection = models.Users;
    owner = models.Users.findOne({ _id: ownerId }).lean();
  }

  if (!owner) {
    throw new Error(`not fount ${ownerType}`);
  }

  const oldScore = owner.score || 0;

  if (changeScore < 0 && oldScore < changeScore * -1) {
    throw new Error(`score are not enough`);
  }

  const newScore = oldScore + changeScore;

  await collection.updateOne({ _id: ownerId }, { $set: { score: newScore } });
  return newScore;
}

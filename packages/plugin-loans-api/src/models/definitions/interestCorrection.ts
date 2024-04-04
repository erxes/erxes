import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';
import { INTEREST_CORRECTION_TYPE } from './constants';
export interface IInterestCorrection {
  description: string;
  invDate: Date;
  interestAmount: number;
  lossAmount: number;
  contractId: string;
  type: string;
  isStopLoss: boolean;
}

export interface IInterestCorrectionDocument
  extends IInterestCorrection,
    Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

export const InterestCorrectionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    number: field({
      type: String,
      label: 'Number',
      index: true
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    invDate: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    interestAmount: field({ type: Number, min: 0, label: 'Interest Amount' }),
    lossAmount: field({ type: Number, min: 0, label: 'Loss Amount' }),
    contractId: field({ type: String, min: 0, label: 'Contract Id' }),
    type: field({ type: String, label: 'type' }),
    isStopLoss: field({ type: Boolean, label: 'is Stop loss' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    createdBy: { type: String, optional: true, label: 'created member' }
  }),
  'erxes_interestCorrectionSchema'
);

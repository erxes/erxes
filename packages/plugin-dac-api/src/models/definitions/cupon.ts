import { field } from '@erxes/api-utils/src/definitions/utils';
import { Schema, Document } from 'mongoose';
import { ICuponModel } from '../dacCupon';
import { CUPON_STATUS } from './constants';
interface ICommonFields {
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}
export interface ICuponCreate extends ICupon {
  userId?: string;
}

export interface ICupon {
  cuponCode: string;
  _id: string;
  customerId: string;
  expireDate?: Date;
  startDate?: Date;
  description?: string;
  status: string;
}

export interface ICuponDocument extends ICommonFields, ICupon, Document {
  _id: string;
  status: string;
}

export interface IModels {
  DacCupons: ICuponModel;
}

const commonFields = {
  createdBy: field({ type: String, label: 'Created by' }),
  createdDate: field({ type: Date, label: 'Created at' }),
  modifiedBy: field({ type: String, label: 'Modified by' }),
  modifiedDate: field({ type: Date, label: 'Modified at' }),
  title: field({ type: String, label: 'Title' })
};

export const cuponSchema = new Schema({
  _id: field({ pkey: true }),
  customerId: field({
    type: String,
    optional: true,
    label: 'customerId'
  }),
  status: field({
    type: String,
    enum: CUPON_STATUS.ALL,
    default: 'new'
  }),
  cuponCode: field({ type: String, optional: true, label: 'cuponCode' }),
  startDate: field({ type: Date, label: 'start date' }),
  expireDate: field({ type: Date, label: 'Expiry date' }),

  description: field({
    type: String,
    optional: true,
    label: 'description'
  }),
  discount: field({ type: String, optional: true, label: 'discount' }),
  ...commonFields
});

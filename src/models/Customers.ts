import { Document, Model, Schema } from 'mongoose';
import { apiConnection } from '../connection';

export interface ICustomer {
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  firstName: String,
  lastName: String,
  avatar: {
    type: String,
    optional: true,
  },
});

export interface ICustomerModel extends Model<ICustomerDocument> {}

// tslint:disable-next-line
const Customers = apiConnection.model<ICustomerDocument, ICustomerModel>('customers', customerSchema);

export default Customers;

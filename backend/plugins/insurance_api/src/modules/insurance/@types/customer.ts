import { Document } from 'mongoose';

export type CustomerType = 'individual' | 'company';

export interface ICustomer {
  type: CustomerType;
  registrationNumber: string;
  email?: string;
  phone?: string;
  // Individual fields
  firstName?: string;
  lastName?: string;
  // Company fields
  companyName?: string;
}

export interface ICustomerDocument extends Document, ICustomer {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

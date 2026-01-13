import { Document } from 'mongoose'

export interface ICustomer {
    userId: string;
    // id on erxes-api
    erxesApiId?: string;
    firstName: string;
    lastName: string;
    profilePic: string;
    integrationId: string;
  }
  
  export interface ICustomerDocument extends ICustomer, Document {
    _id: string;
  }
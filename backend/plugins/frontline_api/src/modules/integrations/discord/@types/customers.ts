import { Document } from 'mongoose';

export interface IDiscordCustomer {
  // Discord user id (snowflake)
  userId: string;
  // Customer id on core contacts-api
  erxesApiId?: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  // Inbox integration id
  integrationId: string;
}

export interface IDiscordCustomerDocument extends IDiscordCustomer, Document {
  _id: string;
}

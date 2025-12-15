import { z } from 'zod';
import {
  createCustomerSchema,
  TicketCheckProgressSchema,
  TicketForgotProgressSchema,
} from '../schema';

export enum TicketFormFields {
  name = 'Ticket title',
  description = 'Ticket description',
  attachments = 'Attachments',
  tags = 'Select tags',
  //**customer fields */
  firstName = 'First name',
  lastName = 'Last name',
  phoneNumber = 'Phone number',
  email = 'Email',
  //**company fields */
  companyName = 'Company name',
  address = 'Company address',
  registrationNumber = 'Company registration number',
  companyPhoneNumber = 'Company phone number',
  companyEmail = 'Company email',
}

export enum TicketFormPlaceholders {
  name = 'Enter ticket title',
  description = 'Enter ticket description',
  attachments = 'Select attachments',
  tags = 'Select tags',

  firstName = 'Enter first name',
  lastName = 'Enter last name',
  phoneNumber = 'Enter phone number',
  email = 'Enter email',

  companyName = 'Enter company name',
  address = 'Enter company address',
  registrationNumber = 'Enter company registration number',
  companyPhoneNumber = 'Enter company phone number',
  companyEmail = 'Enter company email',
}

export type TCreateCustomerForm = z.infer<typeof createCustomerSchema>;
export type TTicketForgotProgressForm = z.infer<
  typeof TicketForgotProgressSchema
>;
export type TTicketCheckProgressForm = z.infer<
  typeof TicketCheckProgressSchema
>;

export interface ITicketCheckProgress {
  _id: string;
  name: string;
  description: string;
  pipelineId: string;
  statusId: string;
  priority: string;
  labelIds: string[];
  tagIds: string[];
  assigneeId: string;
  createdBy: string;
  userId: string;
  startDate: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  channelId: string;
  statusChangedDate: string;
  number: string;
  status: ITicketStatus;
}

export interface ITicketStatus {
  _id: string;
  color: string;
  name: string;
  description: string;
  type: number;
}

import { Document } from 'mongoose';

export interface IAutomationEmailTemplate {
  name: string;
  description?: string;
  content: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAutomationEmailTemplateDocument
  extends IAutomationEmailTemplate,
    Document {
  _id: string;
}

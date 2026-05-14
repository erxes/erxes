import { Document } from 'mongoose';

export interface IOperationTemplate {
  name: string;
  defaults?: any;
  teamId: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOperationTemplateDocument
  extends IOperationTemplate,
    Document {
  _id: string;
}

export interface IOperationTemplateAdd {
  name: string;
  defaults?: any;
  teamId: string;
}

export interface IOperationTemplateEdit {
  _id: string;
  name?: string;
  defaults?: any;
}

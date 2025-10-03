import { Document } from 'mongoose';

export interface IChecklist {
  contentType: string;
  contentTypeId: string;
  title: string;
}

export interface IChecklistDocument extends IChecklist, Document {
  _id: string;
  userId: string;
  createdAt: Date;
}

export interface IChecklistItem {
  checklistId: string;
  content: string;
  isChecked: boolean;
}

export interface IChecklistItemDocument extends IChecklistItem, Document {
  _id: string;
  order: number;
  userId: string;
  createdAt: Date;
}

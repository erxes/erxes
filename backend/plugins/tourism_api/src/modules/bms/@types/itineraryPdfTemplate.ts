import { Document } from 'mongoose';

export interface IItineraryPdfTemplate {
  itineraryId: string;
  branchId?: string;
  kind: string;
  name?: string;
  description?: string;
  status?: string;
  version?: number;
  doc?: Record<string, unknown>;
  createdBy?: string;
  modifiedBy?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IItineraryPdfTemplateDocument
  extends IItineraryPdfTemplate,
    Document {
  _id: string;
}

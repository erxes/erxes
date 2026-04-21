import { Document } from 'mongoose';

export interface IGroupDayTranslation {
  day: number;
  title?: string;
  content?: string;
}

export interface IItineraryTranslation {
  objectId: string;
  language: string;

  name?: string;
  content?: string;
  foodCost?: number;
  personCost?: any;
  gasCost?: number;
  driverCost?: number;
  guideCost?: number;
  guideCostExtra?: number;

  groupDays?: IGroupDayTranslation[];
}

export interface IItineraryTranslationDocument
  extends IItineraryTranslation, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

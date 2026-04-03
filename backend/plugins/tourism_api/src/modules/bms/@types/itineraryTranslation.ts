import { Document } from 'mongoose';

export interface IItineraryTranslationGroupDay {
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
  gasCost?: number;
  driverCost?: number;
  guideCost?: number;
  guideCostExtra?: number;
  groupDays?: IItineraryTranslationGroupDay[];
}

export interface IItineraryTranslationDocument
  extends IItineraryTranslation,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

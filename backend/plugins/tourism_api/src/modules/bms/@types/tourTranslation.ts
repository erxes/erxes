import { Document } from 'mongoose';

export interface IPricingOptionTranslation {
  optionId: string; // matches pricingOption._id in the tour
  title?: string;
  note?: string;
  accommodationType?: string;
  pricePerPerson?: number;
  domesticFlightPerPerson?: number;
  singleSupplement?: number;
}

export interface ITourTranslation {
  objectId: string;
  language: string;
  name?: string;
  refNumber?: string;
  content?: string;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  pricingOptions?: IPricingOptionTranslation[];
}

export interface ITourTranslationDocument extends ITourTranslation, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

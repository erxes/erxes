import { Document } from 'mongoose';
import { ILocation } from '@/bms/@types/itinerary';

export interface IElement {
  name: string;
  quick?: boolean;
  visibleName?: boolean;
  icon?: string;
  content: string;
  note?: string;
  startTime?: string;
  duration?: string;
  cost?: string;
  images?: string;
  itineraryId?: string;
  location?: ILocation;
  categories?: string[];
  branchId?: string;
  additionalInfo?: any;
}

export interface IElementDocument extends IElement, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IElementCategory {
  name: string;
  parentId?: string;
}

export interface IElementCategoryDocument extends IElementCategory, Document {
  _id: string;
  order?: string;
  createdAt: Date;
  modifiedAt: Date;
}

import { Document } from 'mongoose';

export interface ILocation {
  lat: number;
  lng: number;
  name: string;
  mapId: string;
}
export interface GroupDay {
  day: number;
  images: string[];
  content: string;
  elements: ElementItem[];
}
export interface ElementItem {
  elementId: string;
  orderOfDay: number;
}

export interface PersonCostItem {
  persons: string;
  price: number;
}

export interface IItinerary {
  name: string;
  content: string;
  duration: number;
  totalCost: number;
  groupDays: GroupDay[];
  location: ILocation[];
  images: string[];
  status: string;
  color?: string;
  branchId?: string;
  personCost?: PersonCostItem[];
}

export interface IItineraryDocument extends IItinerary, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  ownerId: string;
  searchText: string;
}

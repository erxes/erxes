import { Document } from 'mongoose';
import { ILocation } from '@/bms/@types/itinerary';
import { IPageInfo } from 'erxes-api-shared/src/core-types';
import { IAttachment } from 'erxes-api-shared/core-types';

export interface IGuideItem {
  guideId: string;
  type: string;
}

export type DateType = 'fixed' | 'flexible';

export interface IPricingOption {
  _id?: string;
  title: string;
  minPersons: number;
  maxPersons?: number;
  pricePerPerson: number;
  accommodationType?: string;
  domesticFlightPerPerson?: number;
  singleSupplement?: number;
  note?: string;
}

export interface ITour {
  name: string;
  groupCode: string;
  refNumber?: string;
  content: string;
  duration: string;
  location: ILocation[];
  dateType?: DateType;
  startDate: Date;
  endDate: Date;
  availableFrom?: Date;
  availableTo?: Date;
  groupSize: number;
  guides: IGuideItem[];
  status: string;
  date_status: string;
  cost: number;
  branchId: string;
  tagIds?: string[];
  categoryIds?: string[];
  viewCount: number;
  advancePercent?: number;
  joinPercent?: number;
  personCost?: Record<string, number>;
  advanceCheck?: boolean;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  extra?: any;
  images?: string[];
  imageThumbnail?: string;
  pricingOptions?: IPricingOption[];
  startingPrice?: number;
}

export interface ITourDocument extends ITour, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  searchText: string;
}

export interface ITourCategory {
  name: string;
  code?: string;
  order?: string;
  parentId?: string;
  attachment?: IAttachment;
  modifiedAt?: Date;
}

export interface ITourCategoryDocument extends ITourCategory, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface TourFilterParams {
  categoryIds?: string[];
  name?: string;
  status?: string;
  innerDate?: Date;
  branchId?: string;
  tags?: string[];
  startDate1?: Date;
  endDate1?: Date;
  startDate2?: Date;
  endDate2?: Date;
  [key: string]: any;
}

export interface TourListResponse {
  list: ITourDocument[];
  totalCount: number;
  pageInfo: IPageInfo;
}

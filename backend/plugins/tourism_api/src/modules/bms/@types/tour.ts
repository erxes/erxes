import { Document } from 'mongoose';
import { ILocation } from '@/bms/@types/itinerary';
import { IPageInfo } from 'erxes-api-shared/src/core-types';

export interface IGuideItem {
  guideId: string;
  type: string;
}
export interface ITour {
  name: string;
  groupCode: string;
  refNumber?: string;
  content: string;
  duration: string;
  location: ILocation[];
  startDate: Date;
  endDate: Date;
  groupSize: number;
  guides: IGuideItem[];
  status: string;
  date_status: string;
  cost: number;
  branchId: string;
  tags: string[];
  viewCount: number;
  advancePercent?: number;
  joinPercent?: number;
  advanceCheck?: boolean;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  extra?: any;
  images?: string[];
  imageThumbnail?: string;
}

export interface ITourDocument extends ITour, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  searchText: string;
}

export interface TourFilterParams {
  categories?: string[];
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

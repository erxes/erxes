import { Document } from 'mongoose';
import {
  IAttachment,
  ICursorPaginateParams,
  IListParams,
} from 'erxes-api-shared/core-types';

export interface ICar {
  ownerId: string;
  plateNumber: string;
  vinNumber: string;
  colorCode: string;
  categoryId: string;
  bodyType: string;
  fuelType: string;
  gearBox: string;
  vintageYear: number;
  importYear: number;
  status: string;
  description: string;
  tagIds: string[];
  mergeIds: string[];
  searchText: string;
  attachment: IAttachment;
}

export interface ICarDocument extends ICar, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  searchText: string;
}

export interface ICarParams extends IListParams, ICursorPaginateParams {
  ids?: string[];
  categoryId?: string;
  searchValue?: string;
  tag?: string;
}

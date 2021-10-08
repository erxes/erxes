import { IUser } from 'modules/auth/types';
import { QueryResponse } from 'modules/common/types';
import { IBrand } from 'modules/settings/brands/types';
import { IProductCategory } from 'modules/settings/productService/types';
import { ITag } from 'modules/tags/types';

export interface IStyle {
  itemShape?: string;
  widgetColor: string;
  productAvailable: string;
  productUnavailable: string;
  productSelected: string;

  textAvailable: string;
  textUnavailable: string;
  textSelected: string;
}

export interface IDisplayBlock {
  shape?: string;
  columns?: number;
  rows?: number;
  margin?: number;
}

export interface IBooking {
  // content
  name: string;
  image?: any;
  description: string;
  fieldsGroup?: string;
  userFilters?: string[];

  productCategoryId?: string;

  // settings
  title: string;
  brandId: string;
  channelIds: string[];
  languageCode: string;
  productStatus?: string;
  formId: string;
  buttonText: string;

  // common
  createdDate: Date;

  brand: IBrand;
  createdUser: IUser;

  // style
  styles: IStyle;

  displayBlock: IDisplayBlock;

  tags?: ITag[];

  mainProductCategory: IProductCategory;

  viewCount?: number;
}

export interface IBookingDocument extends IBooking {
  _id: string;
}

// query types
export type BookingsQueryResponse = {
  bookings: IBookingDocument[];
} & QueryResponse;

export type BookingDetailQueryResponse = {
  bookingDetail: IBookingDocument;
} & QueryResponse;

// mutation types
export type AddBookingMutationResponse = {
  addBookingMutation: (params: { variables: IBooking }) => Promise<any>;
};

export type EditBookingMutationResponse = {
  editBookingMutation: (params: {
    variables: { _id: string } & IBooking;
  }) => Promise<any>;
};

export type RemoveBookingMutationVariables = {
  _id: string;
};

export type RemoveBookingMutationResponse = {
  bookingsRemoveMutation: (params: {
    variables: RemoveBookingMutationVariables;
  }) => Promise<any>;
};

export type Counts = {
  [key: string]: number;
};

export type BookingsCount = {
  total: number;
  byTag: Counts;
  byChannel: Counts;
  byBrand: Counts;
  byStatus: Counts;
};

export type CountQueryResponse = {
  bookingsTotalCount: BookingsCount;
} & QueryResponse;

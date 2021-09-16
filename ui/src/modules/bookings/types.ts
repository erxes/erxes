import { IUser } from 'modules/auth/types';
import { QueryResponse } from 'modules/common/types';
import { IBrand } from 'modules/settings/brands/types';
import { ITag } from 'modules/tags/types';

export interface IStyle {
  itemShape?: string;
  widgetColor?: string;
  productAvailable?: string;
  productUnavailable?: string;
  productSelected?: string;

  textAvailable?: string;
  textUnavailable?: string;
  textSelected?: string;
}

export interface IBooking {
  // content
  name?: string;
  image?: any;
  description?: string;
  userFilters?: string[];

  productCategoryId?: string;

  // settings
  title?: string;
  brandId?: string;
  channelIds?: string[];
  languageCode?: string;
  productStatus?: string;
  formId?: string;
  buttonText?: string;

  // common
  createdDate?: Date;

  brand?: IBrand;
  createdUser?: IUser;

  // style
  styles?: IStyle;

  tags?: ITag[];
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

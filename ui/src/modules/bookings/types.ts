import { QueryResponse } from 'modules/common/types';

export interface IBooking {
  name?: string;
  image?: string;
  description?: string;
  userFilters?: string[];
  productCategoryId?: string;
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
export type AddBookingMutationVariables = {
  name?: string;
  image?: string;
  description?: string;
  userFilters?: string[];
  productCategoryId?: string;
};

export type AddBookingMutationResponse = {
  addBookingMutation: (params: {
    variables: AddBookingMutationVariables;
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

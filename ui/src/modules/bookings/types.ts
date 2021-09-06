import { QueryResponse } from 'modules/common/types';

export interface IBooking {
  name?: string;
  size?: string;
  images?: string[];
  font?: string;
  fontColor?: string;
  columnColor?: string;
  activeColumn?: string;
  rowColor?: string;
  activeRow?: string;
  columnShape?: string;
  rowShape?: string;
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
export type BookingRemoveMutationVariables = {
  _id: string;
};

export type BookingRemoveMutationResponse = {
  bookingsRemoveMutation: (params: {
    variables: BookingRemoveMutationVariables;
  }) => Promise<any>;
};

export type Counts = {
  [key: string]: number;
};

import{ Document } from 'mongoose';

export interface IAddress {
  alias: string;
  customerId: string;
  coordinate: {
    lat: number;
    lng: number;
  };
  address1: string;
  address2: string;
  city: string;
  district: string;
  street: string;
  detail: string;
  more: Record<string, any>;
  w3w: string;
  note: string;
  phone: string;
}

export interface IAddressDocument extends IAddress, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}
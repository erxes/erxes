import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from '../utils';

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  INPROGRESS = 'inprogress',
}

export interface IProductPriceConfig {
  productId: string;
  price: number;
}

export interface IBuilding {
  name: string;
  code: string;
  description: string;
  type: string;
  osmbId: string;
  quarterId: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLong: number;
    maxLong: number;
  };

  location: {
    lat: number;
    lng: number;
  };

  serviceStatus: ServiceStatus;

  suhId: string[];

  installationRequestIds: string[];
  ticketIds: string[];

  productPriceConfigs: IProductPriceConfig[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IBuildingDocument extends IBuilding, Document {
  _id: string;
}

export interface IBuildingEdit extends IBuilding {
  _id: string;
}

export const productPriceConfigSchema = new Schema(
  {
    productId: field({ type: String, label: 'productId', required: true }),
    price: field({ type: Number, label: 'price', required: true }),
  },
  { _id: false }
);

export const buildingSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'code', required: false }),
    name: field({ type: String, label: 'name', required: true }),
    description: field({ type: String, label: 'description', required: false }),
    type: field({ type: String, label: 'type', required: false }),
    osmbId: field({ type: String, label: 'osmbId', required: false }),
    quarterId: field({ type: String, label: 'quarterId', required: false }),
    bounds: field({
      type: {
        minLat: field({ type: Number, label: 'minLat', required: false }),
        maxLat: field({ type: Number, label: 'maxLat', required: false }),
        minLong: field({ type: Number, label: 'minLong', required: false }),
        maxLong: field({ type: Number, label: 'maxLong', required: false }),
      },
      label: 'bounds',
      required: false,
    }),
    location: {
      type: {
        type: String,
        enum: ['Point'],
        optional: true,
      },
      coordinates: {
        type: [Number],
        optional: true,
      },
      required: false,
    },

    serviceStatus: field({
      type: String,
      enum: ['active', 'inactive', 'inprogress'],
      label: 'serviceStatus',
      required: true,
      default: 'inactive',
      index: true,
    }),
    suhId: field({
      type: String,
      label: 'СӨХ',
      required: false,
    }),

    installationRequestIds: field({
      type: [String],
      label: 'Service Request Ticket Ids',
      required: false,
    }),

    ticketIds: field({
      type: [String],
      label: 'Ticket Ids',
      required: false,
    }),

    productPriceConfigs: field({
      type: [productPriceConfigSchema],
      label: 'Product Price Configs',
      required: false,
    }),

    createdAt: field({ type: Date, label: 'createdAt', default: Date.now }),
    updatedAt: field({ type: Date, label: 'updatedAt', default: Date.now }),

    searchText: field({ type: String, optional: true, index: true }),
  }),
  'mobinet_buildings'
);

buildingSchema.index({ location: '2dsphere' });

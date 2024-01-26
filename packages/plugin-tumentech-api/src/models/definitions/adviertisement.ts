import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface IAdvertisement {
  driverId: string;
  carIds: string[];
  categoryIds: string[];
  type: string;
  status: string;
  // чиглэлтэй тээврийн талбар
  startPlace: string;
  startBegin: Date;
  startEnd: Date;

  endPlace: string;
  endBegin: Date;
  endEnd: Date;
  // тогтол тээврийн талбар
  generalPlace: string;
  shift: string;
  period: string;

  createdAt: Date;
}

export interface IAdvertisementDocument extends IAdvertisement, Document {
  _id: string;
}

export const AdvertisementSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    driverId: field({ type: String, label: 'Driver id' }),
    carIds: field({ type: [String], label: 'Car ids' }),
    categoryIds: field({ type: [String], label: 'Product ids' }),
    type: field({ type: String, label: 'төрөл' }),
    status: field({ type: String, label: 'төлөв', default: 'open' }),

    // чиглэлтэй тээврийн талбар
    startPlace: field({ type: String, label: 'эхлэх газар' }),
    startBegin: field({ type: Date, label: 'эхлэх өдөр 1' }),
    startEnd: field({ type: Date, label: 'эхлэх өдөр 2' }),

    endPlace: field({ type: String, label: 'очих газар' }),
    endBegin: field({ type: Date, label: 'дуусах өдөр 1' }),
    endEnd: field({ type: Date, label: 'дуусах өдөр 2' }),
    // тогтол тээврийн талбар
    generalPlace: field({ type: String, label: 'Ерөнхий хаана ажилллах' }),
    shift: field({ type: String, label: 'Ээлж' }),
    period: field({ type: String, label: 'хугацаа' }),

    createdAt: field({ type: Date, label: 'Created at', default: Date.now }),
  }),
  'tumentech_advertisement',
);

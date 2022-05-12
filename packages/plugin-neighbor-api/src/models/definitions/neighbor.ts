import { Schema, Document } from 'mongoose';
import { field } from './utils';

const location = {
  type: field({
    type: String,
    enum: ['Point'],
    required: false,
    optional: true
  }),
  coordinates: field({ type: [Number], reguired: false })
};
const Attachment = {
  name: field({ type: String }),
  type: field({ type: String }),
  url: field({ type: String }),
  size: field({ type: String }),
  duration: field({ type: String })
};

const ageGroups = {
  genz: field({ type: Number }),
  millennials: field({ type: Number }),
  genx: field({ type: Number }),
  boomers: field({ type: Number })
};

const sex = {
  male: field({ type: Number }),
  female: field({ type: Number })
};

const info = {
  school: { type: [String] },
  kindergarden: { type: [String] },
  university: { type: [String] },
  soh: { type: [String] },
  khoroo: { type: [String] },
  hospital: { type: [String] },
  parking: { type: [String] },
  pharmacy: { type: [String] },
  districtTown: { type: [String] },
  busStop: { type: [String] }
};

export interface INeighbor {
  productCategoryId: String;
  data: Object;
  rate: Object;
}

export interface INeighborDocument extends INeighbor, Document {
  _id: String;
}

export const NeighborSchema = new Schema({
  productCategoryId: field({ type: String }),
  data: field({ type: Object, label: '{ typeId: [itemId1, itemId2] }' }),
  rate: field({ type: Object })
});

const schoolSchema = {
  description: field({ type: String, label: 'description' }),
  district: field({ type: String, label: 'district' }),
  Khoroo: field({ type: String, label: 'Khoroo' }),
  locationValue: field({ type: location })
};

const universitySchema = {
  description: field({ type: String, label: 'description' }),
  locationValue: field({ type: location })
};

const sohSchema = {
  thermality: field({ type: String, label: 'thermality' }),
  electricity: field({ type: String, label: 'electricity' }),
  security: field({ type: String, label: 'security' }),
  cable: { type: String, label: 'cable' }
};

const khorooSchema = {
  distance: field({ type: String, label: 'distance' }),
  khorooNumber: field({ type: String, label: 'khoroo number' }),
  address: field({ type: String, label: 'address' }),
  phoneNumber: field({ type: String, label: 'phonenumber' }),
  hospital: field({ type: String, label: 'hospital' }),
  aptHouseholder: field({ type: Number }),
  locationValue: field({ type: location }),
  ageGroup: field({ type: ageGroups }),
  sex: field({ type: sex })
};

const envInfoSchema = {
  camera: field({ type: Number, label: 'camera' }),
  walkingEnv: field({ type: Number, label: 'walking enviroment' }),
  basketball: field({ type: Number, label: 'basketball' }),
  playground: field({ type: Number, label: 'playground' }),
  greenPlant: field({ type: Number, label: 'greenPlant' }),
  streetLighting: field({ type: Number, label: 'streetLighting' })
};

const commonSchema = {
  district: field({ type: String, label: 'district' }),
  khoroo: field({ type: String, label: 'Khoroo' }),
  locationValue: field({ type: location })
};

const districtTownSchema = {
  averagePrice: field({ type: String, label: 'Average price' }),
  averageM2: field({ type: Number, label: 'Average m2' }),
  population: field({ type: Number, label: 'Population' }),
  averageAge: field({ type: Number, label: 'Average age' }),
  publicService: field({ type: String, label: 'Public service' }),
  publicServiceAttachment: field({ type: [Attachment] }),
  featuredAds: field({ type: String, label: 'Featured Ads' }),
  featuredAdsAttachment: field({ type: [Attachment] }),
  market: field({ type: String, label: 'Market' }),
  marketAttachment: field({ type: [Attachment] }),
  districtProfile: field({ type: String, label: 'disctrict profile' }),
  districtProfileAttachment: field({ type: [Attachment] })
};

export interface INeighborItem {
  createdAt: String;
  createdBy: String;
  name: String;
  type: String;
  schoolData: Object;
  kindergardenData: Object;
  universityData: Object;
  khorooData: Object;
  envInfoData: Object;
  parkingData: Object;
  busStopData: Object;
  hospitalData: Object;
  pharmacyData: Object;
  districtTownData: Object;
}

export interface INeighborItemDocument extends INeighborItem, Document {
  _id: String;
}

export const NeighborItemSchema = new Schema({
  _id: field({ pkey: true }),
  createdAt: field({ type: Date, label: 'created at' }),
  createdBy: field({ type: String, optional: true, label: 'Created by' }),
  name: field({ type: String, label: 'name' }),
  type: field({ type: String }),
  schoolData: field({ type: schoolSchema }),
  kindergardenData: field({ type: schoolSchema }),
  universityData: field({ type: universitySchema }),
  sohData: field({ type: sohSchema }),
  khorooData: field({ type: khorooSchema }),
  envInfoData: field({ type: envInfoSchema }),
  parkingData: field({ type: commonSchema }),
  busStopData: field({ type: commonSchema }),
  hospitalData: field({ type: commonSchema }),
  pharmacyData: field({ type: commonSchema }),
  districtTownData: field({ type: districtTownSchema })
});

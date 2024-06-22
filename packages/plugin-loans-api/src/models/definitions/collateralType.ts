import { schemaHooksWrapper, field } from './utils';
import { Schema, Document } from 'mongoose';

export interface ICollateralTypeConfig {
  minPercent: number;
  maxPercent: number;
  defaultPercent: number;
  riskClosePercent: number;
  collateralType: string;
}

export interface ICollateralType {
  code: string;
  name: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  status: string;
  currency: string;
  config: ICollateralTypeConfig;
  property: ICollateralProperty;
}

export interface ICollateralProperty {
  sizeSquare: boolean;
  sizeSquareUnit: boolean;
  cntRoom: boolean;
  startDate: boolean;
  endDate: boolean;
  quality: boolean;
  purpose: boolean;
  mark: boolean;
  color: boolean;
  power: boolean;
  frameNumber: boolean;
  importedDate: boolean;
  factoryDate: boolean;
  courtOrderDate: boolean;
  mrtConfirmedDate: boolean;
  cmrtRegisteredDate: boolean;
  mrtRegisteredDate: boolean;
  courtOrderNo: boolean;
  mrtOrg: boolean;
  registeredToAuthority: boolean;
  causeToShiftTo: boolean;
}

export interface ICollateralTypeDocument extends ICollateralType, Document {
  _id: string;
}

const CollateralConfigSchema = new Schema({
  minPercent: field({ type: Number, label: 'Min Percent' }),
  maxPercent: field({ type: Number, label: 'Min Percent' }),
  defaultPercent: field({ type: Number, label: 'Default Percent' }),
  riskClosePercent: field({ type: Number, label: 'Risk Close Percent' }),
  collateralType: field({ type: String, label: 'Collateral Type' })
});

const CollateralPropertySchema = new Schema({
  sizeSquare: field({ type: Boolean, label: 'Size square' }),
  sizeSquareUnit: field({ type: Boolean, label: 'Size square unit' }),
  cntRoom: field({ type: Boolean, label: 'Room count' }),
  startDate: field({ type: Boolean, label: 'start Date' }),
  endDate: field({ type: Boolean, label: 'endDate' }),
  quality: field({ type: Boolean, label: 'Quality' }),
  purpose: field({ type: Boolean, label: 'Purpose' }),
  mark: field({ type: Boolean, label: 'Mark' }),
  color: field({ type: Boolean, label: 'Color' }),
  power: field({ type: Boolean, label: 'Power' }),
  frameNumber: field({ type: Boolean, label: 'Frame number' }),
  importedDate: field({ type: Boolean, label: 'Imported date' }),
  factoryDate: field({ type: Boolean, label: 'Factory date' }),
  courtOrderDate: field({ type: Boolean, label: 'Court order date' }),
  mrtConfirmedDate: field({ type: Boolean, label: 'mrtConfirmedDate' }),
  cmrtRegisteredDate: field({ type: Boolean, label: 'Risk Close Percent' }),
  mrtRegisteredDate: field({ type: Boolean, label: 'Risk Close Percent' }),
  courtOrderNo: field({ type: Boolean, label: 'Risk Close Percent' }),
  mrtOrg: field({ type: Boolean, label: 'Risk Close Percent' }),
  registeredToAuthority: field({ type: Boolean, label: 'Risk Close Percent' }),
  causeToShiftTo: field({ type: Boolean, label: 'Risk Close Percent' })
});

export const collateralTypeSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'Code', unique: true }),
    name: field({ type: String, label: 'Name' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    status: field({ type: String, optional: true, label: 'Status' }),
    currency: field({ type: String, optional: true, label: 'Currency' }),
    type: field({ type: String, optional: true, label: 'Type' }),
    startDate: field({ type: Date, optional: true, label: 'Start Date' }),
    endDate: field({ type: Date, optional: true, label: 'End Date' }),
    config: field({ type: CollateralConfigSchema }),
    property: field({ type: CollateralPropertySchema })
  }),
  'erxes_collateralTypeSchema'
);

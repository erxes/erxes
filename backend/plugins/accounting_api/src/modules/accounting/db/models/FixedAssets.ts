import { Model } from 'mongoose';
import {
  IAdjustFixedAssetDocument,
  IAdjustFxaDetailDocument,
} from '../../@types/adjustFixedAsset';
import {
  adjustFixedAssetSchema,
  adjustFxaDetailSchema,
} from '../definitions/fixedAsset';

export type IAdjustFixedAssetModel = Model<IAdjustFixedAssetDocument>;

export type IAdjustFxaDetailModel = Model<IAdjustFxaDetailDocument>;

export const loadAdjustFixedAssetClass = () => adjustFixedAssetSchema;

export const loadAdjustFxaDetailClass = () => adjustFxaDetailSchema;

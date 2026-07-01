import { Model } from 'mongoose';
import { IFixedAssetDocument } from '../../@types/fixedAsset';
import { fixedAssetSchema } from '../definitions/fixedAsset';

export type IFixedAssetModel = Model<IFixedAssetDocument>;

export const loadFixedAssetClass = () => fixedAssetSchema;

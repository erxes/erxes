import { Model } from 'mongoose';
import { IFixedAssetCategoryDocument } from '../../@types/fixedAssetCategory';
import { fixedAssetCategorySchema } from '../definitions/fixedAssetCategory';

export type IFixedAssetCategoryModel = Model<IFixedAssetCategoryDocument>;

export const loadFixedAssetCategoryClass = () => fixedAssetCategorySchema;

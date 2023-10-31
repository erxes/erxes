import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import {
  IAssetCategoriesDocument,
  IAssetDocument,
  IMovementDocument,
  IMovementItemDocument
} from './common/types/asset';
import {
  IAssetCategoriesModel,
  loadAssetCategoriesClass
} from './models/AssetCategories';
import { IAssetModel, loadAssetClass } from './models/Assets';
import {
  IMovementItemModel,
  loadMovementItemClass
} from './models/MovementItems';
import { IMovementModel, loadMovementClass } from './models/Movements';

export interface IModels {
  Assets: IAssetModel;
  AssetCategories: IAssetCategoriesModel;
  Movements: IMovementModel;
  MovementItems: IMovementItemModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.Assets = db.model<IAssetDocument, IAssetModel>(
    'assets',
    loadAssetClass(models, subdomain)
  );
  models.AssetCategories = db.model<
    IAssetCategoriesDocument,
    IAssetCategoriesModel
  >('asset_categories', loadAssetCategoriesClass(models));
  models.Movements = db.model<IMovementDocument, IMovementModel>(
    'asset_movements',
    loadMovementClass(models)
  );
  models.MovementItems = db.model<IMovementItemDocument, IMovementItemModel>(
    'asset_movement_items',
    loadMovementItemClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);

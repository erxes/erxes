import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import {
  IAssetCategoriesDocument,
  IAssetDocument,
  IMovementDocument,
  IMovementItemDocument,
  IKBArticleHistoryDocument
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
import {
  IAssetKbArticlHistoriesModel,
  loadKBArticlHistoriesClass
} from './models/KBArticleHistories';
import { IDataLoaders } from './dataloaders';

export interface IModels {
  Assets: IAssetModel;
  AssetCategories: IAssetCategoriesModel;
  Movements: IMovementModel;
  MovementItems: IMovementItemModel;
  AssetsKbArticlesHistories: IAssetKbArticlHistoriesModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  dataLoaders: IDataLoaders;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.Assets = db.model<IAssetDocument, IAssetModel>(
    'assets',
    loadAssetClass(models, subdomain)
  );
  models.AssetCategories = db.model<
    IAssetCategoriesDocument,
    IAssetCategoriesModel
  >('asset_categories', loadAssetCategoriesClass(models));

  models.AssetsKbArticlesHistories = db.model<
    IKBArticleHistoryDocument,
    IAssetKbArticlHistoriesModel
  >(
    'assets_kb_articles_histories',
    loadKBArticlHistoriesClass(models, subdomain)
  );

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

export const generateModels = createGenerateModels<IModels>(loadClasses);

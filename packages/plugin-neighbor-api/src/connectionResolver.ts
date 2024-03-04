import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  INeighborItemDocument,
  INeighborDocument,
} from './models/definitions/neighbor'; //INeighborItemDocument INeighborDocument
import {
  INeighborModel,
  loadNeighborClass,
  INeighborItemModel,
  loadNeighborItemClass,
} from './models/models';
import { MongoClient } from 'mongodb';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Neighbor: INeighborModel;
  NeighborItem: INeighborItemModel;
}

export interface ICoreModels {
  Users: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = async (db: mongoose.Connection): Promise<IModels> => {
  const models = {} as IModels;

  models.Neighbor = db.model<INeighborDocument, INeighborModel>(
    'neighbors',
    loadNeighborClass(models),
  );

  models.NeighborItem = db.model<INeighborItemDocument, INeighborItemModel>(
    'neighbor_items',
    loadNeighborItemClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels(loadClasses);
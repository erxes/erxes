import { generateTopicModel, ITopicModel } from './topic';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import { Connection } from 'mongoose';
import { generateCategoryModel, ICategoryModel } from './category';
export interface IModels {
  Topic: ITopicModel;
  Category: ICategoryModel;
}

export let models: IModels | null = null;

export const generateModels = createGenerateModels<IModels>(
  models,
  (connection: Connection, subdomain: string): IModels => {
    models = {} as IModels;
    generateTopicModel(subdomain, connection, models);
    generateCategoryModel(subdomain, connection, models);
    return models;
  }
);

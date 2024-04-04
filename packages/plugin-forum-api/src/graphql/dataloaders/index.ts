import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { IModels } from '../../db/models';
import post from './post';

export interface IDataLoaders {
  post: DataLoader<string, any>;
}

export function generateAllDataLoaders(
  models: IModels,
  subdomain: string
): IDataLoaders {
  return {
    post: post(models)
  };
}

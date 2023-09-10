import DataLoader from 'dataloader';
import { IModels } from '../../connectionResolver';
import _ from 'underscore';
import user from './user';

export interface IDataLoaders {
  user: DataLoader<string, any>;
}

export function generateAllDataLoaders(models: IModels): IDataLoaders {
  return {
    user: user(models)
  };
}

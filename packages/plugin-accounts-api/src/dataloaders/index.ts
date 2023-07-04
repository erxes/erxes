import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import accountCategory from './accountCategory';
import { IModels } from '../connectionResolver';

export interface IDataLoaders {
  accountCategory: DataLoader<string, any>;
}

export function generateAllDataLoaders(
  models: IModels,
  subdomain: string
): IDataLoaders {
  return {
    accountCategory: accountCategory(models)
  };
}

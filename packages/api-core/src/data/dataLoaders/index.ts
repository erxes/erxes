import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import user from './user';

export interface IDataLoaders {
  user: DataLoader<string, any>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    user: user()
  };
}
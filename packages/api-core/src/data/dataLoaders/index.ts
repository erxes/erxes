import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import form from './form';
import user from './user';

export interface IDataLoaders {
  form: DataLoader<string, any>;
  user: DataLoader<string, any>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    form: form(),
    user: user()
  };
}
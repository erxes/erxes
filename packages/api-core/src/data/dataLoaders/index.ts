import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import form from './form';
import user from './user';
import segmentsBySubOf from './segmentsBySubOf';
import segment from './segment';

export interface IDataLoaders {
  form: DataLoader<string, any>;
  user: DataLoader<string, any>;
  segmentsBySubOf: DataLoader<string, any[]>;
  segment: DataLoader<string, any>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    form: form(),
    user: user(),
    segmentsBySubOf: segmentsBySubOf(),
    segment: segment()
  };
}

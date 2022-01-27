import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import productCategory from './productCategory';
import tag from './tag';
import form from './form';
import user from './user';
import segmentsBySubOf from './segmentsBySubOf';
import segment from './segment';

export interface IDataLoaders {
  productCategory: DataLoader<string, any>;
  tag: DataLoader<string, any>;
  form: DataLoader<string, any>;
  user: DataLoader<string, any>;
  segmentsBySubOf: DataLoader<string, any[]>;
  segment: DataLoader<string, any>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    productCategory: productCategory(),
    tag: tag(),
    form: form(),
    user: user(),
    segmentsBySubOf: segmentsBySubOf(),
    segment: segment()
  };
}

import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import productCategory from './productCategory';
import tag from './tag';
import company from './company';

export interface IDataLoaders {
  productCategory: DataLoader<string, any>;
  tag: DataLoader<string, any>;
  company: DataLoader<string, any>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    productCategory: productCategory(),
    tag: tag(),
    company: company(),
  };
}
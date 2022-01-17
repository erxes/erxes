import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import company from './company';
import customer from './customer';

export interface IDataLoaders {
  company: DataLoader<string, any>;
  customer: DataLoader<string, any>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    customer: customer(),
    company: company()
  };
}

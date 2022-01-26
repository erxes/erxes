import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import company from './company';
import customer from './customer';
import integration from './integration';
import user from './user';
import tag from './tag';
export interface IDataLoaders {
  company: DataLoader<string, any>;
  customer: DataLoader<string, any>;
  user: DataLoader<string, any>;
  integration: DataLoader<string, any>;
  tag: DataLoader<string, any>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    customer: customer(),
    user: user(),
    integration: integration(),
    tag: tag(),
    company: company()
  };
}

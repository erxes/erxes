import * as DataLoader from 'dataloader';
import accountCategory from './accountCategory';
import transaction from './transaction';
import trDetail from './trDetail';
import { IModels } from '../connectionResolver';

export interface IDataLoaders {
  accountCategory: DataLoader<string, any>;
  transaction: DataLoader<string, any>;
  trDetail: DataLoader<string, any>;
}

export function generateAllDataLoaders(
  models: IModels,
  subdomain: string,
): IDataLoaders {
  return {
    accountCategory: accountCategory(models),
    transaction: transaction(models),
    trDetail: trDetail(models)
  };
}

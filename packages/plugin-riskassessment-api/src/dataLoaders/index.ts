import * as DataLoader from 'dataloader';
import { IModels } from '../connectionResolver';

import categories from './category';
import riskAssessment from './riskAssessment';

export interface IDataLoaders {
  riskAssessment: DataLoader<string, any>;
  categories: DataLoader<string, any>;
}

export function generateAllDataLoaders(models: IModels, subdomain: string): IDataLoaders {
  return {
    riskAssessment: riskAssessment(models),
    categories: categories(models)
  };
}

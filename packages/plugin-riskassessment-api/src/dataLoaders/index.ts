import * as DataLoader from 'dataloader';
import { IModels } from '../connectionResolver';

import categories from './category';
import riskAssessment from './riskAssessment';
import user from './user';
import board from './board';
import pipeline from './pipeline';
import stage from './stage';
import field from './field';

export interface IDataLoaders {
  riskAssessment: DataLoader<string, any>;
  categories: DataLoader<string, any>;
  user: DataLoader<string, any>;
  board: DataLoader<string, any>;
  pipeline: DataLoader<string, any>;
  stage: DataLoader<string, any>;
  field: DataLoader<string, any>;
}

export function generateAllDataLoaders(models: IModels, subdomain: string): IDataLoaders {
  return {
    riskAssessment: riskAssessment(models),
    categories: categories(models),
    user: user(models, subdomain),
    board: board(models, subdomain),
    pipeline: pipeline(models, subdomain),
    stage: stage(models, subdomain),
    field: field(models, subdomain)
  };
}

import * as DataLoader from 'dataloader';
import { IModels } from '../connectionResolver';

import categories from './category';
import riskIndicator from './riskIndicator';
import user from './user';
import board from './board';
import pipeline from './pipeline';
import stage from './stage';
import field from './field';
import riskAssessments from './riskAssessment';

export interface IDataLoaders {
  riskIndicator: DataLoader<string, any>;
  riskAssessments: DataLoader<string, any>;
  categories: DataLoader<string, any>;
  user: DataLoader<string, any>;
  board: DataLoader<string, any>;
  pipeline: DataLoader<string, any>;
  stage: DataLoader<string, any>;
  field: DataLoader<string, any>;
}

export function generateAllDataLoaders(
  models: IModels,
  subdomain: string
): IDataLoaders {
  return {
    riskIndicator: riskIndicator(models),
    riskAssessments: riskAssessments(models),
    categories: categories(models),
    user: user(models, subdomain),
    board: board(models, subdomain),
    pipeline: pipeline(models, subdomain),
    stage: stage(models, subdomain),
    field: field(models, subdomain)
  };
}

import * as DataLoader from 'dataloader';
import { IModels } from '../connectionResolver';

import {
  generateDataLoaderCategories as categories,
  generateDataLoaderRiskIndicator as riskIndicator,
  generateDataLoaderUser as user,
  generateDataLoaderBoards as board,
  generateDataLoaderPipelines as pipeline,
  generateDataLoaderStages as stage,
  generateDataLoaderField as field,
  generateDataLoaderRiskAssessments as riskAssessments
} from './generateDataLoaders';

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

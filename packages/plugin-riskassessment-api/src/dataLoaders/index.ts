import * as DataLoader from 'dataloader';
import { IModels } from '../connectionResolver';

import {
  generateDataLoaderBoards as board,
  generateDataLoaderField as field,
  generateDataLoaderPipelines as pipeline,
  generateDataLoaderRiskAssessments as riskAssessments,
  generateDataLoaderRiskIndicator as riskIndicator,
  generateDataLoaderStages as stage,
  generateDataLoaderUser as user
} from './generateDataLoaders';

export interface IDataLoaders {
  riskIndicator: DataLoader<string, any>;
  riskAssessments: DataLoader<string, any>;
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
    user: user(models, subdomain),
    board: board(models, subdomain),
    pipeline: pipeline(models, subdomain),
    stage: stage(models, subdomain),
    field: field(models, subdomain)
  };
}

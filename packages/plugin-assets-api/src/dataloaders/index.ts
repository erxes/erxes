import * as DataLoader from 'dataloader';
import { IModels } from '../connectionResolver';
import asset from './asset';
import assetCategories from './assetCategory';
import branch from './branch';
import company from './company';
import customer from './customer';
import department from './department';
import teamMember from './teanMember';
import kbArticles from './kbArticle';
import kbCategory from './kbCategory';

export interface IDataLoaders {
  asset: DataLoader<string, any>;
  assetCategories: DataLoader<string, any>;
  company: DataLoader<string, any>;
  branch: DataLoader<string, any>;
  customer: DataLoader<string, any>;
  teamMember: DataLoader<string, any>;
  department: DataLoader<string, any>;
  kbArticles: DataLoader<string, any>;
  kbCategory: DataLoader<string, any>;
}

export function generateAllDataLoaders(
  models: IModels,
  subdomain: string
): IDataLoaders {
  return {
    assetCategories: assetCategories(models),
    asset: asset(models),
    company: company(subdomain),
    branch: branch(models, subdomain),
    customer: customer(models, subdomain),
    teamMember: teamMember(models, subdomain),
    department: department(models, subdomain),
    kbArticles: kbArticles(models, subdomain),
    kbCategory: kbCategory(models, subdomain)
  };
}

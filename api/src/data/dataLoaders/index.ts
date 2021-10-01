import * as DataLoader from 'dataloader';
import * as _ from 'underscore';
import { ICompanyDocument } from '../../db/models/definitions/companies';
import { IProductCategoryDocument } from '../../db/models/definitions/deals';
import { ITagDocument } from '../../db/models/definitions/tags';
import productCategory from './productCategory';
import tag from './tag';
import company from './company';

export interface IDataLoaders {
  productCategory: DataLoader<string, IProductCategoryDocument>;
  tag: DataLoader<string, ITagDocument>;
  company: DataLoader<string, ICompanyDocument>;
}

export function generateAllDataLoaders(): IDataLoaders {
  return {
    productCategory: productCategory(),
    tag: tag(),
    company: company()
  };
}

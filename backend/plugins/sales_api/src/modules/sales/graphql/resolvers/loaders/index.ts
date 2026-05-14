import DataLoader from 'dataloader';
import { IModels } from '~/connectionResolvers';
import { dealLoader } from './deal';
import { IPipeline } from '~/modules/sales/@types';

export interface IRef {
  __typename: string;
  _id: string;
}

export interface IDealLoader {
  customersByDealId: DataLoader<string, IRef[]>;
  companiesByDealId: DataLoader<string, IRef[]>;
  pipelineByDealId: DataLoader<string, IPipeline>;
}

export interface ILoaders {
  deal: IDealLoader;
}

export const createLoaders = (subdomain: string, models: IModels): ILoaders => ({
  deal: dealLoader(subdomain, models)
});
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { ICMSModel, loadCmsClass } from '@/cms/db/models/Cms';

import mongoose from 'mongoose';
import { IContentCMSDocument } from './modules/cms/@types/cms';

export interface IModels {
  CMS: ICMSModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.CMS = db.model<IContentCMSDocument, ICMSModel>(
    'content_cms',
    loadCmsClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);

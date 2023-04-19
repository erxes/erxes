import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import { IContentTypeDocument } from './models/definitions/contentTypes';
import { IContentTypeModel, loadTypeClass } from './models/ContentTypes';

import { IEntryModel, loadEntryClass } from './models/Entries';
import { IEntryDocument } from './models/definitions/entries';

import { IPageModel, loadPageClass } from './models/Pages';
import { IPageDocument } from './models/definitions/pages';

import { ITemplateModel, loadTemplateClass } from './models/Templates';
import { ITemplateDocument } from './models/definitions/templates';

import { ISiteModel, loadSiteClass } from './models/Sites';
import { ISiteDocument } from './models/definitions/sites';

export interface IModels {
  Sites: ISiteModel;
  Pages: IPageModel;
  ContentTypes: IContentTypeModel;
  Entries: IEntryModel;
  Templates: ITemplateModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;
  models.Sites = db.model<ISiteDocument, ISiteModel>(
    'digitalIncomeRoom_sites',
    loadSiteClass(models)
  );
  models.Pages = db.model<IPageDocument, IPageModel>(
    'digitalIncomeRoom_pages',
    loadPageClass(models)
  );

  models.ContentTypes = db.model<IContentTypeDocument, IContentTypeModel>(
    'digitalIncomeRoom_contenttypes',
    loadTypeClass(models)
  );

  models.Entries = db.model<IEntryDocument, IEntryModel>(
    'digitalIncomeRoom_entries',
    loadEntryClass(models)
  );

  models.Templates = db.model<ITemplateDocument, ITemplateModel>(
    'digitalIncomeRoom_templates',
    loadTemplateClass(models)
  );
  return models;
};
export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);

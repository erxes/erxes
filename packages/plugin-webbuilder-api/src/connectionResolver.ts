import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  IContentTypeDocument,
  IContentTypeModel,
  loadTypeClass
} from './models/contentTypes';
import { IEntryDocument, IEntryModel, loadEntryClass } from './models/entries';
import { IPageDocument, IPageModel, loadPageClass } from './models/pages';
import {
  ITemplateModel,
  loadTemplateClass,
  ITemplateDocument
} from './models/templates';
import { ISiteDocument, ISiteModel, loadSiteClass } from './models/sites';

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
    'webbuilder_sites',
    loadSiteClass(models)
  );

  models.Pages = db.model<IPageDocument, IPageModel>(
    'webbuilder_pages',
    loadPageClass(models)
  );

  models.ContentTypes = db.model<IContentTypeDocument, IContentTypeModel>(
    'webbuilder_contenttypes',
    loadTypeClass(models)
  );

  models.Entries = db.model<IEntryDocument, IEntryModel>(
    'webbuilder_entries',
    loadEntryClass(models)
  );

  models.Templates = db.model<ITemplateDocument, ITemplateModel>(
    'webbuilder_templates',
    loadTemplateClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);

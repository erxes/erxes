import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { ICategoryModel, loadCategoryClass } from './models/Categories';
import { IPostModel, loadPostClass } from './models/Posts';
import { IPostCategoryDocument } from './models/definitions/categories';
import { IPostDocument } from './models/definitions/posts';
import { IPageModel, loadPageClass } from './models/Pages';
import { IPageDocument } from './models/definitions/pages';
import { IPostTagModel, loadPostTagClass } from './models/Tags';
import { IPostTagDocument } from './models/definitions/tags';
import { IMenuItemModel, loadMenuItemClass } from './models/Menu';
import { IMenuItemDocument } from './models/definitions/menu';

export interface IModels {

  Categories: ICategoryModel;
  Posts: IPostModel;
  Pages: IPageModel;
  PostTags: IPostTagModel;
  MenuItems: IMenuItemModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  session: any;
  clientPortalId?: string;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Categories = db.model<IPostCategoryDocument, ICategoryModel>(
    'cms_categories',
    loadCategoryClass(models)
  );

  models.Posts = db.model<IPostDocument, IPostModel>(
    'cms_posts',
    loadPostClass(models)
  );

  models.Pages = db.model<IPageDocument, IPageModel>(
    'cms_pages',
    loadPageClass(models)
  );

  models.PostTags = db.model<IPostTagDocument, IPostTagModel>(
    'cms_tags',
    loadPostTagClass(models)
  );

  models.MenuItems = db.model<IMenuItemDocument, IMenuItemModel>(
    'cms_menu',
    loadMenuItemClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);

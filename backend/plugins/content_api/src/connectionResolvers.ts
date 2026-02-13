import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { ICMSModel, loadCmsClass } from '@/cms/db/models/Cms';

import mongoose from 'mongoose';
import {
  ICMSMenuDocument,
  ICMSPageDocument,
  IContentCMSDocument,
} from '@/cms/@types/cms';
import {
  IPostCategoryDocument,
  IPostDocument,
  IPostTagDocument,
} from '@/cms/@types/posts';
import { ITranslationDocument } from '@/cms/@types/translations';
import { IPostModel, loadPostClass } from '@/cms/db/models/Posts';
import {
  ITranslationModel,
  loadTranslationClass,
} from '@/cms/db/models/Translations';
import {
  ICustomPostTypeModel,
  loadCustomPostTypeClass,
} from '@/cms/db/models/CustomPostType';
import { ICustomFieldGroupDocument, ICustomPostTypeDocument } from '@/cms/@types/customPostType';
import { ICategoryModel, loadCategoryClass } from '@/cms/db/models/Categories';
import { IPostTagModel, loadPostTagClass } from '@/cms/db/models/Tag';
import { ICMSMenuItemModel, loadMenuItemClass } from '@/cms/db/models/Menu';
import { ICMSPageModel, loadPageClass } from '@/cms/db/models/Page';
import { ICustomFieldGroupModel, loadCustomFieldGroupClass } from '@/cms/db/models/FieldGroups';
import { IWebModel, loadWebClass } from './modules/webbuilder/db/models/Web';
import { IWebDocument } from './modules/webbuilder/@types/web';

export interface IModels {
  CMS: ICMSModel;
  Web: IWebModel;

  Posts: IPostModel;
  Translations: ITranslationModel;
  
  CustomPostTypes: ICustomPostTypeModel;
  CustomFieldGroups: ICustomFieldGroupModel;
  PostTags: IPostTagModel;
  MenuItems: ICMSMenuItemModel;
  Pages: ICMSPageModel;
  Categories: ICategoryModel;
}

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.CMS = db.model<IContentCMSDocument, ICMSModel>(
    'content_cms',
    loadCmsClass(models),
  );

  models.Posts = db.model<IPostDocument, IPostModel>(
    'cms_posts',
    loadPostClass(models),
  );

  models.Translations = db.model<ITranslationDocument, ITranslationModel>(
    'cms_translations',
    loadTranslationClass(models),
  );

  models.CustomPostTypes = db.model<
    ICustomPostTypeDocument,
    ICustomPostTypeModel
  >('cms_custom_post_types', loadCustomPostTypeClass(models));

  models.CustomFieldGroups = db.model<
    ICustomFieldGroupDocument,
    ICustomFieldGroupModel
  >('cms_custom_field_groups', loadCustomFieldGroupClass(models));

  models.Categories = db.model<IPostCategoryDocument, ICategoryModel>(
    'cms_categories',
    loadCategoryClass(models),
  );

  models.PostTags = db.model<IPostTagDocument, IPostTagModel>(
    'cms_tags',
    loadPostTagClass(models),
  );

  models.MenuItems = db.model<ICMSMenuDocument, ICMSMenuItemModel>(
    'cms_menu_items',
    loadMenuItemClass(models),
  );

  models.Pages = db.model<ICMSPageDocument, ICMSPageModel>(
    'cms_pages',
    loadPageClass(models),
  );

  models.Web = db.model<IWebDocument, IWebModel>(
    'web_builder',
    loadWebClass(models),
  )

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);

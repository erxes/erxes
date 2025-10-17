import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';

import mongoose from 'mongoose';

import {
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument,
} from '@/knowledgebase/@types/knowledgebase';
import {
  IArticleModel,
  ICategoryModel as IKnowledgeBaseCategoryModel,
  ITopicModel,
  loadArticleClass,
  loadCategoryClass,
  loadTopicClass,
} from '@/knowledgebase/db/models/Knowledgebase';
import { ICommentDocument } from '@/portal/@types/comment';
import { IPortalCompanyDocument } from '@/portal/@types/company';
import { ICustomFieldGroupDocument } from '@/portal/@types/customFieldGroup';
import { ICustomPostTypeDocument } from '@/portal/@types/customPostType';
import { IMenuItemDocument } from '@/portal/@types/menu';
import { INotificationDocument } from '@/portal/@types/notification';
import { IPageDocument } from '@/portal/@types/page';
import { IPortalDocument } from '@/portal/@types/portal';
import {
  IPostCategoryDocument,
  IPostDocument,
  IPostTagDocument,
} from '@/portal/@types/post';
import { ITranslationDocument } from '@/portal/@types/translations';
import { IUserDocument } from '@/portal/@types/user';
import { IUserCardDocument } from '@/portal/@types/userCard';
import { ICommentModel, loadCommentClass } from '@/portal/db/models/Comment';
import {
  IPortalCompanyModel,
  loadCompanyClass,
} from '@/portal/db/models/company';
import {
  ICustomPostTypeModel,
  loadCustomPostTypeClass,
} from '@/portal/db/models/CustomPostType';
import {
  ICustomFieldGroupModel,
  loadCustomFieldGroupClass,
} from '@/portal/db/models/FieldGroups';
import { IMenuItemModel, loadMenuItemClass } from '@/portal/db/models/Menu';
import {
  INotificationModel,
  loadNotificationClass,
} from '@/portal/db/models/Notifications';
import { IPageModel, loadPageClass } from '@/portal/db/models/Pages';
import { IPortalModel, loadPortalClass } from '@/portal/db/models/Portals';
import { IPostModel, loadPostClass } from '@/portal/db/models/Posts';
import { IPostTagModel, loadPostTagClass } from '@/portal/db/models/Tags';
import {
  ITranslationModel,
  loadTranslationClass,
} from '@/portal/db/models/Translations';
import { IUserModel, loadUserClass } from '@/portal/db/models/Users';
import {
  IUserCardModel,
  loadUserCardClass,
} from '@/portal/db/models/UsersCards';
import { ICategoryModel } from '@/portal/db/models/Categories';

export interface IModels {
  Portals: IPortalModel;
  Notifications: INotificationModel;
  Users: IUserModel;
  UserCards: IUserCardModel;
  Comments: ICommentModel;
  Companies: IPortalCompanyModel;

  KnowledgeBaseArticles: IArticleModel;
  KnowledgeBaseCategories: IKnowledgeBaseCategoryModel;
  KnowledgeBaseTopics: ITopicModel;

  CustomPostTypes: ICustomPostTypeModel;
  Categories: ICategoryModel;
  Posts: IPostModel;
  Translations: ITranslationModel;
  Pages: IPageModel;
  PostTags: IPostTagModel;
  MenuItems: IMenuItemModel;
  CustomFieldGroups: ICustomFieldGroupModel;
}

export interface IContext extends IMainContext {
  commonQuerySelector: any;
  models: IModels;
  portalUser: IUserDocument;
  session: any;
  clientPortalId?: string;
  isPassed2FA?: boolean;
  subdomain?: string;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Portals = db.model<IPortalDocument, IPortalModel>(
    'client_portals',
    loadPortalClass(models),
  );

  models.Notifications = db.model<INotificationDocument, INotificationModel>(
    'client_portal_notifications',
    loadNotificationClass(models),
  );

  models.Users = db.model<IUserDocument, IUserModel>(
    'client_portal_users',
    loadUserClass(models),
  );

  models.UserCards = db.model<IUserCardDocument, IUserCardModel>(
    'client_portal_user_cards',
    loadUserCardClass(models),
  );

  models.Comments = db.model<ICommentDocument, ICommentModel>(
    'client_portal_comments',
    loadCommentClass(models),
  );

  models.Companies = db.model<IPortalCompanyDocument, IPortalCompanyModel>(
    'client_portal_companies',
    loadCompanyClass(models),
  );

  models.KnowledgeBaseArticles = db.model<IArticleDocument, IArticleModel>(
    'knowledgebase_articles',
    loadArticleClass(models),
  );

  models.KnowledgeBaseCategories = db.model<
    ICategoryDocument,
    IKnowledgeBaseCategoryModel
  >('knowledgebase_categories', loadCategoryClass(models));

  models.KnowledgeBaseTopics = db.model<ITopicDocument, ITopicModel>(
    'knowledgebase_topics',
    loadTopicClass(models),
  );

  models.Categories = db.model<IPostCategoryDocument, ICategoryModel>(
    'cms_categories',
    loadCategoryClass(models),
  );

  models.Posts = db.model<IPostDocument, IPostModel>(
    'cms_posts',
    loadPostClass(models),
  );

  models.Translations = db.model<
    ITranslationDocument,
    ITranslationModel
  >('cms_post_translations', loadTranslationClass(models));

  models.Pages = db.model<IPageDocument, IPageModel>(
    'cms_pages',
    loadPageClass(models),
  );

  models.PostTags = db.model<IPostTagDocument, IPostTagModel>(
    'cms_tags',
    loadPostTagClass(models),
  );

  models.MenuItems = db.model<IMenuItemDocument, IMenuItemModel>(
    'cms_menu',
    loadMenuItemClass(models),
  );

  models.CustomPostTypes = db.model<
    ICustomPostTypeDocument,
    ICustomPostTypeModel
  >('cms_custom_post_types', loadCustomPostTypeClass(models));

  models.CustomFieldGroups = db.model<
    ICustomFieldGroupDocument,
    ICustomFieldGroupModel
  >('cms_custom_field_groups', loadCustomFieldGroupClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);

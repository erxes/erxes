import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IArticleDocument, ICategoryDocument, ITopicDocument } from './models/definitions/knowledgebase';
import { IArticleModel, ICategoryModel, ITopicModel, loadArticleClass, loadCategoryClass, loadTopicClass } from './models/KnowledgeBase';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { userSchema } from '@erxes/api-utils/src/definitions/users';

export interface ICoreIModels {
  Users;
}
export interface IModels {
  KnowledgeBaseArticles: IArticleModel;
  KnowledgeBaseCategories: ICategoryModel;
  KnowledgeBaseTopics: ITopicModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb);

  return models;
};

const connectCore = async () => {
  if(coreModels) {
    return coreModels;
  }

  return {
    Users: await mainDb.model('users', userSchema)
  }
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.KnowledgeBaseArticles = db.model<IArticleDocument, IArticleModel>('knowledgebase_articles', loadArticleClass(models));

  models.KnowledgeBaseCategories = db.model<ICategoryDocument, ICategoryModel>(
      'knowledgebase_categories',
      loadCategoryClass(models)
    );

  models.KnowledgeBaseTopics = db.model<ITopicDocument, ITopicModel>(
      'knowledgebase_topics',
      loadTopicClass(models)
    )

  return models;
};
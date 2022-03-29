import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IArticleDocument, ICategoryDocument, ITopicDocument } from './models/definitions/knowledgebase';
import { IArticleModel, ICategoryModel, ITopicModel, loadArticleClass, loadCategoryClass, loadTopicClass } from './models/KnowledgeBase';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { userSchema } from '@erxes/api-utils/src/definitions/users';

export interface IModels {
  KnowledgeBaseArticles: IArticleModel;
  KnowledgeBaseCategories: ICategoryModel;
  KnowledgeBaseTopics: ITopicModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb);

  return models;
};

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
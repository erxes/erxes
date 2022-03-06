import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IArticleDocument, ICategoryDocument, ITopicDocument } from './models/definitions/knowledgebase';
import { IArticleModel, ICategoryModel, ITopicModel, loadArticleClass, loadCategoryClass, loadTopicClass } from './models/KnowledgeBase';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface ICoreIModels {
  Brands;
  Users;
  Fields;
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
  const url = process.env.API_MONGO_URL || '';
  const client = new MongoClient(url);

  const dbName = 'erxes';

  let db;

  await client.connect();

  console.log('Connected successfully to server');

  db = client.db(dbName);

  return {
    Brands: await db.collection('brands'),
    Users: await db.collection('users'),
    Fields: await db.collection('form_fields')
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
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  articleSchema,
  categorySchema,
  IArticle,
  IArticleDocument,
  ICategory,
  ICategoryDocument,
  ITopic,
  ITopicDocument,
  topicSchema
} from './definitions/knowledgebase';

export interface IArticleCreate extends IArticle {
  userId?: string;
  icon?: string;
  modifiedBy?: string;
}

export interface IArticleModel extends Model<IArticleDocument> {
  getArticle(_id: string): Promise<IArticleDocument>;
  createDoc(fields: IArticleCreate, userId?: string): Promise<IArticleDocument>;
  updateDoc(
    _id: string,
    fields: IArticleCreate,
    userId?: string
  ): Promise<IArticleDocument>;
  removeDoc(_id: string): void;
  modifyReactionCount(
    articleId: string,
    reactionChoice: string,
    modifyType: 'inc' | 'dec'
  ): void;
}

export const loadArticleClass = (models: IModels) => {
  class Article {
    public static async getArticle(_id: string) {
      const article = await models.KnowledgeBaseArticles.findOne({ _id });

      if (!article) {
        throw new Error('Knowledge base article not found');
      }

      return article;
    }

    /**
     * Create KnowledgeBaseArticle document
     */
    public static async createDoc(docFields: IArticleCreate, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const article = await models.KnowledgeBaseArticles.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });

      return article;
    }

    /**
     * Update KnowledgeBaseArticle document
     */
    public static async updateDoc(
      _id: string,
      docFields: IArticleCreate,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await models.KnowledgeBaseArticles.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            modifiedBy: userId,
            modifiedDate: new Date()
          }
        }
      );

      const article = await models.KnowledgeBaseArticles.getArticle(_id);

      return article;
    }

    /**
     * Removes KnowledgeBaseArticle document
     */
    public static removeDoc(_id: string) {
      return models.KnowledgeBaseArticles.deleteOne({ _id });
    }

    /*
     * Modify form view count
     */
    public static async modifyReactionCount(
      articleId: string,
      reactionChoice: string,
      modifyType: 'inc' | 'dec'
    ) {
      const article = await models.KnowledgeBaseArticles.getArticle(articleId);

      const reactionCounts = article.reactionCounts || {};

      reactionCounts[reactionChoice] =
        (reactionCounts[reactionChoice] || 0) + (modifyType === 'inc' ? 1 : -1);

      await models.KnowledgeBaseArticles.updateOne(
        { _id: articleId },
        { $set: { reactionCounts } }
      );
    }
  }

  articleSchema.loadClass(Article);

  return articleSchema;
};

export interface ICategoryCreate extends ICategory {
  userId?: string;
}

export interface ICategoryModel extends Model<ICategoryDocument> {
  getCategory(_id: string): Promise<ICategoryDocument>;
  createDoc(
    docFields: ICategoryCreate,
    userId?: string
  ): Promise<ICategoryDocument>;
  updateDoc(
    _id: string,
    docFields: ICategoryCreate,
    userId?: string
  ): Promise<ICategoryDocument>;
  removeDoc(categoryId: string): void;
}

export const loadCategoryClass = (models: IModels) => {
  class Category {
    public static async getCategory(_id: string) {
      const category = await models.KnowledgeBaseCategories.findOne({ _id });

      if (!category) {
        throw new Error('Knowledge base category not found');
      }

      return category;
    }

    /**
     * Create KnowledgeBaseCategory document
     */
    public static async createDoc(docFields: ICategoryCreate, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const category = await models.KnowledgeBaseCategories.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });

      return category;
    }

    /**
     * Update KnowledgeBaseCategory document
     */
    public static async updateDoc(
      _id: string,
      docFields: ICategoryCreate,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const parentId = docFields.parentCategoryId;

      if (parentId) {
        if (_id === parentId) {
          throw new Error('Cannot change category');
        }

        const childrenCounts = await models.KnowledgeBaseCategories.countDocuments({
          parentCategoryId: _id
        });

        if (childrenCounts > 0) {
          throw new Error('Cannot change category. this is parent tag');
        }
      }

      await models.KnowledgeBaseCategories.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            modifiedBy: userId,
            modifiedDate: new Date()
          }
        }
      );

      const category = await models.KnowledgeBaseCategories.getCategory(_id);

      return category;
    }

    /**
     * Removes KnowledgeBaseCategory document and it's children articles
     */
    public static async removeDoc(_id: string) {
      const category = await models.KnowledgeBaseCategories.findOne({ _id });

      if (!category) {
        throw new Error('Category not found');
      }

      await models.KnowledgeBaseArticles.deleteMany({
        categoryId: _id
      });

      return models.KnowledgeBaseCategories.deleteOne({ _id });
    }
  }

  categorySchema.loadClass(Category);

  return categorySchema;
};

export interface ITopicModel extends Model<ITopicDocument> {
  getTopic(_id: string): Promise<ITopicDocument>;
  createDoc(docFields: ITopic, userId?: string): Promise<ITopicDocument>;
  updateDoc(
    _id: string,
    docFields: ITopic,
    userId?: string
  ): Promise<ITopicDocument>;
  removeDoc(_id: string): void;
}

export const loadTopicClass = (models: IModels) => {
  class Topic {
    public static async getTopic(_id: string) {
      const topic = await models.KnowledgeBaseTopics.findOne({ _id });

      if (!topic) {
        throw new Error('Knowledge base topic not found');
      }

      return topic;
    }
    /**
     * Create KnowledgeBaseTopic document
     */
    public static createDoc(docFields: ITopic, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      return models.KnowledgeBaseTopics.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });
    }

    /**
     * Update KnowledgeBaseTopic document
     */
    public static async updateDoc(
      _id: string,
      docFields: ITopic,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await models.KnowledgeBaseTopics.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            modifiedBy: userId,
            modifiedDate: new Date()
          }
        }
      );

      return models.KnowledgeBaseTopics.findOne({ _id });
    }

    /**
     * Removes KnowledgeBaseTopic document and it's children categories
     */
    public static async removeDoc(_id: string) {
      const topic = await models.KnowledgeBaseTopics.findOne({ _id });

      if (!topic) {
        throw new Error('Topic not found');
      }

      // remove child items ===========
      const categories = await models.KnowledgeBaseCategories.find({
        topicId: _id
      });

      for (const category of categories) {
        await models.KnowledgeBaseCategories.removeDoc(category._id);
      }

      return models.KnowledgeBaseTopics.deleteOne({ _id });
    }
  }

  topicSchema.loadClass(Topic);

  return topicSchema;
};
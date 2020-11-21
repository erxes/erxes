import { Model, model } from 'mongoose';
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
  categoryIds?: string[];
  userId?: string;
  icon?: string;
}

export interface IArticleModel extends Model<IArticleDocument> {
  getArticle(_id: string): Promise<IArticleDocument>;
  createDoc(
    { categoryIds, ...docFields }: IArticleCreate,
    userId?: string
  ): Promise<IArticleDocument>;
  updateDoc(
    _id: string,
    { categoryIds, ...docFields }: IArticleCreate,
    userId?: string
  ): Promise<IArticleDocument>;
  removeDoc(_id: string): void;
  incReactionCount(articleId: string, reactionChoice): void;
}

export const loadArticleClass = () => {
  class Article {
    public static async getArticle(_id: string) {
      const article = await KnowledgeBaseArticles.findOne({ _id });

      if (!article) {
        throw new Error('Knowledge base article not found');
      }

      return article;
    }

    /**
     * Create KnowledgeBaseArticle document
     */
    public static async createDoc(
      { categoryIds, ...docFields }: IArticleCreate,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const article = await KnowledgeBaseArticles.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });

      // add new article id to categories's articleIds field
      if ((categoryIds || []).length > 0) {
        const categories = await KnowledgeBaseCategories.find({
          _id: { $in: categoryIds }
        });

        for (const category of categories) {
          const articleIds = category.toJSON().articleIds || [];

          articleIds.push(article._id.toString());

          category.articleIds = articleIds;

          await category.save();
        }
      }

      return article;
    }

    /**
     * Update KnowledgeBaseArticle document
     */
    public static async updateDoc(
      _id: string,
      { categoryIds, ...docFields }: IArticleCreate,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await KnowledgeBaseArticles.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            modifiedBy: userId,
            modifiedDate: new Date()
          }
        }
      );

      const article = await KnowledgeBaseArticles.getArticle(_id);

      // add new article id to categories's articleIds field
      if ((categoryIds || []).length > 0) {
        const categories = await KnowledgeBaseCategories.find({
          _id: { $in: categoryIds }
        });

        for (const category of categories) {
          const articleIds = category.toJSON().articleIds || [];

          // check previous entry
          if (!articleIds.includes(article._id)) {
            articleIds.push(article._id);

            category.articleIds = articleIds;

            await category.save();
          }
        }
      }

      return article;
    }

    /**
     * Removes KnowledgeBaseArticle document
     */
    public static removeDoc(_id: string) {
      return KnowledgeBaseArticles.deleteOne({ _id });
    }

    /*
     * Increase form view count
     */
    public static async incReactionCount(
      articleId: string,
      reactionChoice: string
    ) {
      const article = await KnowledgeBaseArticles.findOne({ _id: articleId });

      if (!article) {
        throw new Error('Article not found');
      }

      const reactionCounts = article.reactionCounts || {};

      reactionCounts[reactionChoice] =
        (reactionCounts[reactionChoice] || 0) + 1;

      await KnowledgeBaseArticles.updateOne(
        { _id: articleId },
        { $set: { reactionCounts } }
      );
    }
  }

  articleSchema.loadClass(Article);

  return articleSchema;
};

export interface ICategoryCreate extends ICategory {
  topicIds?: string[];
  userId?: string;
}

export interface ICategoryModel extends Model<ICategoryDocument> {
  getCategory(_id: string): Promise<ICategoryDocument>;
  createDoc(
    { topicIds, ...docFields }: ICategoryCreate,
    userId?: string
  ): Promise<ICategoryDocument>;
  updateDoc(
    _id: string,
    { topicIds, ...docFields }: ICategoryCreate,
    userId?: string
  ): Promise<ICategoryDocument>;
  removeDoc(categoryId: string): void;
}

export const loadCategoryClass = () => {
  class Category {
    public static async getCategory(_id: string) {
      const category = await KnowledgeBaseCategories.findOne({ _id });

      if (!category) {
        throw new Error('Knowledge base category not found');
      }

      return category;
    }

    /**
     * Create KnowledgeBaseCategory document
     */
    public static async createDoc(
      { topicIds, ...docFields }: ICategoryCreate,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      const category = await KnowledgeBaseCategories.create({
        ...docFields,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });

      if ((topicIds || []).length > 0) {
        const topics = await KnowledgeBaseTopics.find({
          _id: { $in: topicIds }
        });

        // add new category to topics's categoryIds field
        for (const topic of topics) {
          const categoryIds = topic.toJSON().categoryIds || [];

          categoryIds.push(category._id.toString());

          topic.categoryIds = categoryIds;

          await topic.save();
        }
      }

      return category;
    }

    /**
     * Update KnowledgeBaseCategory document
     */
    public static async updateDoc(
      _id: string,
      { topicIds, ...docFields }: ICategoryCreate,
      userId?: string
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      await KnowledgeBaseCategories.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            modifiedBy: userId,
            modifiedDate: new Date()
          }
        }
      );

      const category = await KnowledgeBaseCategories.getCategory(_id);

      if ((topicIds || []).length > 0) {
        const topics = await KnowledgeBaseTopics.find({
          _id: { $in: topicIds }
        });

        for (const topic of topics) {
          const categoryIds = topic.categoryIds || [];

          // add categoryId to topics's categoryIds list
          if (!categoryIds.includes(category._id.toString())) {
            categoryIds.push(category._id.toString());

            topic.categoryIds = categoryIds;

            await topic.save();
          }
        }
      }

      return category;
    }

    /**
     * Removes KnowledgeBaseCategory document and it's children articles
     */
    public static async removeDoc(_id: string) {
      const category = await KnowledgeBaseCategories.findOne({ _id });

      if (!category) {
        throw new Error('Category not found');
      }

      await KnowledgeBaseArticles.deleteMany({
        _id: { $in: category.articleIds || [] }
      });

      return KnowledgeBaseCategories.deleteOne({ _id });
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

export const loadTopicClass = () => {
  class Topic {
    public static async getTopic(_id: string) {
      const topic = await KnowledgeBaseTopics.findOne({ _id });

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

      return KnowledgeBaseTopics.create({
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

      await KnowledgeBaseTopics.updateOne(
        { _id },
        {
          $set: {
            ...docFields,
            modifiedBy: userId,
            modifiedDate: new Date()
          }
        }
      );

      return KnowledgeBaseTopics.findOne({ _id });
    }

    /**
     * Removes KnowledgeBaseTopic document and it's children categories
     */
    public static async removeDoc(_id: string) {
      const topic = await KnowledgeBaseTopics.findOne({ _id });

      if (!topic) {
        throw new Error('Topic not found');
      }

      // remove child items ===========
      const categories = await KnowledgeBaseCategories.find({
        _id: { $in: topic.categoryIds }
      });
      for (const category of categories) {
        await KnowledgeBaseCategories.removeDoc(category._id);
      }

      return KnowledgeBaseTopics.deleteOne({ _id });
    }
  }

  topicSchema.loadClass(Topic);

  return topicSchema;
};

loadArticleClass();
loadCategoryClass();
loadTopicClass();

// tslint:disable-next-line
export const KnowledgeBaseArticles = model<IArticleDocument, IArticleModel>(
  'knowledgebase_articles',
  articleSchema
);

// tslint:disable-next-line
export const KnowledgeBaseCategories = model<ICategoryDocument, ICategoryModel>(
  'knowledgebase_categories',
  categorySchema
);

// tslint:disable-next-line
export const KnowledgeBaseTopics = model<ITopicDocument, ITopicModel>(
  'knowledgebase_topics',
  topicSchema
);

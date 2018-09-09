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
  topicSchema,
} from './definitions/knowledgebase';

export interface IArticleCreate extends IArticle {
  categoryIds?: string[];
  userId?: string;
  icon?: string;
}

interface IArticleModel extends Model<IArticleDocument> {
  createDoc({ categoryIds, ...docFields }: IArticleCreate, userId?: string): Promise<IArticleDocument>;

  updateDoc(_id: string, { categoryIds, ...docFields }: IArticleCreate, userId?: string): Promise<IArticleDocument>;

  removeDoc(_id: string): void;
}

class Article {
  /**
   * Create KnowledgeBaseArticle document
   */
  public static async createDoc({ categoryIds, ...docFields }: IArticleCreate, userId?: string) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    const article = await KnowledgeBaseArticles.create({
      ...docFields,
      createdDate: new Date(),
      createdBy: userId,
      modifiedDate: new Date(),
    });

    // add new article id to categories's articleIds field
    if ((categoryIds || []).length > 0) {
      const categories = await KnowledgeBaseCategories.find({
        _id: { $in: categoryIds },
      });

      for (const category of categories) {
        if (!category.articleIds) {
          category.articleIds = [];
        }

        category.articleIds.push(article._id.toString());

        await category.save();
      }
    }

    return article;
  }

  /**
   * Update KnowledgeBaseArticle document
   */
  public static async updateDoc(_id: string, { categoryIds, ...docFields }: IArticleCreate, userId?: string) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    await KnowledgeBaseArticles.update(
      { _id },
      {
        $set: {
          ...docFields,
          modifiedBy: userId,
          modifiedDate: new Date(),
        },
      },
    );

    const article = await KnowledgeBaseArticles.findOne({ _id });

    if (!article) {
      throw new Error('Article not found');
    }

    // add new article id to categories's articleIds field
    if ((categoryIds || []).length > 0) {
      const categories = await KnowledgeBaseCategories.find({
        _id: { $in: categoryIds },
      });

      for (const category of categories) {
        const articleIds = category.articleIds || [];

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
    return KnowledgeBaseArticles.remove({ _id });
  }
}

export interface ICategoryCreate extends ICategory {
  topicIds?: string[];
  userId?: string;
}

interface ICategoryModel extends Model<ICategoryDocument> {
  createDoc({ topicIds, ...docFields }: ICategoryCreate, userId?: string): Promise<ICategoryDocument>;

  updateDoc(_id: string, { topicIds, ...docFields }: ICategoryCreate, userId?: string): Promise<ICategoryDocument>;

  removeDoc(categoryId: string): void;
}

class Category {
  /**
   * Create KnowledgeBaseCategory document
   */
  public static async createDoc({ topicIds, ...docFields }: ICategoryCreate, userId?: string) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    const category = await KnowledgeBaseCategories.create({
      ...docFields,
      createdDate: new Date(),
      createdBy: userId,
      modifiedDate: new Date(),
    });

    if ((topicIds || []).length > 0) {
      const topics = await KnowledgeBaseTopics.find({ _id: { $in: topicIds } });

      // add new category to topics's categoryIds field
      for (const topic of topics) {
        const categoryIds = topic.categoryIds || [];

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
  public static async updateDoc(_id: string, { topicIds, ...docFields }: ICategoryCreate, userId?: string) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    await KnowledgeBaseCategories.update(
      { _id },
      {
        $set: {
          ...docFields,
          modifiedBy: userId,
          modifiedDate: new Date(),
        },
      },
    );

    const category = await KnowledgeBaseCategories.findOne({ _id });

    if (!category) {
      throw new Error('Category not found');
    }

    if ((topicIds || []).length > 0) {
      const topics = await KnowledgeBaseTopics.find({ _id: { $in: topicIds } });

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

    for (const articleId of category.articleIds || []) {
      await KnowledgeBaseArticles.remove({ _id: articleId });
    }

    return KnowledgeBaseCategories.remove({ _id });
  }
}

interface ITopicModel extends Model<ITopicDocument> {
  createDoc(docFields: ITopic, userId?: string): Promise<ITopicDocument>;

  updateDoc(_id: string, docFields: ITopic, userId?: string): Promise<ITopicDocument>;

  removeDoc(_id: string): void;
}

class Topic {
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
      modifiedDate: new Date(),
    });
  }

  /**
   * Update KnowledgeBaseTopic document
   */
  public static async updateDoc(_id: string, docFields: ITopic, userId?: string) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    await KnowledgeBaseTopics.update(
      { _id },
      {
        $set: {
          ...docFields,
          modifiedBy: userId,
          modifiedDate: new Date(),
        },
      },
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
    for (const categoryId of topic.categoryIds || []) {
      const category = await KnowledgeBaseCategories.findOne({
        _id: categoryId,
      });

      if (category) {
        await KnowledgeBaseCategories.removeDoc(categoryId);
      }
    }

    return KnowledgeBaseTopics.remove({ _id });
  }
}

articleSchema.loadClass(Article);

export const KnowledgeBaseArticles = model<IArticleDocument, IArticleModel>('knowledgebase_articles', articleSchema);

categorySchema.loadClass(Category);

export const KnowledgeBaseCategories = model<ICategoryDocument, ICategoryModel>(
  'knowledgebase_categories',
  categorySchema,
);

topicSchema.loadClass(Topic);

export const KnowledgeBaseTopics = model<ITopicDocument, ITopicModel>('knowledgebase_topics', topicSchema);

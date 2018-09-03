import { Model, model } from "mongoose";
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
} from "./definitions/knowledgebase";

interface IArticleCreate extends IArticle {
  categoryIds?: string[];
}

interface IArticleModel extends Model<IArticleDocument> {
  createDoc(
    { categoryIds, ...docFields }: IArticleCreate,
    userId: string
  ): Promise<IArticleDocument>;

  updateDoc(
    _id: string,
    { categoryIds, ...docFields }: IArticleCreate,
    userId: string
  ): Promise<IArticleDocument>;

  removeDoc(_id: string): void;
}

class Article {
  /**
   * Create KnowledgeBaseArticle document
   */
  public static async createDoc(
    { categoryIds, ...docFields }: IArticleCreate,
    userId: string
  ) {
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
        category.articleIds.push(article._id.toString());

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
    userId: string
  ) {
    await KnowledgeBaseArticles.update(
      { _id },
      {
        $set: {
          ...docFields,
          modifiedBy: userId,
          modifiedDate: new Date()
        }
      }
    );

    const article = await KnowledgeBaseArticles.findOne({ _id });

    // add new article id to categories's articleIds field
    if ((categoryIds || []).length > 0) {
      const categories = await KnowledgeBaseCategories.find({
        _id: { $in: categoryIds }
      });

      for (const category of categories) {
        // check previous entry
        if (!category.articleIds.includes(article._id.toString())) {
          category.articleIds.push(article._id.toString());

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

interface ICategoryCreate extends ICategory {
  topicIds?: string[];
}

interface ICategoryModel extends Model<ICategoryDocument> {
  createDoc(
    { topicIds, ...docFields }: ICategoryCreate,
    userId
  ): Promise<ICategoryDocument>;

  updateDoc(
    _id: string,
    { topicIds, ...docFields }: ICategoryCreate,
    userId: string
  ): Promise<ICategoryDocument>;

  removeDoc(categoryId: string): void;
}

class Category {
  /**
   * Create KnowledgeBaseCategory document
   */
  public static async createDoc(
    { topicIds, ...docFields }: ICategoryCreate,
    userId
  ) {
    const category = await KnowledgeBaseCategories.create({
      ...docFields,
      createdDate: new Date(),
      createdBy: userId,
      modifiedDate: new Date()
    });

    if ((topicIds || []).length > 0) {
      const topics = await KnowledgeBaseTopics.find({ _id: { $in: topicIds } });

      // add new category to topics's categoryIds field
      for (const topic of topics) {
        topic.categoryIds.push(category._id.toString());

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
    userId: string
  ) {
    await KnowledgeBaseCategories.update(
      { _id },
      {
        $set: {
          ...docFields,
          modifiedBy: userId,
          modifiedDate: new Date()
        }
      }
    );

    const category = await KnowledgeBaseCategories.findOne({ _id });

    if ((topicIds || []).length > 0) {
      const topics = await KnowledgeBaseTopics.find({ _id: { $in: topicIds } });

      for (const topic of topics) {
        // add categoryId to topics's categoryIds list
        if (!topic.categoryIds.includes(category._id.toString())) {
          topic.categoryIds.push(category._id.toString());

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

    for (const articleId of category.articleIds || []) {
      await KnowledgeBaseArticles.remove({ _id: articleId });
    }

    return KnowledgeBaseCategories.remove({ _id });
  }
}

interface ITopicModel extends Model<ITopicDocument> {
  createDoc(docFields: ITopic, userId: string): Promise<ITopicDocument>;

  updateDoc(
    _id: string,
    docFields: ITopic,
    userId: string
  ): Promise<ITopicDocument>;

  removeDoc(_id: string): void;
}

class Topic {
  /**
   * Create KnowledgeBaseTopic document
   */
  public static createDoc(docFields: ITopic, userId: string) {
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
  public static updateDoc(_id: string, docFields: ITopic, userId: string) {
    return KnowledgeBaseTopics.update(
      { _id },
      {
        $set: {
          ...docFields,
          modifiedBy: userId,
          modifiedDate: new Date()
        }
      }
    );
  }

  /**
   * Removes KnowledgeBaseTopic document and it's children categories
   */
  public static async removeDoc(_id: string) {
    const topic = await KnowledgeBaseTopics.findOne({ _id });

    // remove child items ===========
    for (const categoryId of topic.categoryIds || []) {
      const category = await KnowledgeBaseCategories.findOne({
        _id: categoryId
      });

      if (category) {
        await KnowledgeBaseCategories.removeDoc(categoryId);
      }
    }

    return KnowledgeBaseTopics.remove({ _id });
  }
}

articleSchema.loadClass(Article);

export const KnowledgeBaseArticles = model<IArticleDocument, IArticleModel>(
  "knowledgebase_articles",
  articleSchema
);

categorySchema.loadClass(Category);

export const KnowledgeBaseCategories = model<ICategoryDocument, ICategoryModel>(
  "knowledgebase_categories",
  categorySchema
);

topicSchema.loadClass(Topic);

export const KnowledgeBaseTopics = model<ITopicDocument, ITopicModel>(
  "knowledgebase_topics",
  topicSchema
);

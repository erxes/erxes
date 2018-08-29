import { Model, model } from "mongoose";
import {
  articleSchema,
  categorySchema,
  IArticleDocument,
  ICategoryDocument,
  ITopicDocument,
  topicSchema
} from "./definitions/knowledgebase";

/**
 * Base class for Knowledge base classes
 */
class KnowledgeBaseCommonDocument {
  /**
   * Create document with given parameters, also set createdBy by given
   * userId and also check if its supplied
   * @param {Object} doc - Knowledge base document object
   * @param {string} userId - User id of the creator of this document
   * @return {Promise} - returns Promise resolving newly added document
   * @throws {Error} - throws Error('userId must be supplied') if the userId is not supplied
   */
  public static createBaseDoc(doc, userId) {
    if (!userId) {
      throw new Error("userId must be supplied");
    }

    return this.create({
      ...doc,
      createdDate: new Date(),
      createdBy: userId,
      modifiedDate: new Date()
    });
  }

  /**
   * Update knowledge base document
   * @param {string} - Id of the document
   * @param {Object} - Document Object
   * @param {string} - The user id of the modifier
   * @return {Promsie} - returns Promise resolving updated document
   */
  public static async updateBaseDoc(_id, doc, userId) {
    if (!userId) {
      throw new Error("userId must be supplied");
    }

    await this.update(
      { _id },
      {
        $set: {
          ...doc,
          modifiedBy: userId,
          modifiedDate: new Date()
        }
      }
    );

    return this.findOne({ _id });
  }
}

interface IArticleModel extends Model<IArticleDocument> {}

class Article extends KnowledgeBaseCommonDocument {
  /**
   * Create KnowledgeBaseArticle document
   * @param {Object} doc - KnowledgeBaseArticle object
   * @param {string} doc.title - KnowledgeBaseArticle title
   * @param {string} doc.summary - KnowledgeBaseArticle summary
   * @param {string} doc.content - KnowledgeBaseArticle content
   * @param {string} doc.status - KnowledgeBaseArticle status (currently: 'draft' or 'publish')
   * @param {string[]} doc.categoryIds - list of parent Category ids
   * @param {string} userId - User id of the creator of this document
   * @return {Promise} - returns Promise resolving created document
   */
  public static async createDoc({ categoryIds, ...docFields }, userId) {
    const article = await this.createBaseDoc(docFields, userId);

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
   * @param {Object} _id - KnowldegeBaseArticle document id
   * @param {Object} doc - KnowledgeBaseArticle object
   * @param {string} doc.title - KnowledgeBaseArticle title
   * @param {string} doc.summary - KnowledgeBaseArticle summary
   * @param {string} doc.content - KnowledgeBaseArticle content
   * @param {string} doc.status - KnowledgeBaseArticle status (currently: 'draft' or 'publish')
   * @param {string[]} doc.categoryIds - list of parent Category ids
   * @param {string} userId - User id of the modifier of this document
   * @return {Promise} - returns Promise resolving modified document
   */
  public static async updateDoc(_id, { categoryIds, ...docFields }, userId) {
    await this.updateBaseDoc({ _id }, docFields, userId);

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
   * @param {Object} _id - KnowldegeBaseArticle document id
   * @return {Promise}
   */
  public static removeDoc(_id) {
    return KnowledgeBaseArticles.remove({ _id });
  }
}

interface ICategoryModel extends Model<ICategoryDocument> {
  removeDoc(categoryId: string): void;
}

class Category extends KnowledgeBaseCommonDocument {
  /**
   * Create KnowledgeBaseCategory document
   * @param {Object} doc - KnowledgeBaseCategory object
   * @param {string} doc.title - KnowledgeBaseCategory title
   * @param {string} doc.description - KnowledgeBaseCategory description
   * @param {string[]} doc.articleIds - KnowledgeBaseCategory articleIds
   * @param {string} doc.icon - Select icon name
   * @param {string} userId - User id of the creator of this document
   * @param {string[]} doc.topicIds - list of parent Topic ids
   * @return {Promise} - returns Promise resolving created document
   */
  public static async createDoc({ topicIds, ...docFields }, userId) {
    const category = await this.createBaseDoc(docFields, userId);

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
   * @param {Object} _id - KnowledgeBaseCategory document id
   * @param {Object} doc - KnowledgeBaseCategory object
   * @param {string} doc.title - KnowledgeBaseCategory title
   * @param {string} doc.description - KnowledgeBaseCategory description
   * @param {string[]} doc.articleIds - KnowledgeBaseCategory articleIds
   * @param {string} doc.icon - Select icon name
   * @param {string[]} doc.topicIds - list of parent Topic ids
   * @param {string} userId - User id of the modifier of this document
   * @param {string} topicId - parentTopicId
   * @return {Promise} - returns Promise resolving modified document
   */
  public static async updateDoc(_id, { topicIds, ...docFields }, userId) {
    await this.updateBaseDoc({ _id }, docFields, userId);

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
   * @param {Object} _id - KnowledgeBaseCategory document id
   * @return {Promise}
   */
  public static async removeDoc(_id) {
    const category = await KnowledgeBaseCategories.findOne({ _id });

    for (const articleId of category.articleIds || []) {
      await KnowledgeBaseArticles.remove({ _id: articleId });
    }

    return KnowledgeBaseCategories.remove({ _id });
  }
}

interface ITopicModel extends Model<ITopicDocument> {}

class Topic extends KnowledgeBaseCommonDocument {
  /**
   * Create KnowledgeBaseTopic document
   * @param {Object} doc - KnowledgeBaseTopic object
   * @param {string} doc.title - KnowledgeBaseTopic title
   * @param {string} doc.description - KnowledgeBaseTopic description
   * @param {string[]} doc.categoryIds - KnowledgeBaseTopic category ids
   * @param {string} doc.brandId - Id of the brand related to this topic
   * @param {string} userId - User id of the creator of this document
   * @return {Promise} - returns Promise resolving created document
   */
  public static createDoc(docFields, userId) {
    return this.createBaseDoc(docFields, userId);
  }

  /**
   * Update KnowledgeBaseTopic document
   * @param {Object} _id - KnowledgeBaseTopic document id
   * @param {Object} doc - KnowledgeBaseTopic object
   * @param {string} doc.title - KnowledgeBaseTopic title
   * @param {string} doc.description - KnowledgeBaseTopic description
   * @param {string[]} doc.categoryIds - KnowledgeBaseTopic category ids
   * @param {string} doc.brandId - Id of the brand related to this topic
   * @param {string} userId - User id of the modifier of this document
   * @return {Promise} - returns Promise resolving modified document
   */
  public static updateDoc(_id, docFields, userId) {
    return this.updateBaseDoc(_id, docFields, userId);
  }

  /**
   * Removes KnowledgeBaseTopic document and it's children categories
   * @param {Object} _id - KnowledgeBaseTopic document id
   * @return {Promise}
   */
  public static async removeDoc(_id) {
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

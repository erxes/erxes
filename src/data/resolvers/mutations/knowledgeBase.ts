import { KnowledgeBaseArticles, KnowledgeBaseCategories, KnowledgeBaseTopics } from '../../../db/models';
import { ITopic } from '../../../db/models/definitions/knowledgebase';
import { IArticleCreate, ICategoryCreate } from '../../../db/models/KnowledgeBase';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../utils';

const knowledgeBaseMutations = {
  /**
   * Create topic document
   */
  async knowledgeBaseTopicsAdd(_root, { doc }: { doc: ITopic }, { user, docModifier }: IContext) {
    const topic = await KnowledgeBaseTopics.createDoc(docModifier(doc), user._id);

    await putCreateLog(
      {
        type: 'knowledgeBaseTopic',
        newData: JSON.stringify(doc),
        object: topic,
        description: `${topic.title} has been created`,
      },
      user,
    );

    return topic;
  },

  /**
   * Update topic document
   */
  async knowledgeBaseTopicsEdit(_root, { _id, doc }: { _id: string; doc: ITopic }, { user }: IContext) {
    const topic = await KnowledgeBaseTopics.getTopic(_id);
    const updated = await KnowledgeBaseTopics.updateDoc(_id, doc, user._id);

    await putUpdateLog(
      {
        type: 'knowledgeBaseTopic',
        object: topic,
        newData: JSON.stringify(doc),
        description: `${topic.title} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Remove topic document
   */
  async knowledgeBaseTopicsRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const topic = await KnowledgeBaseTopics.getTopic(_id);
    const removed = await KnowledgeBaseTopics.removeDoc(_id);

    await putDeleteLog(
      {
        type: 'knowledgeBaseTopic',
        object: topic,
        description: `${topic.title} has been removed`,
      },
      user,
    );

    return removed;
  },

  /**
   * Create category document
   */
  async knowledgeBaseCategoriesAdd(_root, { doc }: { doc: ICategoryCreate }, { user }: IContext) {
    const kbCategory = await KnowledgeBaseCategories.createDoc(doc, user._id);

    await putCreateLog(
      {
        type: 'knowledgeBaseCategory',
        newData: JSON.stringify(doc),
        description: `${kbCategory.title} has been created`,
        object: kbCategory,
      },
      user,
    );

    return kbCategory;
  },

  /**
   * Update category document
   */
  async knowledgeBaseCategoriesEdit(_root, { _id, doc }: { _id: string; doc: ICategoryCreate }, { user }: IContext) {
    const kbCategory = await KnowledgeBaseCategories.getCategory(_id);
    const updated = await KnowledgeBaseCategories.updateDoc(_id, doc, user._id);

    await putUpdateLog(
      {
        type: 'knowledgeBaseCategory',
        object: kbCategory,
        newData: JSON.stringify(doc),
        description: `${kbCategory.title} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Remove category document
   */
  async knowledgeBaseCategoriesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const kbCategory = await KnowledgeBaseCategories.getCategory(_id);
    const removed = await KnowledgeBaseCategories.removeDoc(_id);

    await putDeleteLog(
      {
        type: 'knowledgeBaseCategory',
        object: kbCategory,
        description: `${kbCategory.title} has been removed`,
      },
      user,
    );

    return removed;
  },

  /**
   * Create article document
   */
  async knowledgeBaseArticlesAdd(_root, { doc }: { doc: IArticleCreate }, { user }: IContext) {
    const kbArticle = await KnowledgeBaseArticles.createDoc(doc, user._id);

    await putCreateLog(
      {
        type: 'knowledgeBaseArticle',
        newData: JSON.stringify(doc),
        description: `${kbArticle.title} has been created`,
        object: kbArticle,
      },
      user,
    );

    return kbArticle;
  },

  /**
   * Update article document
   */
  async knowledgeBaseArticlesEdit(_root, { _id, doc }: { _id: string; doc: IArticleCreate }, { user }: IContext) {
    const kbArticle = await KnowledgeBaseArticles.getArticle(_id);
    const updated = await KnowledgeBaseArticles.updateDoc(_id, doc, user._id);

    await putUpdateLog(
      {
        type: 'knowledgeBaseArticle',
        object: kbArticle,
        newData: JSON.stringify(doc),
        description: `${kbArticle.title} has been edited`,
      },
      user,
    );

    return updated;
  },

  /**
   * Remove article document
   */
  async knowledgeBaseArticlesRemove(_root, { _id }: { _id: string }, { user }: IContext) {
    const kbArticle = await KnowledgeBaseArticles.getArticle(_id);
    const removed = await KnowledgeBaseArticles.removeDoc(_id);

    await putDeleteLog(
      {
        type: 'knowledgeBaseArticle',
        object: kbArticle,
        description: `${kbArticle.title} has been removed`,
      },
      user,
    );

    return removed;
  },
};

moduleCheckPermission(knowledgeBaseMutations, 'manageKnowledgeBase');

export default knowledgeBaseMutations;

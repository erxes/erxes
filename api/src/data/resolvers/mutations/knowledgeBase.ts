import { KnowledgeBaseArticles, KnowledgeBaseCategories, KnowledgeBaseTopics } from '../../../db/models';
import { ITopic } from '../../../db/models/definitions/knowledgebase';
import { IArticleCreate, ICategoryCreate } from '../../../db/models/KnowledgeBase';
import { MODULE_NAMES } from '../../constants';
import { putCreateLog, putDeleteLog, putUpdateLog } from '../../logUtils';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

const knowledgeBaseMutations = {
  /**
   * Creates a topic document
   */
  async knowledgeBaseTopicsAdd(_root, { doc }: { doc: ITopic }, { user, docModifier }: IContext) {
    const topic = await KnowledgeBaseTopics.createDoc(docModifier(doc), user._id);

    await putCreateLog(
      {
        type: MODULE_NAMES.KB_TOPIC,
        newData: { ...doc, createdBy: user._id, createdDate: topic.createdDate },
        object: topic,
      },
      user,
    );

    return topic;
  },

  /**
   * Updates a topic document
   */
  async knowledgeBaseTopicsEdit(_root, { _id, doc }: { _id: string; doc: ITopic }, { user }: IContext) {
    const topic = await KnowledgeBaseTopics.getTopic(_id);
    const updated = await KnowledgeBaseTopics.updateDoc(_id, doc, user._id);

    await putUpdateLog(
      {
        type: MODULE_NAMES.KB_TOPIC,
        object: topic,
        newData: { ...doc, modifiedBy: user._id, modifiedDate: updated.modifiedDate },
        updatedDocument: updated,
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

    await putDeleteLog({ type: MODULE_NAMES.KB_TOPIC, object: topic }, user);

    return removed;
  },

  /**
   * Create category document
   */
  async knowledgeBaseCategoriesAdd(_root, { doc }: { doc: ICategoryCreate }, { user }: IContext) {
    const kbCategory = await KnowledgeBaseCategories.createDoc(doc, user._id);

    await putCreateLog(
      {
        type: MODULE_NAMES.KB_CATEGORY,
        newData: { ...doc, createdBy: user._id, createdDate: kbCategory.createdDate },
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
        type: MODULE_NAMES.KB_CATEGORY,
        object: kbCategory,
        newData: { ...doc, modifiedBy: user._id, modifiedDate: updated.modifiedDate },
        updatedDocument: updated,
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

    await putDeleteLog({ type: MODULE_NAMES.KB_CATEGORY, object: kbCategory }, user);

    return removed;
  },

  /**
   * Create article document
   */
  async knowledgeBaseArticlesAdd(_root, { doc }: { doc: IArticleCreate }, { user }: IContext) {
    const kbArticle = await KnowledgeBaseArticles.createDoc(doc, user._id);

    await putCreateLog(
      {
        type: MODULE_NAMES.KB_ARTICLE,
        newData: { ...doc, createdBy: user._id, createdDate: kbArticle.createdDate },
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
        type: MODULE_NAMES.KB_ARTICLE,
        object: kbArticle,
        newData: { ...doc, modifiedBy: user._id, modifiedDate: updated.modifiedDate },
        updatedDocument: updated,
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

    await putDeleteLog({ type: MODULE_NAMES.KB_ARTICLE, object: kbArticle }, user);

    return removed;
  },
};

moduleCheckPermission(knowledgeBaseMutations, 'manageKnowledgeBase');

export default knowledgeBaseMutations;

import { KnowledgeBaseArticles, KnowledgeBaseCategories, KnowledgeBaseTopics } from '../../../db/models';

import { ITopic } from '../../../db/models/definitions/knowledgebase';
import { IUserDocument } from '../../../db/models/definitions/users';
import { IArticleCreate, ICategoryCreate } from '../../../db/models/KnowledgeBase';
import { moduleRequireLogin } from '../../permissions';

const knowledgeBaseMutations = {
  /**
   * Create topic document
   */
  knowledgeBaseTopicsAdd(_root, { doc }: { doc: ITopic }, { user }: { user: IUserDocument }) {
    return KnowledgeBaseTopics.createDoc(doc, user._id);
  },

  /**
   * Update topic document
   */
  knowledgeBaseTopicsEdit(_root, { _id, doc }: { _id: string; doc: ITopic }, { user }: { user: IUserDocument }) {
    return KnowledgeBaseTopics.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove topic document
   */
  knowledgeBaseTopicsRemove(_root, { _id }: { _id: string }) {
    return KnowledgeBaseTopics.removeDoc(_id);
  },

  /**
   * Create category document
   */
  knowledgeBaseCategoriesAdd(_root, { doc }: { doc: ICategoryCreate }, { user }: { user: IUserDocument }) {
    return KnowledgeBaseCategories.createDoc(doc, user._id);
  },

  /**
   * Update category document
   */
  knowledgeBaseCategoriesEdit(
    _root,
    { _id, doc }: { _id: string; doc: ICategoryCreate },
    { user }: { user: IUserDocument },
  ) {
    return KnowledgeBaseCategories.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove category document
   */
  knowledgeBaseCategoriesRemove(_root, { _id }: { _id: string }) {
    return KnowledgeBaseCategories.removeDoc(_id);
  },

  /**
   * Create article document
   */
  knowledgeBaseArticlesAdd(_root, { doc }: { doc: IArticleCreate }, { user }: { user: IUserDocument }) {
    return KnowledgeBaseArticles.createDoc(doc, user._id);
  },

  /**
   * Update article document
   */
  knowledgeBaseArticlesEdit(
    _root,
    { _id, doc }: { _id: string; doc: IArticleCreate },
    { user }: { user: IUserDocument },
  ) {
    return KnowledgeBaseArticles.updateDoc(_id, doc, user._id);
  },

  /**
   * Remove article document
   */
  knowledgeBaseArticlesRemove(_root, { _id }: { _id: string }) {
    return KnowledgeBaseArticles.removeDoc(_id);
  },
};

moduleRequireLogin(knowledgeBaseMutations);

export default knowledgeBaseMutations;

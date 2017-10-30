import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

export default {
  knowledgeBaseTopicsAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.createDoc(doc, user._id);
  },

  knowledgeBaseTopicsEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.updateDoc(_id, fields, user._id);
  },

  knowledgeBaseTopicsRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.removeDoc(_id);
  },

  knowledgeBaseCategoriesAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.createDoc(doc, user._id);
  },

  knowledgeBaseCategoriesEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.updateDoc(_id, fields, user._id);
  },

  knowledgeBaseCategoriesRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.removeDoc(_id);
  },

  knowledgeBaseArticlesAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.createDoc(doc, user._id);
  },

  knowledgeBaseArticlesEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.updateDoc(_id, fields, user._id);
  },

  knowledgeBaseArticlesRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.removeDoc(_id);
  },
};

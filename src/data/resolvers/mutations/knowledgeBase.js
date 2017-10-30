import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
} from '../../../db/models';

export default {
  topicsAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.createDoc(doc, user._id);
  },

  topicsEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.updateDoc(_id, fields, user._id);
  },

  topicsRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseTopics.removeDoc(_id);
  },

  categoriesAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.createDoc(doc, user._id);
  },

  categoriesEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.updateDoc(_id, fields, user._id);
  },

  categoriesRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseCategories.removeDoc(_id);
  },

  articlesAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.createDoc(doc, user._id);
  },

  articlesEdit(root, { _id, ...fields }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.updateDoc(_id, fields, user._id);
  },

  articlesRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return KnowledgeBaseArticles.removeDoc(_id);
  },
};

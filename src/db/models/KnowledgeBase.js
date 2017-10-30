import mongoose from 'mongoose';
import Random from 'meteor-random';
import { PUBLISH_STATUSES } from '../../data/constants';

const commonFields = {
  createdBy: String,
  createdDate: {
    type: Date,
    default: new Date(),
  },
  modifiedBy: String,
  modifiedDate: Date,
};

class KnowledgeBaseCommonDocument {
  static createDoc(doc, userId) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    return this.create({
      ...doc,
      createdBy: userId,
    });
  }

  static async updateDoc(_id, doc, userId) {
    if (!userId) {
      throw new Error('userId must be supplied');
    }

    await this.update(
      { _id },
      {
        $set: {
          ...doc,
          modifiedBy: userId,
          modifiedDate: new Date(),
        },
      },
    );
    return this.findOne({ _id });
  }

  static removeDoc(_id) {
    return this.remove({ _id });
  }
}

const ArticleSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: PUBLISH_STATUSES.ALL,
    default: PUBLISH_STATUSES.DRAFT,
    required: true,
  },
  ...commonFields,
});

class Article extends KnowledgeBaseCommonDocument {
  static createDoc(doc, userId) {
    return super.createDoc(doc, userId);
  }

  static updateDoc(_id, doc, userId) {
    return super.updateDoc({ _id }, doc, userId);
  }

  static async removeDoc(_id) {
    if ((await KnowledgeBaseCategories.find({ articleIds: _id }).count()) > 0) {
      throw new Error('You can not delete this. This article is used in category.');
    }

    return this.remove({ _id });
  }
}

const CategorySchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  articleIds: {
    type: [String],
    required: false,
  },
  icon: {
    type: String,
    required: true,
  },
  ...commonFields,
});

class Category extends KnowledgeBaseCommonDocument {
  static createDoc({ createdBy, createdDate, modifiedBy, modifiedDate, ...docFields }, userId) {
    return super.createDoc(docFields, userId);
  }

  static updateDoc(
    _id,
    { createdBy, createdDate, modifiedBy, modifiedDate, ...docFields },
    userId,
  ) {
    return super.updateDoc(_id, docFields, userId);
  }

  static async removeDoc(_id) {
    if ((await KnowledgeBaseTopics.find({ categoryIds: _id }).count()) > 0) {
      throw new Error('You can not delete this. This category is used in topic.');
    }

    return this.remove({ _id });
  }
}

const TopicSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  brandId: {
    type: String,
    required: true,
  },
  categoryIds: {
    type: [String],
    required: false,
  },
  ...commonFields,
});

class Topic extends KnowledgeBaseCommonDocument {
  static createDoc({ createdBy, createdDate, modifiedBy, modifiedDate, ...docFields }, userId) {
    return super.createDoc(docFields, userId);
  }

  static updateDoc(
    _id,
    { createdBy, createdDate, modifiedBy, modifiedDate, ...docFields },
    userId,
  ) {
    return super.updateDoc(_id, docFields, userId);
  }
}

ArticleSchema.loadClass(Article);
export const KnowledgeBaseArticles = mongoose.model('knowledgebase_articles', ArticleSchema);

CategorySchema.loadClass(Category);
export const KnowledgeBaseCategories = mongoose.model('knowledgebase_categories', CategorySchema);

TopicSchema.loadClass(Topic);
export const KnowledgeBaseTopics = mongoose.model('knowledgebase_topics', TopicSchema);

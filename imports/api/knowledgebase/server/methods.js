import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { KbTopics, KbCategories, KbArticles } from '../collections';
import { KbTopicsSchema, KbCategoriesSchema, KbArticlesSchema } from '../schema';

// add
export const addKbTopic = new ValidatedMethod({
  name: 'KnowledgeBaseTopic.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check({ ...doc, createdBy: this.userId, createdDate: new Date() }, KbTopicsSchema);
  },

  run({ doc }) {
    return KbTopics.insert({
      ...doc,
      createdBy: this.userId,
      createdDate: new Date(),
    });
  },
});

// edit
export const editKbTopic = new ValidatedMethod({
  name: 'KnowledgeBaseTopic.edit',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, KbTopicsSchema);
  },

  run({ _id, doc }) {
    return KbTopics.update(
      { _id },
      {
        $set: {
          ...doc,
          modifiedBy: this.userId,
          modifiedDate: new Date(),
        },
      },
    );
  },
});

// remove
export const removeKbTopic = new ValidatedMethod({
  name: 'KnowledgeBaseTopic.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return KbTopics.remove(id);
  },
});

// add
export const addKbCategory = new ValidatedMethod({
  name: 'KnowledgeBaseCategory.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check({ ...doc, createdBy: this.userId, createdDate: new Date() }, KbCategoriesSchema);
  },

  run({ doc }) {
    doc = {
      ...doc,
      createdBy: this.userId,
      createdDate: new Date(),
    };
    return KbCategories.insert(doc);
  },
});

// edit
export const editKbCategory = new ValidatedMethod({
  name: 'KnowledgeBaseCategory.edit',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, KbCategoriesSchema);
  },

  run({ _id, doc }) {
    return KbCategories.update(
      { _id },
      {
        $set: {
          ...doc,
          modifiedBy: this.userId,
          modifiedDate: new Date(),
        },
      },
    );
  },
});

// remove
export const removeKbCategory = new ValidatedMethod({
  name: 'KnowledgeBaseCategory.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return KbCategories.remove(id);
  },
});

// add
export const addKbArticle = new ValidatedMethod({
  name: 'KnowledgeBaseArticles.add',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check({ ...doc, createdBy: this.userId, createdDate: new Date() }, KbArticlesSchema);
  },

  run({ doc }) {
    doc = {
      ...doc,
      createdBy: this.userId,
      createdDate: new Date(),
    };
    return KbArticles.insert(doc);
  },
});

// edit
export const editKbArticle = new ValidatedMethod({
  name: 'KnowledgeBaseArticles.edit',
  mixins: [ErxesMixin],

  validate({ _id, createdBy, createdDate, doc }) {
    check(_id, String);
    Object.assign(doc, { createdBy, createdDate: new Date(createdDate) });
    check(doc, KbArticlesSchema);
  },

  run({ _id, doc }) {
    return KbArticles.update(
      { _id },
      {
        $set: {
          ...doc,
          modifiedBy: this.userId,
          modifiedDate: new Date(),
        },
      },
    );
  },
});

// remove
export const removeKbArticle = new ValidatedMethod({
  name: 'KnowledgeBaseArticles.remove',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return KbArticles.remove(id);
  },
});

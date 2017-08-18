import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ErxesMixin } from '/imports/api/utils';
import { KbTopics, KbCategories, KbArticles } from '../collections';

// add
export const addKbTopic = new ValidatedMethod({
  name: 'knowledgebase.addKbTopic',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, { title: String, description: String, brandId: String, categoryIds: Array });
  },

  run({ doc }) {
    doc.createdBy = this.userId;
    doc.createdDate = new Date();
    return KbTopics.insert(Object.assign(doc));
  },
});

// edit
export const editKbTopic = new ValidatedMethod({
  name: 'knowledgebase.editKbTopic',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { title: String, description: String, brandId: String, categoryIds: Array });
  },

  run({ _id, doc }) {
    console.log('doc: ', doc);
    doc.modifiedBy = this.userId;
    doc.modifiedDate = new Date();
    return KbTopics.update({ _id }, { $set: doc });
  },
});

// remove
export const removeKbTopic = new ValidatedMethod({
  name: 'knowledgebase.removeKbTopic',
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
  name: 'knowledgebase.addKbCategory',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, { title: String, description: String, articleIds: Array });
  },

  run({ doc }) {
    doc.createdBy = this.userId;
    doc.createdDate = new Date();
    return KbCategories.insert(Object.assign(doc));
  },
});

// edit
export const editKbCategory = new ValidatedMethod({
  name: 'knowledgebase.editKbCategory',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, { title: String, description: String, articleIds: Array });
  },

  run({ _id, doc }) {
    doc.modifiedBy = this.userId;
    doc.modifiedDate = new Date();
    return KbCategories.update({ _id }, { $set: doc });
  },
});

// remove
export const removeKbCategory = new ValidatedMethod({
  name: 'knowledgebase.removeKbCategory',
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
  name: 'knowledgebase.addKbArticle',
  mixins: [ErxesMixin],

  validate({ doc }) {
    check(doc, {
      title: String,
      summary: String,
      content: String,
    });
  },

  run({ doc }) {
    doc.createdBy = this.userId;
    doc.createdDate = new Date();
    return KbArticles.insert(Object.assign(doc));
  },
});

// edit
export const editKbArticle = new ValidatedMethod({
  name: 'knowledgebase.editKbArticle',
  mixins: [ErxesMixin],

  validate({ _id, doc }) {
    check(_id, String);
    check(doc, {
      title: String,
      summary: String,
      content: String,
    });
  },

  run({ _id, doc }) {
    doc.modifiedBy = this.userId;
    doc.modifiedDate = new Date();
    return KbArticles.update({ _id }, { $set: doc });
  },
});

// remove
export const removeKbArticle = new ValidatedMethod({
  name: 'knowledgebase.removeKbArticle',
  mixins: [ErxesMixin],

  validate(id) {
    check(id, String);
  },

  run(id) {
    return KbArticles.remove(id);
  },
});

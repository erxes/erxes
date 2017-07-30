import faker from 'faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Brands } from '/imports/api/brands/brands';

export const KbTopics = new Mongo.Collection('knowledgebase_topics');
export const KbCategories = new Mongo.Collection('knowledgebase_categories');
export const KbArticles = new Mongo.Collection('knowledgebase_articles');

/* ----------------------- Schemas ----------------------- */

const KbBaseSchema = new SimpleSchema({
  createdUserId: {
    type: String,
    optional: true,
  },
  createdDate: {
    type: Date,
    optional: true,
  },
});

KbTopics.schema = new SimpleSchema({
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  code: {
    type: String,
    optional: true,
  },
  brandId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
});

// topics
KbCategories.schema = new SimpleSchema({
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  topicId: {
    type: String,
  },
});

// articles
KbArticles.schema = new SimpleSchema({
  title: {
    type: String,
  },
  summary: {
    type: String,
  },
  content: {
    type: String,
  },
  categoryId: {
    type: String,
  },
});

/* ----------------------- Collections ----------------------- */

KbTopics.attachSchema(KbTopics.schema);
KbTopics.attachSchema(KbBaseSchema);

KbTopics.helpers({
  brand() {
    return Brands.findOne(this.brandId) || {};
  },
});

KbCategories.attachSchema(KbCategories.schema);
KbCategories.attachSchema(KbBaseSchema);

KbArticles.attachSchema(KbArticles.schema);
KbArticles.attachSchema(KbBaseSchema);

Factory.define('knowledgebase_group', KbTopics, {
  title: () => faker.random.word(),
  description: () => faker.random.word(),
  code: () => Random.id(),
  createdUserId: () => Random.id(),
  createdDate: () => faker.date.recent(),
});

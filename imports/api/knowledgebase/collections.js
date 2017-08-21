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
  createdBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  createdDate: {
    type: Date,
  },
  modifiedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  modifiedDate: {
    type: Date,
    optional: true,
  },
});

// topics
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
  categoryIds: {
    type: [String],
    optional: true,
  },
});

// categories
KbCategories.schema = new SimpleSchema({
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  articleIds: {
    type: [String],
    optional: true,
  },
  icon: {
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
  status: {
    type: String,
    allowedValues: ['draft', 'publish'],
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

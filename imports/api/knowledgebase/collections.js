import faker from 'faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const KbTopics = new Mongo.Collection('knowledgebase_topics');
export const KbCategories = new Mongo.Collection('knowledgebase_categories');
export const KBArticles = new Mongo.Collection('knowledgebase_articles');

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
  groupId: {
    type: String,
  },
});

// articles
KBArticles.schema = new SimpleSchema({
  title: {
    type: String,
  },
  summary: {
    type: String,
  },
  content: {
    type: String,
  },
  topicId: {
    type: String,
  },
});

/* ----------------------- Collections ----------------------- */

KbTopics.attachSchema(KbTopics.schema);
KbTopics.attachSchema(KbBaseSchema);

KbCategories.attachSchema(KbCategories.schema);
KbCategories.attachSchema(KbBaseSchema);

KBArticles.attachSchema(KBArticles.schema);
KBArticles.attachSchema(KbBaseSchema);

Factory.define('knowledgebase_group', KbTopics, {
  title: () => faker.random.word(),
  description: () => faker.random.word(),
  code: () => Random.id(),
  createdUserId: () => Random.id(),
  createdDate: () => faker.date.recent(),
});

import faker from 'faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const KbGroups = new Mongo.Collection('knowledgebase_groups');
export const KBTopics = new Mongo.Collection('knowledgebase_topics');
export const KBArticles = new Mongo.Collection('knowledgebase_articles');

/* ----------------------- Schemas ----------------------- */

const KbBaseSchema = new SimpleSchema({
  code: {
    type: String,
  },
  createdUserId: {
    type: String,
  },
  createdDate: {
    type: Date,
  },
});

KbGroups.schema = new SimpleSchema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  code: {
    type: String,
  },
});

// topics
KBTopics.schema = new SimpleSchema({
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

KbGroups.attachSchema(KbGroups.schema);
KbGroups.attachSchema(KbBaseSchema);

KBTopics.attachSchema(KBTopics.schema);
KBTopics.attachSchema(KbBaseSchema);

KBArticles.attachSchema(KBArticles.schema);
KBArticles.attachSchema(KbBaseSchema);

// fixtures
Factory.define('knowledgebase_group', KbGroups, {
  title: () => faker.random.word(),
  description: () => faker.random.word(),
  code: () => Random.id(),
  createdUserId: () => Random.id(),
  createdDate: () => faker.date.recent(),
});

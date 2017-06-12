import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const KBGroups = new Mongo.Collection('knowledgebase_groups');
export const KBTopics = new Mongo.Collection('knowledgebase_topics');
export const KBArticles = new Mongo.Collection('knowledgebase_articles');

/* ----------------------- Schemas ----------------------- */

const KBBaseSchema = new SimpleSchema({
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

KBGroups.schema = new SimpleSchema({
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

KBGroups.attachSchema(KBGroups.schema);
KBGroups.attachSchema(KBBaseSchema);

KBTopics.attachSchema(KBTopics.schema);
KBTopics.attachSchema(KBBaseSchema);

KBArticles.attachSchema(KBArticles.schema);
KBArticles.attachSchema(KBBaseSchema);

// fixtures

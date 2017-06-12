import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Topics = new Mongo.Collection('knowledgebase_topics');
export const Articles = new Mongo.Collection('knowledgebase_articles');

/* ----------------------- Schemas ----------------------- */

// topics
Topics.schema = new SimpleSchema({
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
});

// articles
Articles.schema = new SimpleSchema({
  title: {
    type: String,
  },
  summary: {
    type: String,
  },
  content: {
    type: String,
  },
});

/* ----------------------- Collections ----------------------- */

Topics.attachScema(Topics.schema);

Articles.attachSchema(Articles.schema);

// fixtures

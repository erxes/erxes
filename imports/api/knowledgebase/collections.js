import { Mongo } from 'meteor/mongo';
import { Brands } from '/imports/api/brands/brands';

/* ----------------------- Collections ----------------------- */
export const KbTopics = new Mongo.Collection('knowledgebase_topics');
export const KbCategories = new Mongo.Collection('knowledgebase_categories');
export const KbArticles = new Mongo.Collection('knowledgebase_articles');

KbTopics.helpers({
  brand() {
    return Brands.findOne(this.brandId) || {};
  },
});

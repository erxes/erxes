import { Mongo } from 'meteor/mongo';
import { Brands } from '/imports/api/brands/brands';
import { KbAutoFieldSchema, KbTopicsSchema, KbCategoriesSchema, KbArticlesSchema } from './schema';

/* ----------------------- Collections ----------------------- */
export const KbTopics = new Mongo.Collection('knowledgebase_topics');
export const KbCategories = new Mongo.Collection('knowledgebase_categories');
export const KbArticles = new Mongo.Collection('knowledgebase_articles');

KbTopics.attachSchema(KbAutoFieldSchema);
KbTopics.attachSchema(KbTopicsSchema);

KbCategories.attachSchema(KbAutoFieldSchema);
KbCategories.attachSchema(KbCategoriesSchema);

KbArticles.attachSchema(KbAutoFieldSchema);
KbArticles.attachSchema(KbArticlesSchema);

KbTopics.helpers({
  brand() {
    return Brands.findOne(this.brandId) || {};
  },
});

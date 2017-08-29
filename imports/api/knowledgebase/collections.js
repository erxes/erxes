import { Mongo } from 'meteor/mongo';
import { Brands } from '/imports/api/brands/brands';
import { KbTopicsSchema, KbCategoriesSchema, KbArticlesSchema } from './schema';

/* ----------------------- Collections ----------------------- */
export const KbTopics = new Mongo.Collection('knowledgebase_topics');
export const KbCategories = new Mongo.Collection('knowledgebase_categories');
export const KbArticles = new Mongo.Collection('knowledgebase_articles');

KbTopics.schema = KbTopicsSchema;
KbTopics.attachSchema(KbTopicsSchema);
KbTopics.helpers({
  brand() {
    return Brands.findOne(this.brandId) || {};
  },
});

KbCategories.schema = KbCategoriesSchema;
KbCategories.attachSchema(KbCategoriesSchema);

KbArticles.schema = KbArticlesSchema;
KbArticles.attachSchema(KbArticlesSchema);

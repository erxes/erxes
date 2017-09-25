import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/* ----------------------- Schemas ----------------------- */

// common fields
const KbAutoFieldSchemaDict = {
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
};

const KbAutoFieldSchema = new SimpleSchema(KbAutoFieldSchemaDict);

// topics
const KbTopicsSchema = new SimpleSchema({
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
const KbCategoriesSchema = new SimpleSchema({
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
const KbArticlesSchema = new SimpleSchema({
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

export { KbAutoFieldSchema, KbTopicsSchema, KbCategoriesSchema, KbArticlesSchema };

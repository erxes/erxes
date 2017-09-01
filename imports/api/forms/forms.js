import faker from 'faker';
import { Random } from 'meteor/random';
import { Factory } from 'meteor/dburles:factory';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Forms = new Mongo.Collection('forms');
export const Fields = new Mongo.Collection('form_fields');

/* ----------------------- Schemas ----------------------- */

// forms
Forms.schema = new SimpleSchema({
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
});

const FormSchemaExtra = new SimpleSchema({
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

// fields
Fields.schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: [
      'input',
      'textarea',
      'radio',
      'check',
      'select',
      'divider',
      'email',
      'firstName',
      'lastName',
    ],
  },
  validation: {
    type: String,
    optional: true,
    allowedValues: ['', 'number', 'date', 'email'],
  },
  text: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },

  // for radio, check, select, choices
  options: {
    type: [String],
    optional: true,
  },

  isRequired: {
    type: Boolean,
  },
});

const FieldSchemaExtra = new SimpleSchema({
  formId: {
    type: String,
  },
  order: {
    type: Number,
    optional: true,
  },
});

/* ----------------------- Collections ----------------------- */

Forms.attachSchema(Forms.schema);
Forms.attachSchema(FormSchemaExtra);

Fields.attachSchema(Fields.schema);
Fields.attachSchema(FieldSchemaExtra);

Factory.define('form', Forms, {
  title: () => faker.random.word(),
  code: () => Random.id(),
  description: () => faker.random.word(),
  createdUserId: () => Random.id(),
  createdDate: () => faker.date.recent(),
});

Factory.define('formField', Fields, {
  formId: () => Random.id(),
  type: 'input',
  isRequired: false,
  order: () => faker.random.number(),
});

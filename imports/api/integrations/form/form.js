import { _ } from 'meteor/underscore';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// fix required field empty string problem
SimpleSchema.addValidator(function addValidator() {
  if (!this.definition.optional) {
    if (this.value === null || this.value === '') {
      return 'required';
    }

    if (_.isArray(this.value) && this.value.length === 0) {
      return 'required';
    }
  }

  return null;
});


/* ----------------------- Schemas ----------------------- */

// forms
const FormSchema = new SimpleSchema({
  title: {
    type: String,
    unique: true,
  },

  code: {
    type: String,
  },
});


const FormSchemaExtra = new SimpleSchema({
  createdUser: {
    type: String,
  },

  createdDate: {
    type: Date,
  },
});


// fields
const FieldSchema = new SimpleSchema({
  type: {
    type: String,
    autoform: {
      type: 'select',
      firstOption: 'Select an option ...',
      options() {
        return [
          { label: 'Input', value: 'input' },
          { label: 'Textarea', value: 'textarea' },
          { label: 'Radio', value: 'radio' },
          { label: 'Checkbox', value: 'check' },
          { label: 'Select', value: 'select' },
          { label: 'Divider', value: 'divider' },
        ];
      },
    },
  },

  check: {
    type: String,
    optional: true,
    autoform: {
      type: 'select',
      firstOption: 'Select an option ...',
      options() {
        return [
          { label: 'Number', value: 'number' },
          { label: 'Date', value: 'date' },
          { label: 'Email', value: 'email' },
        ];
      },
    },
  },

  text: {
    type: String,
  },

  name: {
    type: String,
    optional: true,
    regEx: /^[a-z0-9A-Z]*$/,
    max: 50,
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


const FormsCollection = new Mongo.Collection('integrations_forms');
FormsCollection.attachSchema(FormSchema);
FormsCollection.attachSchema(FormSchemaExtra);


const FieldsCollection = new Mongo.Collection('integrations_form_fields');

FieldsCollection.attachSchema(FieldSchema);
FieldsCollection.attachSchema(FieldSchemaExtra);


// exports
export const Schemas = {
  Form: FormSchema,
  Field: FieldSchema,
};

export const Collections = {
  Forms: FormsCollection,
  Fields: FieldsCollection,
};

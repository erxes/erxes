import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// Email template collection
class Collection extends Mongo.Collection {}

export const EmailTemplates = new Collection('email_templates');

EmailTemplates.schema = new SimpleSchema({
  name: {
    type: String,
  },
  content: {
    type: String,
  },
});

EmailTemplates.attachSchema(EmailTemplates.schema);

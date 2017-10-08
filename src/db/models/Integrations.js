import mongoose from 'mongoose';
import Random from 'meteor-random';
import { Messages, Conversations } from './Conversations';
import { Customers } from './Customers';
import { KIND_CHOICES, FORM_SUCCESS_ACTIONS, FORM_LOAD_TYPES } from '../constants';

const MessengerOnlineHoursSchema = mongoose.Schema({
  _id: {
    type: String,
  },
  day: {
    type: String,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
  },
});

const MessengerDataSchema = mongoose.Schema({
  notifyCustomer: {
    type: Boolean,
  },

  // manual, auto
  availabilityMethod: {
    type: String,
    enum: ['manual', 'auto'],
  },
  isOnline: {
    type: Boolean,
  },
  onlineHours: [MessengerOnlineHoursSchema],
  timezone: {
    type: String,
  },
  welcomeMessage: {
    type: String,
  },
  awayMessage: {
    type: String,
  },
  thankYouMessage: {
    type: String,
  },
});

const FormDataSchema = mongoose.Schema({
  loadType: {
    type: String,
    enum: FORM_LOAD_TYPES.ALL_LIST,
  },
  successAction: {
    type: String,
    enum: FORM_SUCCESS_ACTIONS.ALL_LIST,
  },
  fromEmail: {
    type: String,
  },
  userEmailTitle: {
    type: String,
  },
  userEmailContent: {
    type: String,
  },
  adminEmails: {
    type: [String],
  },
  adminEmailTitle: {
    type: String,
  },
  adminEmailContent: {
    type: String,
  },
  thankContent: {
    type: String,
  },
  redirectUrl: {
    type: String,
  },
});

const UiOptionsSchema = mongoose.Schema({
  color: String,
  wallpaper: String,
  logo: String,
});

const IntegrationSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => Random.id(),
  },
  kind: String,
  name: String,
  brandId: String,
  formId: String,
  formData: FormDataSchema,
  messengerData: MessengerDataSchema,
  twitterData: Object,
  facebookData: Object,
  uiOptions: UiOptionsSchema,
});

class Integration {
  static generateFormDoc(mainDoc, formData) {
    return {
      ...mainDoc,
      kind: KIND_CHOICES.FORM,
      formData,
    };
  }

  static createIntegration(doc) {
    return this.create(doc);
  }

  static createMessengerIntegration({ name, brandId }) {
    return this.createIntegration({
      name,
      brandId,
      kind: KIND_CHOICES.MESSENGER,
    });
  }

  static updateMessengerIntegration(_id, { name, brandId }) {
    return this.update({ _id }, { $set: { name, brandId } }, { runValidators: true });
  }

  static saveMessengerAppearanceData(_id, { color, wallpaper, logo }) {
    return this.update(
      { _id },
      { $set: { uiOptions: { color, wallpaper, logo } } },
      { runValdatiors: true },
    );
  }

  static saveMessengerConfigs(_id, messengerData) {
    return this.update({ _id }, { $set: { messengerData } }, { runValidators: true });
  }

  static createFormIntegration({ formData, ...mainDoc }) {
    const doc = this.generateFormDoc(mainDoc, formData);

    if (Object.keys(formData || {}).length === 0) {
      throw 'formData must be supplied';
    }

    return this.create(doc);
  }

  static updateFormIntegration(id, { formData, ...mainDoc }) {
    const doc = this.generateFormDoc(mainDoc, formData);
    return this.update({ _id: id }, { $set: doc }, { runValidators: true });
  }

  static async removeIntegration(id) {
    const conversations = await Conversations.find({ integrationId: id }, { _id: true });

    const conversationIds = [];
    conversations.forEach(c => {
      conversationIds.push(c._id);
    });

    // Remove messages
    await Messages.remove({ conversationId: { $in: conversationIds } });

    // Remove conversations
    await Conversations.remove({ integrationId: id });

    // Remove customers
    await Customers.remove({ integrationId: id });

    return this.remove(id);
  }
}

IntegrationSchema.loadClass(Integration);
export default mongoose.model('integrations', IntegrationSchema);

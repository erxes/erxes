import { TemplateManager } from 'erxes-api-shared/core-modules';
import {
  IUserDocument
} from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { FRONTLINE_TEMPLATE_EXCLUDE_FIELDS } from './constants';

export default {
  moduleName: 'form',
  collectionName: 'form',

  label: 'Form',
  description: 'Form Template',
  icon: 'IconCategory',

  getContent: async ({
    template,
    models,
  }: {
    template: any;
    models: IModels;
  }) => {
    const { contentId, configs } = template || {};

    if (!contentId) {
      throw new Error('Content ID missing');
    }

    const form = await models.Forms.findOne({ _id: contentId }).lean();

    if (!form) {
      throw new Error('Document not found');
    }

    const channel = await models.Channels.findOne({ _id: form.channelId }).lean();

    if (!channel) {
      throw new Error('Document not found');
    }

    try {
      const fields = await models.Fields.find({ contentTypeId: form._id }).lean();

      const templateManager = new TemplateManager(FRONTLINE_TEMPLATE_EXCLUDE_FIELDS);

      return templateManager.getContent({
        channel: [channel],
        form: [form],
        fields
      });
    } catch (error) {
      throw new Error(`Error occurred while generating content: ${error}`);
    }
  },

  setContent: async ({
    template,
    models,
    user,
  }: {
    template: any;
    models: IModels;
    user: IUserDocument;
  }) => {
    const { content } = template || {};

    if (!Object.keys(content).length) {
      throw new Error(`Template doesn't have any content`);
    }

    const templateManager = new TemplateManager({}, { createdBy: user._id });

    try {
      const { channel = [], form = [], fields = [] } = templateManager.setContent(content);

      if (channel.length !== 1) {
        throw new Error(`Expected exactly one channel, received ${channel.length}.`);
      }
      
      const document = await models.Channels.create(channel[0]);

      if (document) {
        await models.ChannelMembers.create({ channelId: document._id, memberId: user._id, role: 'admin' })
      }

      if (form?.length) {
        await models.Forms.insertMany(form);
      }

      if (fields.length) {
        await models.Fields.insertMany(fields);
      }

      return `/settings/frontline/channels/${document._id}/forms`;
    } catch (error) {
      throw new Error(`Error occurred while installing template: ${error}`);
    }
  },
};

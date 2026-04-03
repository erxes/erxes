import { IContext } from '~/connectionResolvers';
import { IFormDocument } from '../../../db/definitions/forms';

export const Form = {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Forms.findOne({ _id });
  },
  async createdUser(form: IFormDocument, _params) {
    if (!form.createdUserId) {
      return;
    }

    return {
      __typename: 'User',
      _id: form.createdUserId,
    };
  },

  async fields(form: IFormDocument, _params, { models }: IContext) {
    const fields = await models.Fields.find({
      contentType: 'form',
      contentTypeId: form._id,
    }).sort({
      order: 1,
    });

    const subFieldIds = fields
      .filter((f) => f.subFieldIds)
      .map((f) => f.subFieldIds)
      .flat();

    return fields.filter((f) => !subFieldIds.includes(f._id));
  },

  async channel(form: IFormDocument, _params, { models }: IContext) {
    if (!form.channelId) {
      return null;
    }

    return models.Channels.findOne({ _id: form.channelId });
  },
};

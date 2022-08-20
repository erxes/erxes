import { IContext } from '../../../connectionResolver';
import { sendInboxMessage } from '../../../messageBroker';

const adsMutations = {
  formSubmissionsEdit: async (_root, params, { models, subdomain }) => {
    const { contentTypeId, customerId, submissions } = params;
    // const conversation = await models.Conversations.findOne({
    //   _id: contentTypeId,
    //   customerId,
    // }).lean();

    const conversation = await sendInboxMessage({
      subdomain,
      action: 'findOne',
      data: {
        _id: contentTypeId,
        customerId
      },
      isRPC: true,
      defaultValue: {}
    });

    if (!conversation) {
      throw new Error('Form submission not found !');
    }

    for (const submission of submissions) {
      const { _id, value } = submission;
      await models.FormSubmissions.updateOne({ _id }, { $set: { value } });
    }

    const formSubmissions = await models.FormSubmissions.find({
      contentTypeId
    }).lean();

    return {
      ...conversation,
      contentTypeId: conversation._id,
      submissions: formSubmissions
    };
  },

  formSubmissionsRemove: async (_root, params, { models }) => {
    const { customerId, contentTypeId } = params;
    const removed = await models.Conversations.deleteOne({
      customerId,
      _id: contentTypeId
    });

    await models.FormSubmissions.remove({ customerId, contentTypeId });

    return removed;
  },
  adReviewAdd: async (_root, params, { models: { AdReview } }: IContext) => {
    const { adId, review } = params;
    const added = await AdReview.createAdReview({ adId, review });
    return added;
  }
};

export default adsMutations;

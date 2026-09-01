import { markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const callProMutations = {
  async callProCustomerSelect(
    _root,
    {
      conversationId,
      customerId,
    }: { conversationId: string; customerId: string },
    { models }: IContext,
  ) {
    const conversation =
      await models.Conversations.getConversation(conversationId);

    if (
      (conversation.callProPotentialCustomerIds || []).length > 0 &&
      !conversation.callProPotentialCustomerIds?.includes(customerId)
    ) {
      throw new Error('Customer is not a candidate for this conversation');
    }

    await models.Conversations.updateConversation(conversationId, {
      customerId,
      callProPotentialCustomerIds: [],
    });

    return models.Conversations.getConversation(conversationId);
  },
};

markResolvers(callProMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});

export default callProMutations;

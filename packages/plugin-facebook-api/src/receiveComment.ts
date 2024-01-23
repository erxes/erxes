import { IModels } from './connectionResolver';
import {
  getOrCreateComment,
  getOrCreateCustomer,
  getOrCreatePost,
  getOrCreatePostConversation,
} from './store';
import { ICommentParams } from './types';
import { INTEGRATION_KINDS } from './constants';
import { sendInboxMessage } from './messageBroker';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

const receiveComment = async (
  models: IModels,
  subdomain: string,
  params: ICommentParams,
  pageId: string,
) => {
  const userId = params.from.id;
  const postId = params.post_id;
  const integration = await models.Integrations.findOne({
    $and: [
      { facebookPageIds: { $in: pageId } },
      { kind: INTEGRATION_KINDS.POST },
    ],
  });

  if (userId === pageId) {
    return;
  }
  if (!integration) {
    throw new Error('Integration not found');
  }

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    INTEGRATION_KINDS.POST,
  );
  const postConversation = await getOrCreatePostConversation(
    models,
    subdomain,
    postId,
    integration,
    customer,
    params,
  );
  await getOrCreateComment(
    models,
    subdomain,
    postConversation,
    params,
    pageId,
    userId,
    params.verb || '',
    integration,
    customer,
  );
  // try {
  //   if (comment) {
  //     await sendInboxMessage({
  //       subdomain,
  //       action: 'conversationClientMessageInserted',
  //       data: {
  //         integrationId: integration.erxesApiId,
  //         conversationId: comment,
  //       },
  //     });
  //   } else {
  //     console.log('Warning: The comment is undefined.');
  //   }
  // } catch (e) {
  //   throw new Error(
  //     e.message.includes('duplicate')
  //       ? 'Concurrent request: conversation message duplication'
  //       : e,
  //   );
  // }
};

export default receiveComment;

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
import { putCreateLog } from './logUtils';

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
  const comment = await getOrCreateComment(
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
  try {
    if (comment) {
      await sendInboxMessage({
        subdomain,
        action: 'conversationClientMessageInserted',
        data: {
          integrationId: integration.erxesApiId,
          conversationId: comment,
        },
      });
      graphqlPubsub.publish(`conversationMessageInserted:${comment}`, {
        conversationMessageInserted: {
          // ...created.toObject(),
          conversationId: comment,
        },
      });

      // conversationMessage = created;

      // try {
      //   await putCreateLog(
      //     models,
      //     subdomain,
      //     {
      //       type: 'messages',
      //       newData: postConversation,
      //       object: {
      //         ...conversationMessage.toObject(),
      //         payload: JSON.parse(message.payload || '{}')
      //       }
      //     },
      //     customer._id
      //   );
      // } catch (error) {}
    } else {
      console.log('Warning: The comment is undefined.');
    }
  } catch (e) {
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: conversation message duplication'
        : e,
    );
  }
};

export default receiveComment;

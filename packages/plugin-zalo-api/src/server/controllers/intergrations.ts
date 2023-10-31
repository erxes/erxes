import { debug } from '../../configs';
import { IModels } from '../../models';
import { convertAttachment } from '../../utils';
import { zaloGet } from '../../zalo';
import { createOrUpdateConversation } from './conversations';
import { createOrUpdateCustomer, isFollowedUser } from './customers';
const querystring = require('querystring');

export const zaloCreateIntegration = async (
  models: IModels,
  subdomain: any,
  { accountId, integrationId, data, kind }
) => {
  const account = await models.Accounts.getAccount({ _id: accountId });
  const oa_id = account?.oa_id;
  let integration;
  try {
    integration = await models.Integrations.create({
      kind,
      accountId,
      erxesApiId: integrationId,
      oa_id
    });
  } catch (e) {
    // debug.error(
    //     `zaloCreateIntegration: Failed to create Integrations: ${e.message}`
    // );
  }

  const recentMessages = await zaloGet(
    `listrecentchat?data={"offset":0,"count":10}`,
    { models, oa_id }
  );
  // 1. This request does not return conversation_id per message

  debug.error(`recentMessages: ${querystring.stringify(recentMessages)}`);

  if (recentMessages.error === 0) {
    recentMessages?.data?.map(async (recentMessage: any) => {
      let {
        src,
        time,
        type,
        message_id,
        from_id,
        to_id,
        from_display_name,
        to_display_name,
        from_avatar,
        to_avatar,
        message,
        url,
        thumb,
        location
      } = recentMessage;

      const userId = src ? from_id : to_id;
      const firstName = src ? from_display_name : to_display_name;
      const avatar = src ? from_avatar : to_avatar;
      type = type === 'photo' ? 'image' : type.toLowerCase();
      let msg_id = message_id;

      if (!src) {
        let findUserMessages = await zaloGet(
          `conversation?data={"user_id": ${userId},"offset":0,"count":10}`,
          { models, oa_id }
        );

        findUserMessages =
          findUserMessages?.data?.length > 1
            ? findUserMessages?.data?.filter(({ src }) => src === 1)
            : [];
        msg_id = findUserMessages?.[0]?.message_id;
      }

      console.log(recentMessage);

      const customer = await createOrUpdateCustomer(models, subdomain, {
        userId,
        oa_id,
        firstName,
        integrationId,
        profilePic: avatar,
        checkFollower: true
      });

      // Check if user is follower first.
      // The conversation with anonymous user need the conversation_id.
      // Unless we can not send the message to this kind of user

      // So we don't need to create a conversation.
      // if( ! customer.isFollower ) return

      console.log('integration createOrUpdateCustomer:', customer);

      let attachment: { [key: string]: any } = {
        type // text, image, sticker, GIF, location, voice, link, links,
      };

      if (thumb || url) attachment.payload = {};

      if (thumb) attachment.payload.thumbnail = thumb;
      if (url) attachment.payload.url = url;
      if (location) attachment.coordinates = location;

      console.log(attachment);

      await createOrUpdateConversation(models, subdomain, {
        integrationId: integration._id,
        userId,
        oa_id,
        customerId: customer?.erxesApiId,
        integrationErxesApiId: integrationId,
        isOASend: !src,
        message: {
          timestamp: time,
          text: message,
          msg_id,
          attachments: convertAttachment([attachment])
        }
      });
    });
  }

  //   const oaTokensMap: { [key: string]: string } = {};

  //   for (const pageId of oa_id) {
  //       try {
  //           const pageAccessToken = await getPageAccessToken(
  //               pageId,
  //               account.token
  //           );

  //           oaTokensMap[pageId] = pageAccessToken;

  //           try {
  //               // await subscribePage(pageId, pageAccessToken);
  //               // debugFacebook(`Successfully subscribed page ${pageId}`);
  //           } catch (e) {
  //               // debugError(
  //               //     `Error ocurred while trying to subscribe page ${e.message ||
  //               //         e}`
  //               // );
  //               throw e;
  //           }
  //       } catch (e) {
  //           // debugError(
  //           //     `Error ocurred while trying to get page access token with ${e.message ||
  //           //         e}`
  //           // );

  //           throw e;
  //       }
  //   }

  // integration.facebookPageTokensMap = facebookPageTokensMap;

  //   await integration.save();

  return { status: 'success' };
};

export const removeIntegration = async (
  models: IModels,
  integrationErxesApiId: string
): Promise<string> => {
  const integration = await models.Integrations.findOne({
    erxesApiId: integrationErxesApiId
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const { _id, kind, accountId, erxesApiId } = integration;

  // const account = await models.Accounts.findOne({ _id: accountId });

  const selector = { integrationId: _id };

  if (kind.includes('zalo')) {
    //   debugFacebook('Removing entries');

    // if (!account) {
    //     throw new Error("Account not found");
    // }

    //   for (const pageId of integration.oa_id || []) {
    // let pageTokenResponse;

    // try {
    //   pageTokenResponse = await getPageAccessToken(pageId, account.token);
    // } catch (e) {
    //   debugError(
    //     `Error ocurred while trying to get page access token with ${e.message}`
    //   );
    // }

    // await models.Posts.deleteMany({ recipientId: pageId });
    // await models.Comments.deleteMany({ recipientId: pageId });

    // try {
    //   await unsubscribePage(pageId, pageTokenResponse);
    // } catch (e) {
    //   debugError(
    //     `Error occured while trying to unsubscribe page pageId: ${pageId}`
    //   );
    // }
    //   }

    const conversationIds = await models.Conversations.find(selector).distinct(
      '_id'
    );

    await models.Customers.deleteMany({
      integrationId: integrationErxesApiId
    });

    await models.Conversations.deleteMany(selector);
    await models.ConversationMessages.deleteMany({
      conversationId: { $in: conversationIds }
    });

    await models.Integrations.deleteOne({ _id });
  }

  await models.Integrations.deleteOne({ _id });

  return erxesApiId;
};

import { Meteor } from 'meteor/meteor';
import Twit from 'twit';
import soc from 'social-oauth-client';

import { Integrations } from '/imports/api/integrations/integrations';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/conversations/messages';
import { Customers } from '/imports/api/customers/customers';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';

/*
 * get or create customer using twitter data
 */
const getOrCreateCustomer = (integrationId, user) => {
  const customer = Customers.findOne({
    integrationId,
    'twitterData.id': user.id,
  });

  if (customer) {
    return customer._id;
  }

  // create customer
  return Customers.insert({
    name: user.name,
    integrationId,
    twitterData: {
      id: user.id,
      idStr: user.id_str,
      name: user.name,
      screenName: user.screen_name,
      profileImageUrl: user.profile_image_url,
    },
  });
};


/*
 * create new message
 */
const createMessage = (conversation, content, user) => {
  if (conversation) {
    // create new message
    Messages.insert({
      conversationId: conversation._id,
      customerId: getOrCreateCustomer(conversation.integrationId, user),
      content,
      internal: false,
    });
  }
};


/*
 * create new conversation by regular tweet
 */
export const getOrCreateCommonConversation = (data, integration) => {
  let conversation;

  if (data.in_reply_to_status_id) {
    // find conversation by tweet id
    conversation = Conversations.findOne({
      'twitterData.id': data.in_reply_to_status_id,
    });

    // reset read state
    Conversations.update(
      { _id: conversation._id },
      { $set: { readUserIds: [] } }
    );

  // create new conversation
  } else {
    const conversationId = Conversations.insert({
      content: data.text,
      integrationId: integration._id,
      customerId: getOrCreateCustomer(integration._id, data.user),
      status: CONVERSATION_STATUSES.NEW,

      // save tweet id
      twitterData: {
        id: data.id,
        idStr: data.id_str,
        screenName: data.user.screen_name,
        isDirectMessage: false,
      },
    });
    conversation = Conversations.findOne(conversationId);
  }

  // create new message
  createMessage(conversation, data.text, data.user);
};


/*
 * create new conversation by direct message
 */
export const getOrCreateDirectMessageConversation = (data, integration) => {
  let conversation = Conversations.findOne({
    'twitterData.isDirectMessage': true,
    $or: [
      {
        'twitterData.directMessage.senderId': data.sender_id,
        'twitterData.directMessage.recipientId': data.recipient_id,
      },
      {
        'twitterData.directMessage.senderId': data.recipient_id,
        'twitterData.directMessage.recipientId': data.sender_id,
      },
    ],
  });

  if (conversation) {
    // reset read state
    Conversations.update(
      { _id: conversation._id },
      { $set: { readUserIds: [] } }
    );

  // create new conversation
  } else {
    const conversationId = Conversations.insert({
      content: data.text,
      integrationId: integration._id,
      customerId: getOrCreateCustomer(integration._id, data.sender),
      status: CONVERSATION_STATUSES.NEW,

      // save tweet id
      twitterData: {
        id: data.id,
        idStr: data.id_str,
        screenName: data.sender.screen_name,
        isDirectMessage: true,
        directMessage: {
          senderId: data.sender_id,
          senderIdStr: data.sender_id_str,
          recipientId: data.recipient_id,
          recipientIdStr: data.recipient_id_str,
        },
      },
    });
    conversation = Conversations.findOne(conversationId);
  }

  // create new message
  createMessage(conversation, data.text, data.sender);
};

// save twit instances by integration id
export const TwitMap = {};

const trackIntegration = (integration) => {
  const integrationUserId = integration.twitterData.id;

  // Twit instance
  const twit = new Twit({
    consumer_key: Meteor.settings.TWITTER_CONSUMER_KEY,
    consumer_secret: Meteor.settings.TWITTER_CONSUMER_SECRET,
    access_token: integration.twitterData.token,
    access_token_secret: integration.twitterData.tokenSecret,
  });

  // save twit instance
  TwitMap[integration._id] = twit;

  // create stream
  const stream = twit.stream('user');

  // listen for timeline
  stream.on('tweet', Meteor.bindEnvironment((data) => {
    // if user is replying to some tweet
    if (data.in_reply_to_status_id) {
      const conversation = Conversations.findOne({
        'twitterData.id': data.in_reply_to_status_id,
      });

      // and that tweet must exists
      if (conversation) {
        return getOrCreateCommonConversation(data, integration);
      }
    }

    for (const mention of data.entities.user_mentions) {
      // listen for only mentioned tweets
      if (mention.id === integrationUserId) {
        getOrCreateCommonConversation(data, integration);
      }
    }

    return null;
  }));

  // listen for direct messages
  stream.on('direct_message', Meteor.bindEnvironment((data) => {
    getOrCreateDirectMessageConversation(data.direct_message, integration);
  }));
};

// track all twitter integrations for the first time
Integrations.find({ kind: KIND_CHOICES.TWITTER }).forEach((integration) => {
  trackIntegration(integration);
});

/*
 * post reply to twitter
 */
export const tweetReply = (conversation, text) => {
  const twit = TwitMap[conversation.integrationId];
  const twitterData = conversation.twitterData;

  // send direct message
  if (conversation.twitterData.isDirectMessage) {
    return twit.post(
      'direct_messages/new',
      {
        user_id: twitterData.directMessage.senderIdStr,
        text,
      }
    );
  }

  // send reply
  return twit.post(
    'statuses/update',
    {
      status: `@${twitterData.screenName} ${text}`,

      // replying tweet id
      in_reply_to_status_id: twitterData.idStr,
    }
  );
};

// twitter oauth ===============
const socTwitter = new soc.Twitter({
  CONSUMER_KEY: Meteor.settings.TWITTER_CONSUMER_KEY,
  CONSUMER_SECRET: Meteor.settings.TWITTER_CONSUMER_SECRET,
  REDIRECT_URL: Meteor.settings.TWITTER_REDIRECT_URL,
});

Meteor.methods({
  'integrations.getTwitterAuthorizeUrl': () => socTwitter.getAuthorizeUrl(),
});

export default {
  trackIntegration,
  tweetReply,
  soc: socTwitter,

  authenticate: (queryParams, callback) => {
    // after user clicked authenticate button
    socTwitter.callback({ query: queryParams }).then(
      Meteor.bindEnvironment((data) => {
        // return integration info
        callback({
          name: data.info.name,
          twitterData: {
            id: data.info.id,
            token: data.tokens.auth.token,
            tokenSecret: data.tokens.auth.token_secret,
          },
        });
      })
    );
  },
};

import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import { Botkit } from 'botkit';
import ApiConversationMessages from '../models/ConversationMessages';
import ApiConversations from '../models/Conversations';
import ApiCustomers from '../models/Customers';
import loginMiddleware from './loginMiddleware';
import { Conversations, Customers } from './models';

const init = async app => {
  app.get('/fblogin', loginMiddleware);

  const adapter = new FacebookAdapter({
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    access_token: process.env.FACEBOOK_ACCESS_TOKEN,
    app_secret: process.env.FACEBOOK_APP_SECRET,
  });

  const controller = new Botkit({
    webhook_uri: '/facebook/receive',
    webserver: app,
    adapter,
  });

  const api = await adapter.getAPI(controller.getConfig());

  // Once the bot has booted up its internal services, you can use them to do stuff.
  controller.ready(() => {
    controller.on('message', async (bot, message) => {
      // get customer
      let customer = await Customers.findOne({ userId: message.user });

      // create customer
      if (!customer) {
        const response = await api.callAPI(`/${message.user}`, 'GET', {});

        // save on api
        const apiCustomer = await ApiCustomers.create({
          firstName: response.first_name,
          lastName: response.last_name,
          avatar: response.profile_pic,
        });

        // save on integrations db
        customer = await Customers.create({
          userId: message.user,
          erxesApiId: apiCustomer._id,
          firstName: response.first_name,
          lastName: response.last_name,
          profilePic: response.profile_pic,
        });
      }

      // get conversation
      let conversation = await Conversations.findOne({
        senderId: message.sender.id,
        recipientId: message.recipient.id,
      });

      // create conversation
      if (!conversation) {
        // save on api
        const apiConversation = await ApiConversations.create({
          createdAt: new Date(),
          messageCount: 0,
          content: message.text,
        });

        // save on integrations db
        conversation = await Conversations.create({
          erxesApiId: apiConversation._id,
          timestamp: message.timestamp,
          senderId: message.sender.id,
          recipientId: message.recipient.id,
          content: message.text,
        });
      }

      // save message on api
      await ApiConversationMessages.create({
        createdAt: new Date(),
        content: message.text,
        conversationId: conversation.erxesApiId,
        customerId: customer.erxesApiId,
        internal: false,
      });

      await bot.reply(message, 'Welcome to the channel!');
    });
  });
};

export default init;
